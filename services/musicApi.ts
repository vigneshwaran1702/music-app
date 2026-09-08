import { jioSaavnApi } from '../api/jiosaavn';
import { itunesApi } from '../api/itunes';
import { youtubeApi } from '../api/youtube';
import { musicBrainzApi } from '../api/musicbrainz';
import { CURATED_FEATURED_SONGS, CURATED_ALBUMS, CURATED_ARTISTS } from '../api/sources';
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
      // Parallel fetch across YouTube, JioSaavn, and iTunes
      const [
        saavnTrending,
        saavnTamil,
        saavnNew,
        saavnBollywood,
        saavnChill,
        itunesTrending,
        ytTamilTrending,
        ytGlobalTrending
      ] = await Promise.all([
        jioSaavnApi.getTrendingSongs(30),
        jioSaavnApi.searchSongs('Top Tamil Hits Anirudh AR Rahman 2024', 25),
        jioSaavnApi.searchSongs('Latest Indian and Global Hits 2024', 25),
        jioSaavnApi.searchSongs('Top Bollywood Trending Hits Arijit Singh', 20),
        jioSaavnApi.searchSongs('Lo-Fi Chill Acoustic Melodies Instrumental', 20),
        itunesApi.searchSongs('Top Hits', 15),
        youtubeApi.searchSongs('Top Trending Tamil Songs 2024 Anirudh', 12),
        youtubeApi.searchSongs('Trending YouTube Music Hits 2024', 10)
      ]);

      const dedupe = (list: Song[]): Song[] => {
        const seen = new Set<string>();
        return list.filter((s) => {
          if (!s.audioUrl || seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
      };

      const allTrending = dedupe([
        ...ytTamilTrending,
        ...saavnTrending,
        ...saavnTamil,
        ...ytGlobalTrending,
        ...saavnBollywood,
        ...itunesTrending
      ]);

      const featured = allTrending.slice(0, 14);
      const trending = allTrending.length > 0 ? allTrending : CURATED_FEATURED_SONGS;
      const newDrops = dedupe([...ytTamilTrending, ...saavnNew, ...saavnTamil.slice(6)]);
      const chillTracks = dedupe([
        ...saavnChill,
        ...trending.filter((s) =>
          ['Lo-Fi', 'Chill', 'Acoustic', 'Melody', 'Ambient', 'Piano'].some((g) =>
            (s.genre || '').includes(g) || (s.title || '').includes(g)
          )
        ),
        ...CURATED_FEATURED_SONGS.filter((s) => s.genre.includes('Chill') || s.language === 'ja')
      ]);

      return {
        featured: featured.length > 0 ? featured : CURATED_FEATURED_SONGS.slice(0, 6),
        trending: trending.length > 0 ? trending : CURATED_FEATURED_SONGS,
        newReleases: newDrops.length > 0 ? newDrops : trending.slice(2, 16),
        chillOut: chillTracks.length > 0 ? chillTracks : CURATED_FEATURED_SONGS
      };
    } catch (error) {
      console.warn('[MusicApi] Feed fetch error, fallback to curated:', error);
      return {
        featured: CURATED_FEATURED_SONGS.slice(0, 6),
        trending: CURATED_FEATURED_SONGS,
        newReleases: CURATED_FEATURED_SONGS.slice(2, 6),
        chillOut: CURATED_FEATURED_SONGS.filter(
          (s) => s.language === 'ja' || s.genre.includes('Chill')
        )
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
      // Parallel search across YouTube, JioSaavn, iTunes, and MusicBrainz
      const [
        ytSongs,
        saavnSongs,
        saavnArtists,
        saavnAlbums,
        itunesSongs,
        itunesArtists,
        itunesAlbums,
        mbRecordings
      ] = await Promise.all([
        youtubeApi.searchSongs(clean, 20),
        jioSaavnApi.searchSongs(clean, 40, 1),
        jioSaavnApi.searchArtists(clean, 15),
        jioSaavnApi.searchAlbums(clean, 15),
        itunesApi.searchSongs(clean, 25),
        itunesApi.searchArtists(clean, 10),
        itunesApi.searchAlbums(clean, 10),
        musicBrainzApi.searchRecordings(clean, 10)
      ]);

      // Combine and deduplicate songs (YouTube + JioSaavn + iTunes)
      const allSongs = [...ytSongs, ...saavnSongs, ...itunesSongs];
      const seenIds = new Set<string>();
      const seenTitles = new Set<string>();
      const deduplicatedSongs: Song[] = [];

      for (const song of allSongs) {
        const normalizedTitle = `${song.title.toLowerCase()}_${song.artistName.toLowerCase()}`.replace(
          /[^a-z0-9]/g,
          ''
        );
        if (!seenIds.has(song.id) && !seenTitles.has(normalizedTitle) && song.audioUrl) {
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
      const combinedArtists = [...saavnArtists, ...itunesArtists, ...matchedCuratedArtists];
      const artistMap = new Map<string, Artist>();
      for (const a of combinedArtists) {
        const key = a.name.toLowerCase().trim();
        if (!artistMap.has(key)) {
          artistMap.set(key, a);
        }
      }

      // Merge albums
      const matchedCuratedAlbums = CURATED_ALBUMS.filter(
        (al) =>
          al.title.toLowerCase().includes(clean.toLowerCase()) ||
          al.artistName.toLowerCase().includes(clean.toLowerCase())
      );
      const combinedAlbums = [...saavnAlbums, ...itunesAlbums, ...matchedCuratedAlbums];
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
          s.genre.toLowerCase().includes(clean.toLowerCase()) ||
          (clean.toLowerCase().includes('tamil') && s.language === 'ta')
      );

      return {
        songs:
          deduplicatedSongs.length > 0
            ? deduplicatedSongs
            : fallbackCurated.length > 0
            ? fallbackCurated
            : CURATED_FEATURED_SONGS,
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
        en: ['Top Billboard Pop Hits 2024', 'Global Top 50 English Hits', 'Trending Pop Songs'],
        english: ['Top Billboard Pop Hits 2024', 'Global Top 50 English Hits', 'Trending Pop Songs'],
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

      // Fetch from YouTube, JioSaavn & iTunes in parallel
      const fetchPromises: Promise<Song[]>[] = [
        youtubeApi.searchSongs(queries[0], 20),
        ...queries.map((q) => jioSaavnApi.searchSongs(q, 30))
      ];

      const isWestern = [
        'en',
        'english',
        'es',
        'spanish',
        'fr',
        'french',
        'de',
        'german',
        'ja',
        'japanese',
        'ko',
        'korean'
      ].includes(code);

      if (isWestern) {
        fetchPromises.push(itunesApi.searchSongs(queries[0], 25));
      }

      const results = await Promise.all(fetchPromises);
      const flattened = results.flat();
      const seen = new Set<string>();
      const finalSongs: Song[] = [];

      for (const s of flattened) {
        if (!seen.has(s.id) && s.audioUrl) {
          seen.add(s.id);
          s.language = code;
          finalSongs.push(s);
        }
        if (finalSongs.length >= limit) break;
      }

      if (finalSongs.length > 0) {
        return finalSongs;
      }

      return CURATED_FEATURED_SONGS;
    } catch (err) {
      console.warn('[MusicApi] getSongsByLanguage error:', err);
      return CURATED_FEATURED_SONGS;
    }
  },

  async getSongById(songId: string): Promise<Song | null> {
    const foundCurated = CURATED_FEATURED_SONGS.find((s) => s.id === songId);
    if (foundCurated) return foundCurated;

    if (songId.startsWith('saavn_')) {
      const details = await jioSaavnApi.getSongDetails(songId);
      if (details) return details;
    }

    try {
      const clean = songId
        .replace('saavn_', '')
        .replace('mb_', '')
        .replace('itunes_', '')
        .replace('yt_', '')
        .replace('jamendo_', '');
      const list = await jioSaavnApi.searchSongs(clean, 5);
      const matched = list.find((s) => s.id === songId);
      if (matched) return matched;
      if (list.length > 0) return list[0];
    } catch {
      // ignore
    }

    return null;
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
        youtubeApi.searchSongs('Top Trending Tamil Songs Anirudh 2024', 15),
        youtubeApi.searchSongs('Tamil Blockbuster Kollywood Video Hits 2024', 15),
        jioSaavnApi.searchSongs('Top Trending Tamil Songs Anirudh', 20),
        jioSaavnApi.searchSongs('Tamil Blockbuster Hits Kollywood 2024', 20),
        jioSaavnApi.searchSongs('Latest Tamil Songs 2024 2025', 20),
        jioSaavnApi.searchSongs('Tamil Movie Hits Vijay Rajini Kamal Ajith', 20),
        jioSaavnApi.searchSongs('Tamil Romantic Melodies Love Songs', 20),
        jioSaavnApi.searchSongs('Tamil Soulful Melody Sid Sriram Haricharan', 20),
        jioSaavnApi.searchSongs('Tamil Kuthu Folk Hits Gaana', 20),
        jioSaavnApi.searchSongs('Tamil Evergreen 90s SPB Ilayaraja', 20),
        jioSaavnApi.searchArtists('Anirudh AR Rahman Yuvan Harris Ilayaraja', 12)
      ]);

      const dedupe = (songs: Song[]): Song[] => {
        const seen = new Set<string>();
        return songs.filter((s) => {
          if (!s.audioUrl || seen.has(s.id)) return false;
          seen.add(s.id);
          s.language = 'ta';
          return true;
        });
      };

      const fallbackTamil = CURATED_FEATURED_SONGS.filter((s) => s.language === 'ta');

      return {
        trending: dedupe([...ytTrending, ...trending]).length > 0 ? dedupe([...ytTrending, ...trending]) : fallbackTamil,
        hits: dedupe([...ytHits, ...hits]).length > 0 ? dedupe([...ytHits, ...hits]) : fallbackTamil,
        latest: dedupe(latest).length > 0 ? dedupe(latest) : fallbackTamil,
        movieHits: dedupe(movieHits).length > 0 ? dedupe(movieHits) : fallbackTamil,
        loveSongs: dedupe(loveSongs).length > 0 ? dedupe(loveSongs) : fallbackTamil,
        melody: dedupe(melody).length > 0 ? dedupe(melody) : fallbackTamil,
        folk: dedupe(folk).length > 0 ? dedupe(folk) : fallbackTamil,
        classics: dedupe(classics).length > 0 ? dedupe(classics) : fallbackTamil,
        topArtists: artists.length > 0 ? artists : CURATED_ARTISTS
      };
    } catch (error) {
      console.warn('[MusicApi] getTamilHubData error:', error);
      const fallbackTamil = CURATED_FEATURED_SONGS.filter((s) => s.language === 'ta');
      return {
        trending: fallbackTamil,
        hits: fallbackTamil,
        latest: fallbackTamil,
        movieHits: fallbackTamil,
        loveSongs: fallbackTamil,
        melody: fallbackTamil,
        folk: fallbackTamil,
        classics: fallbackTamil,
        topArtists: CURATED_ARTISTS
      };
    }
  }
};
