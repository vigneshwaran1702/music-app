import { APP_CONFIG } from '../constants/config';
import { Song } from '../types/music';
import { CURATED_FEATURED_SONGS } from './sources';

interface JamendoTrackItem {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  album_name: string;
  album_id: string;
  audio: string;
  audiodl: string;
  image: string;
  releasedate: string;
  license_cc: string;
  musicinfo?: {
    vocalinstrumental: string;
    lang: string;
    tags: {
      genres: string[];
    };
  };
}

export const jamendoApi = {
  async getTracksByLanguage(lang: string, limit = 200): Promise<Song[]> {
    try {
      const url = `${APP_CONFIG.JAMENDO_API_BASE}/tracks/?client_id=${APP_CONFIG.JAMENDO_CLIENT_ID}&format=json&lang=${encodeURIComponent(
        lang
      )}&limit=${limit}&include=musicinfo&audioformat=mp32`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Jamendo API HTTP error: ${response.status}`);
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }
      return data.results.map((item: any) => this.mapJamendoTrack(item));
    } catch (error) {
      console.warn(`[Jamendo API] Failed fetching tracks for lang='${lang}':`, error);
      return [];
    }
  },

  async getTrendingTracks(limit = 20): Promise<Song[]> {
    try {
      const url = `${APP_CONFIG.JAMENDO_API_BASE}/tracks/?client_id=${APP_CONFIG.JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${limit}&order=popularity_week&include=musicinfo&audioformat=mp32`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Jamendo API HTTP error: ${response.status}`);
      const data = await response.json();
      if (!data.results || !data.results.length) {
        return CURATED_FEATURED_SONGS;
      }
      return data.results.map((item: any) => this.mapJamendoTrack(item));
    } catch (error) {
      console.warn('[Jamendo API] Failed fetching trending tracks, falling back to curated sources:', error);
      return CURATED_FEATURED_SONGS;
    }
  },

  async searchTracks(query: string, limit = 20): Promise<Song[]> {
    if (!query || !query.trim()) return [];
    try {
      const url = `${APP_CONFIG.JAMENDO_API_BASE}/tracks/?client_id=${APP_CONFIG.JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${limit}&search=${encodeURIComponent(
        query.trim()
      )}&include=musicinfo&audioformat=mp32`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Jamendo API HTTP error: ${response.status}`);
      const data = await response.json();
      if (!data.results || !data.results.length) {
        return CURATED_FEATURED_SONGS.filter(
          (s) =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.artistName.toLowerCase().includes(query.toLowerCase())
        );
      }
      return data.results.map((item: any) => this.mapJamendoTrack(item));
    } catch (error) {
      console.warn('[Jamendo API] Failed searching tracks, using local filter:', error);
      return CURATED_FEATURED_SONGS.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.artistName.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  async getTracksByTag(tag: string, limit = 20): Promise<Song[]> {
    try {
      const url = `${APP_CONFIG.JAMENDO_API_BASE}/tracks/?client_id=${APP_CONFIG.JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${limit}&tags=${encodeURIComponent(
        tag
      )}&order=popularity_total&audioformat=mp32`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Jamendo API HTTP error: ${response.status}`);
      const data = await response.json();
      if (!data.results || !data.results.length) {
        return CURATED_FEATURED_SONGS.filter((s) => s.genre.toLowerCase().includes(tag.toLowerCase()));
      }
      return data.results.map((item: any) => this.mapJamendoTrack(item));
    } catch (error) {
      console.warn(`[Jamendo API] Failed fetching tracks by tag '${tag}':`, error);
      return CURATED_FEATURED_SONGS.filter((s) => s.genre.toLowerCase().includes(tag.toLowerCase()));
    }
  },

  mapJamendoTrack(item: JamendoTrackItem): Song {
    const genre = item.musicinfo?.tags?.genres?.[0] || 'Music';
    const lang = item.musicinfo?.lang || 'en';

    return {
      id: `jamendo_${item.id}`,
      title: item.name,
      artistId: `jamendo_artist_${item.artist_id}`,
      artistName: item.artist_name,
      albumId: item.album_id ? `jamendo_album_${item.album_id}` : undefined,
      albumTitle: item.album_name || 'Single',
      duration: item.duration || 180,
      audioUrl: item.audio || item.audiodl,
      coverUrl: item.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      language: lang,
      genre: genre.charAt(0).toUpperCase() + genre.slice(1),
      releaseDate: item.releasedate,
      license: item.license_cc || 'Creative Commons'
    };
  }
};
