import { jioSaavnApi } from '../client-api/jiosaavn';
import { itunesApi } from '../client-api/itunes';
import { youtubeApi } from '../client-api/youtube';
import { musicBrainzApi } from '../client-api/musicbrainz';
import { CURATED_FEATURED_SONGS, CURATED_ALBUMS, CURATED_ARTISTS } from '../client-api/sources';
import { getArtistImage } from '../constants/artistImages';
import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';
import { dbStorage } from '../database/storage';
import { deduplicateSongs } from '../utils/filterMusic';

export const musicApi = {
  async getFeed(): Promise<{
    featured: Song[];
    trending: Song[];
    newReleases: Song[];
    chillOut: Song[];
  }> {
    try {
      // Parallel fetch across JioSaavn queries (all returning 100% full-length 320kbps tracks)
      const [
        saavnTrending,
        saavnTamil,
        saavnNew,
        saavnBollywood,
        saavnGlobalHits,
        saavnChill,
        ytTamilTrending,
        ytGlobalTrending
      ] = await Promise.all([
        jioSaavnApi.getTrendingSongs(30).catch(() => []),
        jioSaavnApi.searchSongs('Top Tamil Hits Anirudh AR Rahman 2024', 25).catch(() => []),
        jioSaavnApi.searchSongs('Latest Indian and Global Hits 2024', 25).catch(() => []),
        jioSaavnApi.searchSongs('Top Bollywood Trending Hits Arijit Singh', 20).catch(() => []),
        jioSaavnApi.searchSongs('Top English Pop Hits Taylor Swift The Weeknd Ed Sheeran', 25).catch(() => []),
        jioSaavnApi.searchSongs('Lo-Fi Chill Acoustic Melodies Instrumental', 20).catch(() => []),
        youtubeApi.searchSongs('Top Trending Tamil Songs 2024 Anirudh', 10).catch(() => []),
        youtubeApi.searchSongs('Trending YouTube Music Hits 2024', 10).catch(() => [])
      ]);

      const dedupe = (list: Song[]): Song[] => {
        const seen = new Set<string>();
        return list.filter((s) => {
          if (!s.audioUrl || seen.has(s.id)) return false;
          // Discard 30-sec previews from the home feed so users only get full songs
          if (
            s.audioUrl.includes('apple.com') ||
            s.audioUrl.includes('AudioPreview') ||
            s.audioUrl.includes('mzstatic')
          ) {
            return false;
          }
          seen.add(s.id);
          return true;
        });
      };

      const allTrending = dedupe([
        ...CURATED_FEATURED_SONGS,
        ...saavnTrending,
        ...saavnTamil,
        ...saavnGlobalHits,
        ...saavnBollywood,
        ...ytTamilTrending,
        ...ytGlobalTrending
      ]);

      const featured = allTrending.slice(0, 15);
      const trending = allTrending.length > 0 ? allTrending : CURATED_FEATURED_SONGS;
      const newDrops = dedupe([...saavnNew, ...saavnGlobalHits, ...ytTamilTrending, ...saavnTamil.slice(6)]);
      const chillTracks = dedupe([
        ...saavnChill,
        ...trending.filter((s) =>
          ['Lo-Fi', 'Chill', 'Acoustic', 'Melody', 'Ambient', 'Piano'].some((g) =>
            (s.genre || '').includes(g) || (s.title || '').includes(g)
          )
        ),
        ...CURATED_FEATURED_SONGS.filter((s) => (s.genre || '').includes('Melody') || (s.genre || '').includes('Romantic'))
      ]);

      return {
        featured: featured.length > 0 ? featured : CURATED_FEATURED_SONGS.slice(0, 8),
        trending: trending.length > 0 ? trending : CURATED_FEATURED_SONGS,
        newReleases: newDrops.length > 0 ? newDrops : trending.slice(2, 16),
        chillOut: chillTracks.length > 0 ? chillTracks : CURATED_FEATURED_SONGS
      };
    } catch (error) {
      console.warn('[MusicApi] Feed fetch error, fallback to curated:', error);
      return {
        featured: CURATED_FEATURED_SONGS.slice(0, 8),
        trending: CURATED_FEATURED_SONGS,
        newReleases: CURATED_FEATURED_SONGS.slice(2, 10),
        chillOut: CURATED_FEATURED_SONGS
      };
    }
  },

  async searchAll(query: string): Promise<{
    songs: Song[];
    artists: Artist[];
    albums: Album[];
  }> {
    if (!query || !query.trim()) {
      return { songs: [], artists: [], albums: [] };
    }

    const clean = query.trim();

    try {
      // Parallel search: JioSaavn (full songs) prioritized over iTunes/YouTube
      const [
        saavnSongs,
        itunesSongs,
        ytSongs,
        saavnArtists,
        itunesArtists,
        saavnAlbums,
        itunesAlbums
      ] = await Promise.all([
        jioSaavnApi.searchSongs(clean, 40, 1).catch(() => []),
        itunesApi.searchSongs(clean, 25).catch(() => []),
        youtubeApi.searchSongs(clean, 15).catch(() => []),
        jioSaavnApi.searchArtists(clean, 15).catch(() => []),
        itunesApi.searchArtists(clean, 15).catch(() => []),
        jioSaavnApi.searchAlbums(clean, 15).catch(() => []),
        itunesApi.searchAlbums(clean, 15).catch(() => [])
      ]);

      // 1. First, search our rich verified curated full-length songs
      const matchedCurated = CURATED_FEATURED_SONGS.filter((s) => {
        const queryLower = clean.toLowerCase();
        return (
          s.title.toLowerCase().includes(queryLower) ||
          s.artistName.toLowerCase().includes(queryLower) ||
          (s.genre || '').toLowerCase().includes(queryLower) ||
          (s.albumTitle || '').toLowerCase().includes(queryLower)
        );
      });

      // 2. Discard 30-sec previews from search results so users only get full songs
      const isFullSong = (s: Song) =>
        Boolean(s.audioUrl) &&
        !s.audioUrl.includes('apple.com') &&
        !s.audioUrl.includes('AudioPreview') &&
        !s.audioUrl.includes('mzstatic') &&
        !s.id.startsWith('itunes_');

      const fullSaavnSongs = saavnSongs.filter(isFullSong);
      const fullYtSongs = ytSongs.filter(isFullSong);

      // Prioritize: Verified Curated -> JioSaavn (full 320kbps) -> YouTube
      const allSongs = [...matchedCurated, ...fullSaavnSongs, ...fullYtSongs];
      const seenIds = new Set<string>();
      const seenTitles = new Set<string>();
      const deduplicatedSongs: Song[] = [];

      for (const song of allSongs) {
        const normalizedTitle = `${song.title.toLowerCase()}_${song.artistName.toLowerCase()}`.replace(
          /[^a-z0-9]/g,
          ''
        );
        if (!seenIds.has(song.id) && !seenTitles.has(normalizedTitle) && isFullSong(song)) {
          seenIds.add(song.id);
          seenTitles.add(normalizedTitle);
          deduplicatedSongs.push(song);
        }
      }

      // Merge artists
      const matchedCuratedArtists = CURATED_ARTISTS.filter(
        (a) =>
          a.name.toLowerCase().includes(clean.toLowerCase()) ||
          a.genres.some((g) => g.toLowerCase().includes(clean.toLowerCase()))
      );
      const combinedArtists = [...saavnArtists, ...matchedCuratedArtists, ...itunesArtists];
      const artistMap = new Map<string, Artist>();
      for (const a of combinedArtists) {
        const key = a.name.toLowerCase().trim();
        if (!artistMap.has(key)) {
          artistMap.set(key, {
            ...a,
            imageUrl: getArtistImage(a.name, a.imageUrl)
          });
        }
      }

      // Merge albums
      const matchedCuratedAlbums = CURATED_ALBUMS.filter(
        (al) =>
          al.title.toLowerCase().includes(clean.toLowerCase()) ||
          al.artistName.toLowerCase().includes(clean.toLowerCase())
      );
      const combinedAlbums = [...saavnAlbums, ...matchedCuratedAlbums, ...itunesAlbums];
      const albumMap = new Map<string, Album>();
      for (const al of combinedAlbums) {
        const key = al.title.toLowerCase().trim();
        if (!albumMap.has(key)) {
          albumMap.set(key, al);
        }
      }

      const fallbackCurated = CURATED_FEATURED_SONGS.filter(
        (s) =>
          s.title.toLowerCase().includes(clean.toLowerCase()) ||
          s.artistName.toLowerCase().includes(clean.toLowerCase()) ||
          (s.genre || '').toLowerCase().includes(clean.toLowerCase()) ||
          (clean.toLowerCase().includes('tamil') && s.language === 'ta')
      );

      return {
        songs: deduplicatedSongs.length > 0 ? deduplicatedSongs : fallbackCurated,
        artists: Array.from(artistMap.values()),
        albums: Array.from(albumMap.values())
      };
    } catch (error) {
      console.warn('[MusicApi] searchAll error:', error);
      return {
        songs: CURATED_FEATURED_SONGS,
        artists: CURATED_ARTISTS,
        albums: CURATED_ALBUMS
      };
    }
  },

  async getSongById(songId: string): Promise<Song | null> {
    if (!songId) return null;

    // 1. Check verified curated songs catalog (instant hit)
    const curated = CURATED_FEATURED_SONGS.find((s) => s.id === songId);
    if (curated) return curated;

    // 2. Check local stored databases (playlists, favorites, downloads, history)
    try {
      const [playlists, favorites, downloads, history] = await Promise.all([
        dbStorage.getItem<any[]>(dbStorage.KEYS.PLAYLISTS, []),
        dbStorage.getItem<any[]>(dbStorage.KEYS.FAVORITES, []),
        dbStorage.getItem<any[]>(dbStorage.KEYS.DOWNLOADS, []),
        dbStorage.getItem<any[]>(dbStorage.KEYS.HISTORY, [])
      ]);

      const inFav = favorites?.find((s: Song) => s.id === songId);
      if (inFav) return inFav;

      const inDl = downloads?.find((s: Song) => s.id === songId);
      if (inDl) return inDl;

      const inHist = history?.find((s: Song) => s.id === songId);
      if (inHist) return inHist;

      if (playlists && Array.isArray(playlists)) {
        for (const pl of playlists) {
          const inPl = pl.tracks?.find((s: Song) => s.id === songId);
          if (inPl) return inPl;
        }
      }
    } catch {
      // ignore
    }

    // 3. Check Aura Music catalog by direct song ID
    if (songId.startsWith('aura_song_') || songId.startsWith('saavn_')) {
      const cleanId = songId.replace(/^(aura_song_|saavn_)/, '');
      try {
        const details = await jioSaavnApi.getSongDetails(cleanId);
        if (details) return details;
      } catch {
        // ignore
      }
    }

    // 4. Fallback search by cleaned song query on Aura catalog
    try {
      const cleanName = decodeURIComponent(
        songId
          .replace(/^(aura_song_|song_|saavn_|itunes_|yt_)/, '')
          .replace(/_/g, ' ')
      ).trim();
      if (cleanName) {
        const results = await jioSaavnApi.searchSongs(cleanName, 10);
        const exact = results.find((s) => s.id === songId);
        if (exact) return exact;
        if (results.length > 0) return results[0];
      }
    } catch {
      // ignore
    }

    // 5. Fallback: check YouTube & iTunes
    try {
      const cleanName = decodeURIComponent(
        songId.replace(/[^a-zA-Z0-9 ]/g, ' ')
      ).trim();
      if (cleanName) {
        const [ytSongs, itunesSongs] = await Promise.all([
          youtubeApi.searchSongs(cleanName, 5).catch(() => []),
          itunesApi.searchSongs(cleanName, 5).catch(() => [])
        ]);
        if (ytSongs.length > 0) return ytSongs[0];
        if (itunesSongs.length > 0) return itunesSongs[0];
      }
    } catch {
      // ignore
    }

    // 6. Safe curated fallback
    return CURATED_FEATURED_SONGS[0] || null;
  },

  async getSongsForPlaylistName(playlistName: string, limit = 35): Promise<Song[]> {
    if (!playlistName || !playlistName.trim()) {
      return deduplicateSongs(CURATED_FEATURED_SONGS, 'ta').slice(0, limit);
    }

    const lower = playlistName.toLowerCase();

    // Route separated language playlists to language-isolated tracks
    const languageKeywords: Record<string, string> = {
      tamil: 'ta',
      kollywood: 'ta',
      hindi: 'hi',
      bollywood: 'hi',
      english: 'en',
      billboard: 'en',
      telugu: 'te',
      tollywood: 'te',
      malayalam: 'ml',
      mollywood: 'ml',
      punjabi: 'pa',
      bhangra: 'pa',
      kannada: 'kn',
      sandalwood: 'kn',
      korean: 'ko',
      kpop: 'ko',
      'k-pop': 'ko',
      spanish: 'es',
      latin: 'es',
      reggaeton: 'es',
      japanese: 'ja',
      jpop: 'ja',
      'j-pop': 'ja',
      anime: 'ja'
    };

    for (const [kw, langCode] of Object.entries(languageKeywords)) {
      if (lower.includes(kw)) {
        const langTracks = await this.getSongsByLanguage(langCode, limit + 10);
        return deduplicateSongs(langTracks, langCode).slice(0, limit);
      }
    }

    const clean = playlistName
      .replace(/pl_/gi, '')
      .replace(/_/g, ' ')
      .replace(/hits/gi, '')
      .replace(/anthems/gi, '')
      .replace(/melodies/gi, '')
      .replace(/playlist/gi, '')
      .trim();

    const lowerName = playlistName.toLowerCase();
    let searchQueries: string[] = [];

    if (lowerName.includes('party') || (lowerName.includes('vibe') && !lowerName.includes('drive'))) {
      searchQueries = [
        'Top Tamil Party Kuthu Hits Anirudh',
        'Tamil Dance Party Songs 2024',
        'Tamil Mass Vibe Songs',
        'Tamil Kuthu Hits'
      ];
    } else if (lowerName.includes('melody') || lowerName.includes('romantic') || lowerName.includes('love')) {
      searchQueries = [
        'Tamil Romantic Melodies Love Songs',
        'Top Tamil Melody Hits AR Rahman Harris',
        'Soulful Tamil Melodies Sid Sriram',
        'Tamil Melody Classics'
      ];
    } else if (lowerName.includes('breakup') || lowerName.includes('failure')) {
      searchQueries = [
        'Tamil Breakup Songs Love Failure',
        'Tamil Heartbreak Songs Dhanush Yuvan',
        'Tamil Sad Breakup Songs Anirudh',
        'Tamil 3AM Breakup Hits'
      ];
    } else if (lowerName.includes('sad') || lowerName.includes('drugs') || lowerName.includes('melancholy')) {
      searchQueries = [
        'Tamil Sad Songs Yuvan Drugs Melancholy',
        'Tamil Emotional Melancholy Songs',
        'Tamil Pain Hits Yuvan Shankar Raja',
        'Tamil Tearjerker Songs'
      ];
    } else if (lowerName.includes('motivation') || lowerName.includes('workout') || lowerName.includes('gym') || lowerName.includes('beast')) {
      searchQueries = [
        'Tamil Motivational Songs Workout Beast Mode',
        'Tamil Gym Workout Energetic Hits Anirudh',
        'Tamil Mass Motivational Songs',
        'Tamil Workout BGM'
      ];
    } else if (lowerName.includes('chill') || lowerName.includes('lo-fi') || lowerName.includes('latenight') || lowerName.includes('late night')) {
      searchQueries = [
        'Tamil Lo-Fi Chill Songs Acoustic',
        'Tamil Late Night Relaxing Melodies',
        'Tamil Indie Chill Vibes',
        'Tamil Acoustic Relax'
      ];
    } else if (lowerName.includes('drive') || lowerName.includes('road trip') || lowerName.includes('travel')) {
      searchQueries = [
        'Tamil Long Drive Road Trip Songs',
        'Tamil Highway Breezy Car Songs',
        'Tamil Travel Hits Melodies',
        'Tamil Road Trip Beats'
      ];
    } else if (lowerName.includes('nostalgia') || lowerName.includes('90s') || lowerName.includes('2000s') || lowerName.includes('classics')) {
      searchQueries = [
        'Tamil 90s Evergreen Hits SPB Ilayaraja',
        'Tamil 2000s Classic Melodies Vidyasagar',
        'Tamil Golden Classics AR Rahman 90s',
        'Tamil Retro Hits'
      ];
    } else {
      const clean = playlistName
        .replace(/best of/gi, '')
        .replace(/pl_/gi, '')
        .replace(/hits/gi, '')
        .replace(/essentials/gi, '')
        .replace(/anthems/gi, '')
        .replace(/masterpieces/gi, '')
        .trim();

      searchQueries = [
        playlistName,
        clean,
        `${clean} hits`,
        `${clean} songs`
      ].filter((q) => q.length > 1);
    }

    const isFullSong = (s: Song) =>
      Boolean(s.audioUrl) &&
      !s.audioUrl.includes('apple.com') &&
      !s.audioUrl.includes('AudioPreview') &&
      !s.audioUrl.includes('mzstatic');

    const seen = new Set<string>();
    const songs: Song[] = [];

    // 1. Check curated matching tracks first
    const curatedMatches = CURATED_FEATURED_SONGS.filter((s) => {
      if (lowerName.includes('party') || (lowerName.includes('vibe') && !lowerName.includes('drive'))) {
        return (
          ['tamil_1', 'tamil_2', 'tamil_3', 'tamil_4', 'saavn_nHs_0eEA', 'saavn__GIuQbB_', 'aura_song_chellamma', 'saavn_PaDPLtYH'].includes(s.id) ||
          ((s.genre || '').includes('Kuthu') && s.language === 'ta')
        );
      }
      if (lowerName.includes('melody') || lowerName.includes('romantic') || lowerName.includes('love')) {
        return (
          ['tamil_5', 'tamil_7', 'saavn_asyeukc4', 'saavn_-TFpspH-', 'saavn_fqKx7XVg', 'saavn_HifBw1Ku'].includes(s.id) ||
          ((s.genre || '').includes('Melody') && s.language === 'ta')
        );
      }
      if (lowerName.includes('breakup') || lowerName.includes('failure')) {
        return ['saavn_itXw9yrX', 'saavn_o-IsoK2n', 'saavn_fqKx7XVg', 'saavn_EzAV-RzR', 'tamil_5'].includes(s.id);
      }
      if (lowerName.includes('sad') || lowerName.includes('drugs') || lowerName.includes('melancholy')) {
        return ['saavn_EzAV-RzR', 'saavn_itXw9yrX', 'saavn_fqKx7XVg', 'saavn_HifBw1Ku', 'saavn_o-IsoK2n'].includes(s.id);
      }
      if (lowerName.includes('motivation') || lowerName.includes('workout') || lowerName.includes('gym') || lowerName.includes('beast')) {
        return ['tamil_6', 'tamil_1', 'tamil_4', 'saavn_Cadaj1l5', 'saavn_yYDStxbl', 'saavn_EzAV-RzR'].includes(s.id);
      }
      if (lowerName.includes('chill') || lowerName.includes('lo-fi') || lowerName.includes('latenight')) {
        return ['tamil_8', 'saavn_-TFpspH-', 'tamil_7', 'saavn_asyeukc4', 'aura_song_enjoy_enjaami'].includes(s.id);
      }
      if (lowerName.includes('drive') || lowerName.includes('road trip')) {
        return ['saavn_yYDStxbl', 'tamil_8', 'saavn_-TFpspH-', 'aura_song_chellamma', 'saavn_nHs_0eEA'].includes(s.id);
      }
      if (lowerName.includes('nostalgia') || lowerName.includes('90s') || lowerName.includes('2000s') || lowerName.includes('classics')) {
        return ['tamil_5', 'tamil_7'].includes(s.id) || (s.language === 'ta' && (s.genre || '').includes('Classical'));
      }
      return (
        s.title.toLowerCase().includes(lowerName) ||
        s.artistName.toLowerCase().includes(lowerName) ||
        (s.albumTitle && s.albumTitle.toLowerCase().includes(lowerName)) ||
        (s.genre && s.genre.toLowerCase().includes(lowerName)) ||
        (lowerName.includes('tamil') && s.language === 'ta') ||
        (lowerName.includes('hindi') && s.language === 'hi') ||
        (lowerName.includes('english') && s.language === 'en') ||
        (lowerName.includes('romantic') && (s.genre || '').includes('Melody'))
      );
    });

    for (const s of curatedMatches) {
      if (isFullSong(s) && !seen.has(s.id)) {
        seen.add(s.id);
        songs.push(s);
      }
    }

    // 2. Search JioSaavn with queries in parallel
    try {
      const results = await Promise.all(
        searchQueries.slice(0, 3).map((q) =>
          jioSaavnApi.searchSongs(q, Math.ceil(limit / 2)).catch(() => [])
        )
      );

      for (const list of results) {
        for (const s of list) {
          if (isFullSong(s) && !seen.has(s.id)) {
            seen.add(s.id);
            songs.push(s);
          }
          if (songs.length >= limit * 2) break;
        }
        if (songs.length >= limit * 2) break;
      }
    } catch {
      // ignore
    }

    // 3. Fallback to curated tracks if still empty
    if (songs.length === 0) {
      return deduplicateSongs(CURATED_FEATURED_SONGS, 'ta').slice(0, limit);
    }

    // Deduplicate songs: each song appears strictly once, preferring the Tamil version
    return deduplicateSongs(songs, 'ta').slice(0, limit);
  },

  async getSongsByLanguage(langCode: string, limit = 50): Promise<Song[]> {
    try {
      const code = langCode.toLowerCase();

      const languageQueries: Record<string, string[]> = {
        ta: [
          'Top Tamil Hits Anirudh AR Rahman',
          'Trending Tamil Songs 2024',
          'Tamil Melody Hits',
          'Kollywood Blockbuster Hits',
          'Tamil Love Songs Yuvan Harris'
        ],
        tamil: [
          'Top Tamil Hits Anirudh AR Rahman',
          'Trending Tamil Songs 2024',
          'Tamil Melody Hits',
          'Kollywood Blockbuster Hits',
          'Tamil Love Songs Yuvan Harris'
        ],
        hi: [
          'Latest Hindi Hits Arijit Singh Shreya',
          'Trending Bollywood Hits 2024',
          'Hindi Romantic Melodies',
          'Bollywood Party Songs'
        ],
        hindi: [
          'Latest Hindi Hits Arijit Singh Shreya',
          'Trending Bollywood Hits 2024',
          'Hindi Romantic Melodies',
          'Bollywood Party Songs'
        ],
        en: ['Top Billboard Pop Hits 2024', 'Global Top 50 English Hits Taylor Swift The Weeknd', 'Trending Pop Songs Ed Sheeran'],
        english: ['Top Billboard Pop Hits 2024', 'Global Top 50 English Hits Taylor Swift The Weeknd', 'Trending Pop Songs Ed Sheeran'],
        te: ['Top Telugu Hits DSP Thaman Sid Sriram', 'Tollywood Blockbusters 2024', 'Telugu Melody Songs'],
        telugu: ['Top Telugu Hits DSP Thaman Sid Sriram', 'Tollywood Blockbusters 2024', 'Telugu Melody Songs'],
        pa: ['Top Punjabi Hits Diljit Dosanjh Karan Aujla', 'Punjabi Party Songs 2024', 'Sidhu Moose Wala Hits'],
        punjabi: ['Top Punjabi Hits Diljit Dosanjh Karan Aujla', 'Punjabi Party Songs 2024', 'Sidhu Moose Wala Hits'],
        ml: ['Top Malayalam Hits Sushin Shyam', 'Mollywood Melodies 2024', 'Malayalam Love Songs'],
        malayalam: ['Top Malayalam Hits Sushin Shyam', 'Mollywood Melodies 2024', 'Malayalam Love Songs'],
        kn: ['Top Kannada Hits Ravi Basrur', 'Sandalwood Hits 2024', 'Kannada Melodies'],
        kannada: ['Top Kannada Hits Ravi Basrur', 'Sandalwood Hits 2024', 'Kannada Melodies'],
        bn: ['Top Bengali Hits Arijit Singh', 'Bangla Hits 2024', 'Bengali Folk Melodies'],
        bengali: ['Top Bengali Hits Arijit Singh', 'Bangla Hits 2024', 'Bengali Folk Melodies'],
        mr: ['Top Marathi Hits Ajay Atul', 'Marathi Melodies 2024', 'Marathi Folk Songs'],
        marathi: ['Top Marathi Hits Ajay Atul', 'Marathi Melodies 2024', 'Marathi Folk Songs'],
        gu: ['Top Gujarati Hits Garba Sugam', 'Gujarati Folk Hits 2024'],
        gujarati: ['Top Gujarati Hits Garba Sugam', 'Gujarati Folk Hits 2024'],
        es: ['Top Latin Pop Reggaeton Hits', 'Spanish Hits 2024', 'Bad Bunny Rosalía'],
        spanish: ['Top Latin Pop Reggaeton Hits', 'Spanish Hits 2024', 'Bad Bunny Rosalía'],
        fr: ['Top French Pop Hits', 'Chanson Francaise 2024', 'Indila Stromae'],
        french: ['Top French Pop Hits', 'Chanson Francaise 2024', 'Indila Stromae'],
        de: ['German Techno Hits', 'Deutsch Pop 2024'],
        german: ['German Techno Hits', 'Deutsch Pop 2024'],
        ja: ['Japanese Anime OST Lo-Fi City Pop', 'J-Pop Top Hits 2024', 'Yoasobi Ado'],
        japanese: ['Japanese Anime OST Lo-Fi City Pop', 'J-Pop Top Hits 2024', 'Yoasobi Ado'],
        ko: ['Top K-Pop Korean Hits BTS Blackpink NewJeans', 'K-Indie Chill Melodies'],
        korean: ['Top K-Pop Korean Hits BTS Blackpink NewJeans', 'K-Indie Chill Melodies']
      };

      const queries = languageQueries[code] || [`${code} songs hits`];

      // Fetch full-length tracks from JioSaavn in parallel
      const fetchPromises: Promise<Song[]>[] = [
        ...queries.map((q) => jioSaavnApi.searchSongs(q, 30).catch(() => []))
      ];

      const results = await Promise.all(fetchPromises);
      const flattened = results.flat();
      const seen = new Set<string>();
      const finalSongs: Song[] = [];

      // Include our verified curated full-length songs for this language first
      const matchingCurated = CURATED_FEATURED_SONGS.filter(
        (s) => s.language === code || (code === 'all' && s.audioUrl)
      );

      for (const s of matchingCurated) {
        if (!seen.has(s.id) && s.audioUrl) {
          seen.add(s.id);
          finalSongs.push(s);
        }
      }

      for (const s of flattened) {
        if (
          !seen.has(s.id) &&
          s.audioUrl &&
          !s.audioUrl.includes('apple.com') &&
          !s.audioUrl.includes('AudioPreview') &&
          !s.audioUrl.includes('mzstatic')
        ) {
          seen.add(s.id);
          s.language = code;
          finalSongs.push(s);
        }
        if (finalSongs.length >= limit * 2) break;
      }

      if (finalSongs.length > 0) {
        return deduplicateSongs(finalSongs, code).slice(0, limit);
      }

      const fallbackLanguage = CURATED_FEATURED_SONGS.filter((s) => s.language === code || code === 'all');
      return deduplicateSongs(fallbackLanguage.length > 0 ? fallbackLanguage : CURATED_FEATURED_SONGS, code).slice(0, limit);
    } catch (err) {
      console.warn('[MusicApi] getSongsByLanguage error:', err);
      return deduplicateSongs(CURATED_FEATURED_SONGS, (langCode || 'ta').toLowerCase()).slice(0, limit);
    }
  },

  async getTamilHubData(): Promise<{
    trending: Song[];
    hits: Song[];
    latest: Song[];
    movieHits: Song[];
    loveSongs: Song[];
    melody: Song[];
    folk: Song[];
    classics: Song[];
    topArtists: Artist[];
  }> {
    try {
      const [
        ytTrending,
        ytHits,
        trending,
        hits,
        latest,
        movieHits,
        loveSongs,
        melody,
        folk,
        classics,
        artists
      ] = await Promise.all([
        youtubeApi.searchSongs('Top Trending Tamil Songs Anirudh 2024', 15).catch(() => []),
        youtubeApi.searchSongs('Tamil Blockbuster Kollywood Video Hits 2024', 15).catch(() => []),
        jioSaavnApi.searchSongs('Top Trending Tamil Songs Anirudh', 20).catch(() => []),
        jioSaavnApi.searchSongs('Tamil Blockbuster Hits Kollywood 2024', 20).catch(() => []),
        jioSaavnApi.searchSongs('Latest Tamil Songs 2024 2025', 20).catch(() => []),
        jioSaavnApi.searchSongs('Tamil Movie Hits Vijay Rajini Kamal Ajith', 20).catch(() => []),
        jioSaavnApi.searchSongs('Tamil Romantic Melodies Love Songs', 20).catch(() => []),
        jioSaavnApi.searchSongs('Tamil Soulful Melody Sid Sriram Haricharan', 20).catch(() => []),
        jioSaavnApi.searchSongs('Tamil Kuthu Folk Hits Gaana', 20).catch(() => []),
        jioSaavnApi.searchSongs('Tamil Evergreen 90s SPB Ilayaraja', 20).catch(() => []),
        jioSaavnApi.searchArtists('Anirudh AR Rahman Yuvan Harris Ilayaraja', 12).catch(() => [])
      ]);

      const dedupe = (songs: Song[]): Song[] => {
        const seen = new Set<string>();
        return songs.filter((s) => {
          if (!s.audioUrl || seen.has(s.id)) return false;
          // Filter out preview URLs
          if (s.audioUrl.includes('apple.com') || s.audioUrl.includes('AudioPreview')) return false;
          seen.add(s.id);
          s.language = 'ta';
          return true;
        });
      };

      const fallbackTamil = CURATED_FEATURED_SONGS.filter((s) => s.language === 'ta');

      const tamilTopArtists = CURATED_ARTISTS.filter(
        (a) =>
          a.genres.some((g) =>
            ['kollywood', 'carnatic', 'kuthu', 'folk', 'bgm', 'melody'].includes(g.toLowerCase())
          ) ||
          [
            'artist_anirudh',
            'artist_arrahman',
            'artist_yuvan',
            'artist_harris',
            'artist_ilayaraja',
            'artist_sidsriram',
            'artist_santhosh',
            'artist_spb',
            'artist_saiabhyankkar',
            'artist_sushin'
          ].includes(a.id)
      ).map((a) => ({
        ...a,
        imageUrl: getArtistImage(a.name, a.imageUrl)
      }));

      return {
        trending: dedupe([...ytTrending, ...trending, ...fallbackTamil]).length > 0 ? dedupe([...ytTrending, ...trending, ...fallbackTamil]) : fallbackTamil,
        hits: dedupe([...ytHits, ...hits, ...fallbackTamil]).length > 0 ? dedupe([...ytHits, ...hits, ...fallbackTamil]) : fallbackTamil,
        latest: dedupe(latest).length > 0 ? dedupe(latest) : fallbackTamil,
        movieHits: dedupe(movieHits).length > 0 ? dedupe(movieHits) : fallbackTamil,
        loveSongs: dedupe(loveSongs).length > 0 ? dedupe(loveSongs) : fallbackTamil,
        melody: dedupe(melody).length > 0 ? dedupe(melody) : fallbackTamil,
        folk: dedupe(folk).length > 0 ? dedupe(folk) : fallbackTamil,
        classics: dedupe(classics).length > 0 ? dedupe(classics) : fallbackTamil,
        topArtists: tamilTopArtists
      };
    } catch (error) {
      console.warn('[MusicApi] getTamilHubData error:', error);
      const fallbackTamil = CURATED_FEATURED_SONGS.filter((s) => s.language === 'ta');
      const fallbackTamilArtists = CURATED_ARTISTS.filter((a) =>
        ['artist_anirudh', 'artist_arrahman', 'artist_yuvan', 'artist_harris', 'artist_ilayaraja', 'artist_sidsriram'].includes(a.id)
      ).map((a) => ({
        ...a,
        imageUrl: getArtistImage(a.name, a.imageUrl)
      }));
      return {
        trending: fallbackTamil,
        hits: fallbackTamil,
        latest: fallbackTamil,
        movieHits: fallbackTamil,
        loveSongs: fallbackTamil,
        melody: fallbackTamil,
        folk: fallbackTamil,
        classics: fallbackTamil,
        topArtists: fallbackTamilArtists
      };
    }
  }
};
