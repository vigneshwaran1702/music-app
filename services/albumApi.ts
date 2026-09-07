import { CURATED_ALBUMS, CURATED_FEATURED_SONGS } from '../api/sources';
import { jioSaavnApi } from '../api/jiosaavn';
import { Album } from '../types/album';

export const albumApi = {
  async getAllAlbums(): Promise<Album[]> {
    try {
      const saavnAlbums = await jioSaavnApi.searchAlbums('Top Hits', 8);
      if (saavnAlbums.length > 0) {
        return [...saavnAlbums, ...CURATED_ALBUMS];
      }
      return CURATED_ALBUMS;
    } catch {
      return CURATED_ALBUMS;
    }
  },

  async getAlbumById(albumId: string): Promise<Album | null> {
    const curated = CURATED_ALBUMS.find((al) => al.id === albumId);
    if (curated) {
      try {
        const liveTracks = await jioSaavnApi.searchSongs(curated.title.replace('(Original Soundtrack)', '').replace('(Original Motion Picture Soundtrack)', ''), 15);
        const tracks = liveTracks.length > 0 ? liveTracks : CURATED_FEATURED_SONGS.filter((s) => s.albumId === albumId);
        return {
          ...curated,
          tracks: tracks.length > 0 ? tracks : CURATED_FEATURED_SONGS.slice(0, 5),
          trackCount: tracks.length || 5
        };
      } catch {
        const tracks = CURATED_FEATURED_SONGS.filter((s) => s.albumId === albumId);
        return {
          ...curated,
          tracks: tracks.length > 0 ? tracks : CURATED_FEATURED_SONGS.slice(0, 3)
        };
      }
    }

    if (albumId.startsWith('saavn_album_')) {
      const details = await jioSaavnApi.getAlbumDetails(albumId);
      if (details) {
        return details.album;
      }
    }

    // Search query fallback
    try {
      const clean = albumId.replace('saavn_album_', '');
      const songs = await jioSaavnApi.searchSongs(clean, 10);
      if (songs.length > 0) {
        return {
          id: albumId,
          title: songs[0].albumTitle || 'Album',
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
