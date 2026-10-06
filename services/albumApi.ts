import { CURATED_ALBUMS, CURATED_FEATURED_SONGS } from '../client-api/sources';
import { jioSaavnApi } from '../client-api/jiosaavn';
import { itunesApi } from '../client-api/itunes';
import { Album } from '../types/album';
import { Song } from '../types/music';

export const albumApi = {
  async getAllAlbums(): Promise<Album[]> {
    try {
      const [saavnAlbums, itunesAlbums] = await Promise.all([
        jioSaavnApi.searchAlbums('Top Blockbuster Hits Tamil Bollywood English', 25).catch(() => []),
        itunesApi.searchAlbums('Top Albums 2024', 20).catch(() => [])
      ]);

      const map = new Map<string, Album>();
      // Preserve CURATED_ALBUMS order at the top
      for (const al of CURATED_ALBUMS) {
        map.set(al.id, al);
      }
      for (const al of [...saavnAlbums, ...itunesAlbums]) {
        const titleKey = al.title.toLowerCase().trim();
        const alreadyExists = Array.from(map.values()).some(
          (item) => item.title.toLowerCase().trim() === titleKey
        );
        if (!alreadyExists) {
          map.set(al.id, al);
        }
      }
      return Array.from(map.values());
    } catch {
      return CURATED_ALBUMS;
    }
  },

  async getTamilMoodAlbums(): Promise<Album[]> {
    return CURATED_ALBUMS.filter((al) => al.id.startsWith('album_tamil_'));
  },

  async getAlbumsByMood(mood: string): Promise<Album[]> {
    if (!mood || mood === 'all') return this.getAllAlbums();
    return CURATED_ALBUMS.filter(
      (al) => (al.mood && al.mood.toLowerCase() === mood.toLowerCase()) ||
              (al.genre && al.genre.toLowerCase().includes(mood.toLowerCase()))
    );
  },

  async getAlbumById(albumId: string): Promise<Album | null> {
    // 1. Direct match in CURATED_ALBUMS
    const curated = CURATED_ALBUMS.find((al) => al.id === albumId);
    if (curated) {
      if (curated.tracks && curated.tracks.length > 0) {
        return curated;
      }
      const matchingCurated = CURATED_FEATURED_SONGS.filter((s) => s.albumId === albumId);
      try {
        const queryToUse = (curated.searchQuery || curated.title)
          .replace('(Original Soundtrack)', '')
          .replace('(Original Motion Picture Soundtrack)', '')
          .trim();
        const liveTracks = await jioSaavnApi.searchSongs(queryToUse, 30);
        
        // Merge matching curated tracks + live tracks, avoiding duplicate song titles
        const tracks = [
          ...matchingCurated,
          ...liveTracks.filter(
            (lt) =>
              !matchingCurated.some(
                (mc) =>
                  mc.id === lt.id ||
                  mc.title.toLowerCase().trim() === lt.title.toLowerCase().trim()
              )
          )
        ];

        return {
          ...curated,
          tracks: tracks.length > 0 ? tracks : matchingCurated,
          trackCount: tracks.length || matchingCurated.length || curated.trackCount || 10
        };
      } catch {
        return {
          ...curated,
          tracks: matchingCurated.length > 0 ? matchingCurated : CURATED_FEATURED_SONGS.filter(s => s.language === 'ta').slice(0, 10),
          trackCount: matchingCurated.length || curated.trackCount || 10
        };
      }
    }

    // 2. Check if any songs in CURATED_FEATURED_SONGS match this albumId
    const songsInCurated = CURATED_FEATURED_SONGS.filter((s) => s.albumId === albumId);
    if (songsInCurated.length > 0) {
      const first = songsInCurated[0];
      return {
        id: albumId,
        title: first.albumTitle || first.title,
        artistId: first.artistId,
        artistName: first.artistName,
        coverUrl: first.coverUrl,
        genre: first.genre || 'Soundtrack',
        releaseDate: first.releaseDate || '2024',
        trackCount: songsInCurated.length,
        tracks: songsInCurated
      };
    }

    // 3. Album API if aura_album_ or saavn_album_
    if (albumId.startsWith('aura_album_') || albumId.startsWith('saavn_album_')) {
      const details = await jioSaavnApi.getAlbumDetails(albumId);
      if (details) {
        return details.album;
      }
    }

    // 4. Dynamic search fallback with cleaned keyword (strip album_ prefix)
    try {
      const clean = decodeURIComponent(
        albumId
          .replace('saavn_album_', '')
          .replace('itunes_album_', '')
          .replace(/^album_/, '')
          .replace(/_/g, ' ')
      );
      const saavnSongs = await jioSaavnApi.searchSongs(clean, 25).catch(() => []);

      const matchingCurated = CURATED_FEATURED_SONGS.filter(
        (s) =>
          (s.albumTitle || '').toLowerCase().includes(clean.toLowerCase()) ||
          s.title.toLowerCase().includes(clean.toLowerCase())
      );

      const isFullSong = (s: Song) =>
        Boolean(s.audioUrl) &&
        !s.audioUrl.includes('apple.com') &&
        !s.audioUrl.includes('AudioPreview') &&
        !s.audioUrl.includes('mzstatic');

      const fullSaavnSongs = saavnSongs.filter(isFullSong);
      const songs = fullSaavnSongs.length > 0 ? fullSaavnSongs : matchingCurated;
      if (songs.length > 0) {
        return {
          id: albumId,
          title: songs[0].albumTitle || clean,
          artistId: songs[0].artistId,
          artistName: songs[0].artistName,
          coverUrl: songs[0].coverUrl,
          genre: songs[0].genre,
          releaseDate: songs[0].releaseDate || '2024',
          trackCount: songs.length,
          tracks: songs
        };
      }
    } catch {
      // ignore
    }

    return null;
  }
};
