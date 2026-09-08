import { dbStorage } from '../database/storage';
import { Song } from '../types/music';
import { Playlist } from '../types/playlist';
import { jioSaavnApi } from './jiosaavn';
import { itunesApi } from './itunes';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_KEY = '@aura_music_spotify_token';

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email?: string;
  images?: { url: string }[];
  followers?: { total: number };
  product?: string;
}

export const spotifyApi = {
  async setAccessToken(token: string): Promise<void> {
    await dbStorage.setItem(SPOTIFY_TOKEN_KEY, token.trim());
  },

  async getAccessToken(): Promise<string | null> {
    return await dbStorage.getItem<string | null>(SPOTIFY_TOKEN_KEY, null);
  },

  async clearAccessToken(): Promise<void> {
    await dbStorage.setItem(SPOTIFY_TOKEN_KEY, null);
  },

  async getProfile(): Promise<SpotifyUserProfile | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn('[Spotify API] getProfile error:', error);
      return null;
    }
  },

  async getUserPlaylists(limit = 20): Promise<any[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.warn('[Spotify API] getUserPlaylists error:', error);
      return [];
    }
  },

  async getPlaylistDetails(playlistId: string): Promise<{
    name: string;
    description: string;
    coverUrl: string;
    tracks: any[];
  } | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/playlists/${playlistId}?fields=name,description,images,tracks.items(track(name,artists,album,duration_ms))`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!response.ok) return null;
      const data = await response.json();
      const rawTracks = (data.tracks?.items || []).map((i: any) => i.track).filter(Boolean);

      return {
        name: data.name || 'Spotify Playlist',
        description: data.description || 'Imported from Spotify',
        coverUrl: data.images?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        tracks: rawTracks
      };
    } catch (error) {
      console.warn('[Spotify API] getPlaylistDetails error:', error);
      return null;
    }
  },

  // Match Spotify track metadata with playable 320kbps stream from JioSaavn / iTunes
  async resolvePlayableTrack(spotifyTrack: any): Promise<Song | null> {
    const trackName = spotifyTrack.name;
    const artistName = spotifyTrack.artists?.[0]?.name || '';
    const query = `${trackName} ${artistName}`.trim();

    try {
      // 1. Try JioSaavn direct for full 320kbps audio
      const saavnResults = await jioSaavnApi.searchSongs(query, 3);
      if (saavnResults.length > 0 && saavnResults[0].audioUrl) {
        return saavnResults[0];
      }

      // 2. Try iTunes global
      const itunesResults = await itunesApi.searchSongs(query, 3);
      if (itunesResults.length > 0 && itunesResults[0].audioUrl) {
        return itunesResults[0];
      }
    } catch (err) {
      console.warn('[Spotify API] resolvePlayableTrack error for', query, err);
    }

    return null;
  }
};
