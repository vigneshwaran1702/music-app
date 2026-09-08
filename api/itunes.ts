import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';
import { jioSaavnApi } from './jiosaavn';

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

      const rawTracks = data.results.filter((item: any) => Boolean(item.trackName));
      const songs: Song[] = [];

      for (const item of rawTracks) {
        const song = await this.mapSongWithFullAudio(item);
        if (song.audioUrl) {
          songs.push(song);
        }
      }

      return songs;
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

  async mapSongWithFullAudio(item: any): Promise<Song> {
    const artwork = (item.artworkUrl100 || item.artworkUrl60 || '')
      .replace('100x100bb', '600x600bb')
      .replace('60x60bb', '600x600bb');

    const trackName = item.trackName || item.trackCensoredName || 'Track';
    const artistName = item.artistName || 'Artist';
    const durationMs = item.trackTimeMillis || 210000;
    const durationSec = Math.floor(durationMs / 1000);

    // Resolve full 320kbps audio from JioSaavn instead of using 30s preview
    let fullAudioUrl = '';
    try {
      const match = await jioSaavnApi.searchSongs(`${trackName} ${artistName}`, 1);
      if (match.length > 0 && match[0].audioUrl) {
        fullAudioUrl = match[0].audioUrl;
      }
    } catch {
      // ignore
    }

    return {
      id: `itunes_${item.trackId}`,
      title: trackName,
      artistId: `itunes_artist_${item.artistId}`,
      artistName: artistName,
      albumId: item.collectionId ? `itunes_album_${item.collectionId}` : undefined,
      albumTitle: item.collectionName || item.collectionCensoredName || 'Single',
      duration: durationSec > 0 ? durationSec : 210,
      audioUrl: fullAudioUrl,
      coverUrl:
        artwork ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      language: 'en',
      genre: item.primaryGenreName || 'Pop',
      releaseDate: item.releaseDate ? item.releaseDate.substring(0, 4) : '2024',
      bitrate: 320
    };
  }
};
