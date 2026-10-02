import { jioSaavnApi } from '../client-api/jiosaavn';
import { itunesApi } from '../client-api/itunes';
import { youtubeApi } from '../client-api/youtube';
import { musicBrainzApi } from '../client-api/musicbrainz';
import { CURATED_FEATURED_SONGS, CURATED_ALBUMS, CURATED_ARTISTS } from '../client-api/sources';
import { getArtistImage } from '../constants/artistImages';
import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';

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

    // 1. Check verified curated songs catalog
    const curated = CURATED_FEATURED_SONGS.find((s) => s.id === songId);
    if (curated) return curated;

    // 2. Check JioSaavn by ID
    if (songId.startsWith('saavn_')) {
      const cleanId = songId.replace('saavn_', '');
      try {
        const details = await jioSaavnApi.getSongDetails(cleanId);
        if (details) return details;
      } catch {
        // ignore
      }
    }

    // 3. Fallback search by cleaned song query
    try {
      const cleanName = decodeURIComponent(
        songId
          .replace('saavn_', '')
          .replace('itunes_', '')
          .replace('yt_', '')
          .replace(/_/g, ' ')
      );
      const results = await jioSaavnApi.searchSongs(cleanName, 5);
      if (results.length > 0) return results[0];
    } catch {
      // ignore
    }

    return null;
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
        if (finalSongs.length >= limit) break;
      }

      if (finalSongs.length > 0) {
        return finalSongs;
      }

      const fallbackLanguage = CURATED_FEATURED_SONGS.filter((s) => s.language === code || code === 'all');
      return fallbackLanguage.length > 0 ? fallbackLanguage : CURATED_FEATURED_SONGS;
    } catch (err) {
      console.warn('[MusicApi] getSongsByLanguage error:', err);
      return CURATED_FEATURED_SONGS;
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
