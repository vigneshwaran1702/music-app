import { CURATED_ALBUMS, CURATED_FEATURED_SONGS } from '../api/sources';
import { jioSaavnApi } from '../api/jiosaavn';
import { itunesApi } from '../api/itunes';
import { Album } from '../types/album';

export const albumApi = {
  async getAllAlbums(): Promise<Album[]> {
    try {
      const [saavnAlbums, itunesAlbums] = await Promise.all([
        jioSaavnApi.searchAlbums('Top Blockbuster Hits Tamil Bollywood English', 20),
        itunesApi.searchAlbums('Top Albums', 10)
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
    const curated = CURATED_ALBUMS.find((al) => al.id === albumId);
    if (curated) {
      try {
        const cleanTitle = curated.title
          .replace('(Original Soundtrack)', '')
          .replace('(Original Motion Picture Soundtrack)', '')
          .trim();
        const liveTracks = await jioSaavnApi.searchSongs(cleanTitle, 25);
        const tracks =
          liveTracks.length > 0
            ? liveTracks
            : CURATED_FEATURED_SONGS.filter((s) => s.albumId === albumId);

        return {
          ...curated,
          tracks: tracks.length > 0 ? tracks : CURATED_FEATURED_SONGS.slice(0, 6),
          trackCount: tracks.length || 6
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

    // Dynamic search fallback for album title
    try {
      const clean = decodeURIComponent(
        albumId
          .replace('saavn_album_', '')
          .replace('itunes_album_', '')
          .replace(/_/g, ' ')
      );
      const [saavnSongs, itunesSongs] = await Promise.all([
        jioSaavnApi.searchSongs(clean, 25),
        itunesApi.searchSongs(clean, 10)
      ]);

      const songs = saavnSongs.length > 0 ? saavnSongs : itunesSongs;
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
