import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';

export const itunesApi = {
  async searchSongs(query: string, limit = 30): Promise<Song[]> {
    if (!query || !query.trim()) return [];
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        query.trim()
      )}&media=music&entity=song&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      return data.results
        .filter((item: any) => Boolean(item.previewUrl))
        .map((item: any) => this.mapSong(item));
    } catch (error) {
      console.warn('[iTunes API] searchSongs error:', error);
      return [];
    }
  },

  async searchArtists(query: string, limit = 10): Promise<Artist[]> {
    if (!query || !query.trim()) return [];
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        query.trim()
      )}&media=music&entity=musicArtist&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      return data.results.map((item: any) => ({
        id: `itunes_artist_${item.artistId}`,
        name: item.artistName,
        imageUrl:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        genres: item.primaryGenreName ? [item.primaryGenreName] : ['Music'],
        bio: `${item.artistName} on Apple Music & iTunes.`
      }));
    } catch (error) {
      console.warn('[iTunes API] searchArtists error:', error);
      return [];
    }
  },

  async searchAlbums(query: string, limit = 10): Promise<Album[]> {
    if (!query || !query.trim()) return [];
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        query.trim()
      )}&media=music&entity=album&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      return data.results.map((item: any) => ({
        id: `itunes_album_${item.collectionId}`,
        title: item.collectionName || item.collectionCensoredName,
        artistId: `itunes_artist_${item.artistId}`,
        artistName: item.artistName,
        coverUrl: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
        genre: item.primaryGenreName || 'Pop',
        releaseDate: item.releaseDate ? item.releaseDate.substring(0, 4) : '2024',
        trackCount: item.trackCount || 10
      }));
    } catch (error) {
      console.warn('[iTunes API] searchAlbums error:', error);
      return [];
    }
  },

  mapSong(item: any): Song {
    const artwork = (item.artworkUrl100 || item.artworkUrl60 || '')
      .replace('100x100bb', '600x600bb')
      .replace('60x60bb', '600x600bb');

    return {
      id: `itunes_${item.trackId}`,
      title: item.trackName || item.trackCensoredName || 'Track',
      artistId: `itunes_artist_${item.artistId}`,
      artistName: item.artistName || 'Artist',
      albumId: item.collectionId ? `itunes_album_${item.collectionId}` : undefined,
      albumTitle: item.collectionName || item.collectionCensoredName || 'Single',
      duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : 180,
      audioUrl: item.previewUrl,
      coverUrl:
        artwork ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      language: 'en',
      genre: item.primaryGenreName || 'Pop',
      releaseDate: item.releaseDate ? item.releaseDate.substring(0, 4) : '2024',
      bitrate: 256
    };
  }
};
