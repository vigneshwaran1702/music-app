import { APP_CONFIG } from '../constants/config';
import { Artist } from '../types/artist';
import { Song } from '../types/music';

export interface MusicBrainzRecording {
  id: string;
  title: string;
  length?: number;
  artistName: string;
  artistId?: string;
  releaseTitle?: string;
  releaseMbid?: string;
  releases?: string[];
  tags?: string[];
}

export const musicBrainzApi = {
  async getArtistDetails(artistName: string): Promise<Partial<Artist> | null> {
    try {
      const url = `${APP_CONFIG.MUSICBRAINZ_API_BASE}/artist/?query=artist:${encodeURIComponent(
        artistName
      )}&fmt=json&limit=1`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AuraMusicApp/1.0.0 ( contact@auramusic.io )'
        }
      });
      if (!response.ok) return null;
      const data = await response.json();
      const artist = data.artists?.[0];
      if (!artist) return null;

      return {
        name: artist.name,
        bio: artist.disambiguation
          ? `${artist.disambiguation} (${artist.country || 'International'})`
          : `Official artist registered in MusicBrainz database (${artist.country || 'Global'})`,
        genres: artist.tags ? artist.tags.slice(0, 4).map((t: { name: string }) => t.name) : []
      };
    } catch (error) {
      console.warn('[MusicBrainz API] Error fetching artist data:', error);
      return null;
    }
  },

  async getRecordingsByTag(tag: string, limit = 100): Promise<MusicBrainzRecording[]> {
    try {
      const url = `${APP_CONFIG.MUSICBRAINZ_API_BASE}/recording?query=tag:${encodeURIComponent(
        tag.toLowerCase()
      )}&fmt=json&limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AuraMusicApp/1.0.0 ( contact@auramusic.io )'
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.recordings || !Array.isArray(data.recordings)) return [];

      return data.recordings.map((r: any) => ({
        id: `mb_${r.id}`,
        title: r.title,
        length: r.length ? Math.floor(r.length / 1000) : 210,
        artistName: r['artist-credit']?.[0]?.name || 'Various Artists',
        artistId: r['artist-credit']?.[0]?.artist?.id,
        releaseTitle: r.releases?.[0]?.title,
        releaseMbid: r.releases?.[0]?.id,
        releases: r.releases?.map((rel: any) => rel.title) || [],
        tags: r.tags?.map((t: any) => t.name) || [tag]
      }));
    } catch (error) {
      console.warn(`[MusicBrainz API] Error fetching recordings for tag '${tag}':`, error);
      return [];
    }
  },

  async searchRecordings(query: string, limit = 10): Promise<MusicBrainzRecording[]> {
    try {
      const url = `${APP_CONFIG.MUSICBRAINZ_API_BASE}/recording/?query=${encodeURIComponent(
        query
      )}&fmt=json&limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AuraMusicApp/1.0.0 ( contact@auramusic.io )'
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.recordings || !Array.isArray(data.recordings)) return [];

      return data.recordings.map((r: any) => ({
        id: `mb_${r.id}`,
        title: r.title,
        length: r.length ? Math.floor(r.length / 1000) : 210,
        artistName: r['artist-credit']?.[0]?.name || 'Unknown Artist',
        releaseTitle: r.releases?.[0]?.title,
        releaseMbid: r.releases?.[0]?.id,
        releases: r.releases?.map((rel: any) => rel.title) || []
      }));
    } catch (error) {
      console.warn('[MusicBrainz API] Search recordings error:', error);
      return [];
    }
  },

  async getCoverArt(mbid: string): Promise<string | null> {
    try {
      const url = `${APP_CONFIG.COVERART_ARCHIVE_BASE}/release/${mbid}/front-500`;
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return url;
      }
      return null;
    } catch {
      return null;
    }
  }
};
