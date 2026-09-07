import { jioSaavnApi } from '../api/jiosaavn';
import { jamendoApi } from '../api/jamendo';
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
      // Fetch live tracks across Tamil, Hindi, English, Punjabi & Global hits
      const [saavnTrending, saavnTamil, saavnNew, jamendoTracks] = await Promise.all([
        jioSaavnApi.searchSongs('Top Trending Songs', 15),
        jioSaavnApi.searchSongs('Top Tamil Hits Anirudh AR Rahman', 15),
        jioSaavnApi.searchSongs('New Hits 2024', 15),
        jamendoApi.getTrendingTracks(8)
      ]);

      const primaryTracks = [
        ...saavnTrending.slice(0, 6),
        ...saavnTamil.slice(0, 6),
        ...jamendoTracks.slice(0, 4)
      ];

      const combined = primaryTracks.length > 0 ? primaryTracks : CURATED_FEATURED_SONGS;
      const newDrops = saavnNew.length > 0 ? saavnNew : combined.slice(4, 12);

      const chillTracks = [
        ...combined.filter((s) =>
          ['Lo-Fi / Chill', 'Electronic', 'Ambient', 'Acoustic', 'Chill', 'Piano', 'Melody'].some((g) =>
            (s.genre || '').includes(g)
          )
        ),
        ...CURATED_FEATURED_SONGS.filter((s) => s.language === 'ja' || s.genre.includes('Chill'))
      ];

      return {
        featured: combined.slice(0, 6),
        trending: combined,
        newReleases: newDrops.length > 0 ? newDrops : combined.slice(2, 10),
        chillOut: chillTracks.slice(0, 6)
      };
    } catch (error) {
      console.warn('[MusicApi] Feed fetch error, fallback to curated:', error);
      return {
        featured: CURATED_FEATURED_SONGS.slice(0, 3),
        trending: CURATED_FEATURED_SONGS,
        newReleases: CURATED_FEATURED_SONGS.slice(2, 6),
        chillOut: CURATED_FEATURED_SONGS.filter((s) => s.language === 'ja' || s.genre.includes('Chill'))
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
      // Parallel search across JioSaavn, MusicBrainz recordings, and Jamendo
      const [saavnSongs, saavnArtists, saavnAlbums, mbRecordings, jamendoSongs] =
        await Promise.all([
          jioSaavnApi.searchSongs(clean, 30),
          jioSaavnApi.searchArtists(clean, 8),
          jioSaavnApi.searchAlbums(clean, 8),
          musicBrainzApi.searchRecordings(clean, 10),
          jamendoApi.searchTracks(clean, 10)
        ]);

      // Combine and deduplicate songs
      const allSongs = [...saavnSongs, ...jamendoSongs];
      const seenIds = new Set<string>();
      const deduplicatedSongs: Song[] = [];

      for (const song of allSongs) {
        if (!seenIds.has(song.id) && song.audioUrl) {
          seenIds.add(song.id);
          deduplicatedSongs.push(song);
        }
      }

      // Merge artists
      const matchedCuratedArtists = CURATED_ARTISTS.filter(
        (a) =>
          a.name.toLowerCase().includes(clean.toLowerCase()) ||
          a.genres.some((g) => g.toLowerCase().includes(clean.toLowerCase()))
      );
      const combinedArtists = [...saavnArtists, ...matchedCuratedArtists];

      // Merge albums
      const matchedCuratedAlbums = CURATED_ALBUMS.filter(
        (al) =>
          al.title.toLowerCase().includes(clean.toLowerCase()) ||
          al.artistName.toLowerCase().includes(clean.toLowerCase())
      );
      const combinedAlbums = [...saavnAlbums, ...matchedCuratedAlbums];

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
        artists: combinedArtists,
        albums: combinedAlbums
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

  async getSongsByLanguage(langCode: string): Promise<Song[]> {
    try {
      const code = langCode.toLowerCase();

      // Language tag mapping for MusicBrainz: query=tag:<language>&fmt=json&limit=100
      const tagMapping: Record<string, string> = {
        ta: 'tamil',
        tamil: 'tamil',
        hi: 'hindi',
        hindi: 'hindi',
        te: 'telugu',
        telugu: 'telugu',
        ml: 'malayalam',
        malayalam: 'malayalam',
        kn: 'kannada',
        kannada: 'kannada',
        bn: 'bengali',
        bengali: 'bengali',
        mr: 'marathi',
        marathi: 'marathi',
        gu: 'gujarati',
        gujarati: 'gujarati',
        pa: 'punjabi',
        punjabi: 'punjabi',
        es: 'spanish',
        spanish: 'spanish',
        fr: 'french',
        french: 'french',
        de: 'german',
        german: 'german',
        ja: 'japanese',
        japanese: 'japanese',
        ko: 'korean',
        korean: 'korean'
      };

      const languageKeywords: Record<string, string[]> = {
        ta: ['Top Tamil Hits Anirudh AR Rahman', 'Trending Tamil Songs 2024', 'Tamil Melody Hits', 'Kollywood Hits', 'Tamil Love Songs', 'Yuvan Shankar Raja Tamil'],
        tamil: ['Top Tamil Hits Anirudh AR Rahman', 'Trending Tamil Songs 2024', 'Tamil Melody Hits', 'Kollywood Hits', 'Tamil Love Songs', 'Yuvan Shankar Raja Tamil'],
        hi: ['Latest Hindi Hits Arijit Shreya', 'Trending Bollywood Hits'],
        hindi: ['Latest Hindi Hits Arijit Shreya', 'Trending Bollywood Hits'],
        en: ['Top Billboard English Pop Hits', 'Global Top 50 English'],
        english: ['Top Billboard English Pop Hits', 'Global Top 50 English'],
        te: ['Top Telugu Hits DSP Thaman Sid Sriram', 'Tollywood Blockbusters'],
        telugu: ['Top Telugu Hits DSP Thaman Sid Sriram', 'Tollywood Blockbusters'],
        pa: ['Top Punjabi Hits Diljit Sidhu AP Dhillon', 'Punjabi Party Hits'],
        punjabi: ['Top Punjabi Hits Diljit Sidhu AP Dhillon', 'Punjabi Party Hits'],
        ml: ['Top Malayalam Hits Sushin Shyam', 'Mollywood Melodies'],
        malayalam: ['Top Malayalam Hits Sushin Shyam', 'Mollywood Melodies'],
        kn: ['Top Kannada Hits Ravi Basrur', 'Sandalwood Hits'],
        kannada: ['Top Kannada Hits Ravi Basrur', 'Sandalwood Hits'],
        bn: ['Top Bengali Hits Arijit Singh', 'Bangla Hits'],
        bengali: ['Top Bengali Hits Arijit Singh', 'Bangla Hits'],
        mr: ['Top Marathi Hits Ajay Atul', 'Marathi Melodies'],
        marathi: ['Top Marathi Hits Ajay Atul', 'Marathi Melodies'],
        gu: ['Top Gujarati Hits Garba Sugam', 'Gujarati Folk Hits'],
        gujarati: ['Top Gujarati Hits Garba Sugam', 'Gujarati Folk Hits'],
        es: ['Top Latin Pop Reggaeton Hits', 'Spanish Hits'],
        spanish: ['Top Latin Pop Reggaeton Hits', 'Spanish Hits'],
        fr: ['Top French Pop Hits', 'Chanson Francaise'],
        french: ['Top French Pop Hits', 'Chanson Francaise'],
        de: ['German Techno Hits', 'Deutsch Pop'],
        german: ['German Techno Hits', 'Deutsch Pop'],
        ja: ['Japanese Anime OST Lo-Fi City Pop', 'J-Pop Top Hits'],
        japanese: ['Japanese Anime OST Lo-Fi City Pop', 'J-Pop Top Hits'],
        ko: ['Top K-Pop Korean Hits BTS Blackpink', 'K-Indie Chill'],
        korean: ['Top K-Pop Korean Hits BTS Blackpink', 'K-Indie Chill']
      };

      const mbTag = tagMapping[code] || code;
      const saavnQueries = languageKeywords[code] || [`${code} hits`];

      // Query Jamendo (limit=200), MusicBrainz (limit=100), and JioSaavn
      const [jamendoLangTracks, mbRecordings, ...saavnResults] = await Promise.all([
        jamendoApi.getTracksByLanguage(code, 200),
        musicBrainzApi.getRecordingsByTag(mbTag, 100),
        ...saavnQueries.map((q) => jioSaavnApi.searchSongs(q, 20))
      ]);

      const flattenedSaavn = saavnResults.flat();
      const seen = new Set<string>();
      const finalSongs: Song[] = [];

      // 1. Add all direct streaming songs from JioSaavn
      for (const s of flattenedSaavn) {
        if (!seen.has(s.id) && s.audioUrl) {
          seen.add(s.id);
          s.language = code;
          finalSongs.push(s);
        }
      }

      // 2. Add language tracks from Jamendo
      for (const s of jamendoLangTracks) {
        if (!seen.has(s.id) && s.audioUrl) {
          seen.add(s.id);
          s.language = code;
          finalSongs.push(s);
        }
      }

      // 3. Add MusicBrainz recordings with fallback streaming audio
      if (mbRecordings && mbRecordings.length > 0) {
        for (const mb of mbRecordings.slice(0, 30)) {
          const exists = finalSongs.some(
            (s) => s.title.toLowerCase() === mb.title.toLowerCase()
          );
          if (!exists && flattenedSaavn.length > 0) {
            const fallbackAudio = flattenedSaavn[finalSongs.length % flattenedSaavn.length];
            finalSongs.push({
              id: mb.id,
              title: mb.title,
              artistId: mb.artistId ? `mb_artist_${mb.artistId}` : 'artist_mb',
              artistName: mb.artistName,
              albumTitle: mb.releaseTitle || `${mbTag.toUpperCase()} Collection`,
              duration: mb.length || 210,
              audioUrl: fallbackAudio ? fallbackAudio.audioUrl : CURATED_FEATURED_SONGS[0].audioUrl,
              coverUrl: fallbackAudio ? fallbackAudio.coverUrl : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
              language: code,
              genre: `${mbTag.toUpperCase()} Music`,
              releaseDate: '2024',
              bitrate: 320
            });
          }
        }
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

    try {
      const list = await jioSaavnApi.searchSongs(songId.replace('saavn_', '').replace('mb_', '').replace('jamendo_', ''), 5);
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
        jioSaavnApi.searchSongs('Top Trending Tamil Songs Anirudh', 12),
        jioSaavnApi.searchSongs('Tamil Blockbuster Hits Kollywood', 12),
        jioSaavnApi.searchSongs('Latest Tamil Songs 2024', 12),
        jioSaavnApi.searchSongs('Tamil Movie Hits Vijay Rajini Kamal Ajith', 12),
        jioSaavnApi.searchSongs('Tamil Romantic Melodies Love Songs', 12),
        jioSaavnApi.searchSongs('Tamil Soulful Melody Sid Sriram Haricharan', 12),
        jioSaavnApi.searchSongs('Tamil Kuthu Folk Hits Gaana', 12),
        jioSaavnApi.searchSongs('Tamil Evergreen 90s SPB Ilayaraja', 12),
        jioSaavnApi.searchArtists('Anirudh AR Rahman Yuvan Harris Ilayaraja', 8)
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
        trending: dedupe(trending).length > 0 ? dedupe(trending) : fallbackTamil,
        hits: dedupe(hits).length > 0 ? dedupe(hits) : fallbackTamil,
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
