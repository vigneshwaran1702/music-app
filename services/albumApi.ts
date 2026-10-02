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
      for (const al of [...CURATED_ALBUMS, ...saavnAlbums, ...itunesAlbums]) {
        const key = al.title.toLowerCase().trim();
        if (!map.has(key)) {
          map.set(key, al);
        }
      }
      return Array.from(map.values());
    } catch {
      return CURATED_ALBUMS;
    }
  },

  async getAlbumById(albumId: string): Promise<Album | null> {
    // 1. Direct match in CURATED_ALBUMS
    const curated = CURATED_ALBUMS.find((al) => al.id === albumId);
    if (curated) {
      const matchingCurated = CURATED_FEATURED_SONGS.filter((s) => s.albumId === albumId);
      try {
        const cleanTitle = curated.title
          .replace('(Original Soundtrack)', '')
          .replace('(Original Motion Picture Soundtrack)', '')
          .trim();
        const liveTracks = await jioSaavnApi.searchSongs(cleanTitle, 25);
        const tracks = liveTracks.length > 0 ? liveTracks : matchingCurated;
        return {
          ...curated,
          tracks: tracks.length > 0 ? tracks : matchingCurated,
          trackCount: tracks.length || matchingCurated.length || 5
        };
      } catch {
        return {
          ...curated,
          tracks: matchingCurated.length > 0 ? matchingCurated : CURATED_FEATURED_SONGS.slice(0, 5),
          trackCount: matchingCurated.length || 5
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

    // 3. JioSaavn Album API if saavn_album_
    if (albumId.startsWith('saavn_album_')) {
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
