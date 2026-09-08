import CryptoJS from 'crypto-js';
import { Song } from '../types/music';
import { Album } from '../types/album';
import { Artist } from '../types/artist';
import { APP_CONFIG } from '../constants/config';

const DES_SECRET_KEY = '38346591';

const SAAVN_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9,ta;q=0.8,hi;q=0.7',
  Referer: 'https://www.jiosaavn.com/',
  Origin: 'https://www.jiosaavn.com',
  Cookie: 'L=tamil%2Chindi%2Cenglish%2Ctelugu%2Cpunjabi%2Cmalayalam%2Ckannada%2Cmarathi%2Cbengali%2Cgujarati;'
};

export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\\"/g, '"');
}

export function decryptMediaUrl(encUrl: string, quality: '320' | '160' | '96' = '320'): string {
  if (!encUrl) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse(DES_SECRET_KEY);
    const decrypted = CryptoJS.DES.decrypt(encUrl, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    let url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url) return '';
    if (quality === '320') {
      url = url.replace(/_96\./, '_320.').replace(/_160\./, '_320.');
    } else if (quality === '160') {
      url = url.replace(/_96\./, '_160.').replace(/_320\./, '_160.');
    }
    return url;
  } catch {
    return '';
  }
}

export function enhanceArtworkUrl(imgUrl: string): string {
  if (!imgUrl)
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
  return imgUrl
    .replace('150x150', '500x500')
    .replace('50x50', '500x500')
    .replace('http://', 'https://');
}

async function fetchDirectSaavn(endpointUrl: string): Promise<any> {
  try {
    const response = await fetch(endpointUrl, {
      headers: SAAVN_HEADERS
    });
    if (response.ok) {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        // Try trimming any prefix/suffix
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          return JSON.parse(text.substring(start, end + 1));
        }
      }
    }
  } catch (err) {
    console.warn('[JioSaavn API] fetch error for', endpointUrl, err);
  }
  return null;
}

export const jioSaavnApi = {
  async searchSongs(query: string, limit = 40, page = 1): Promise<Song[]> {
    if (!query || !query.trim()) return [];
    const clean = query.trim();

    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        clean
      )}&n=${limit}&p=${page}`;
      const data = await fetchDirectSaavn(url);
      if (data && data.results && Array.isArray(data.results)) {
        return data.results
          .map((item: any) => this.mapDirectSong(item))
          .filter((s: Song) => Boolean(s.audioUrl));
      }
    } catch (err) {
      console.warn('[JioSaavn API] searchSongs error:', err);
    }

    return [];
  },

  async getTrendingSongs(limit = 40): Promise<Song[]> {
    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=content.getTrending&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
      const data = await fetchDirectSaavn(url);
      if (Array.isArray(data) && data.length > 0) {
        const songs: Song[] = [];
        for (const item of data) {
          if (item.type === 'song') {
            const mapped = this.mapDirectSong(item);
            if (mapped.audioUrl) songs.push(mapped);
          }
          if (songs.length >= limit) break;
        }
        if (songs.length > 0) return songs;
      }
    } catch {
      // ignore
    }

    // High quality fallback queries for trending hits
    const fallbackQueries = [
      'Top Tamil Hits Anirudh',
      'Trending Bollywood Hits 2024',
      'Top Global Hits',
      'Trending Punjabi Hits'
    ];
    const results = await Promise.all(
      fallbackQueries.map((q) => this.searchSongs(q, Math.ceil(limit / fallbackQueries.length)))
    );
    return results.flat();
  },

  async searchAlbums(query: string, limit = 15): Promise<Album[]> {
    if (!query || !query.trim()) return [];
    const clean = query.trim();

    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=search.getAlbumResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        clean
      )}&n=${limit}`;
      const data = await fetchDirectSaavn(url);
      if (data && data.results && Array.isArray(data.results)) {
        return data.results.map((item: any) => ({
          id: `saavn_album_${item.id}`,
          title: decodeHtmlEntities(item.title || item.name || 'Album'),
          artistId: `saavn_artist_${item.more_info?.artist_id || 'various'}`,
          artistName: decodeHtmlEntities(
            item.more_info?.music ||
              item.more_info?.artistMap?.primary_artists?.[0]?.name ||
              item.more_info?.singers ||
              'Various Artists'
          ),
          coverUrl: enhanceArtworkUrl(item.image),
          genre: item.more_info?.language ? item.more_info.language.toUpperCase() : 'Pop',
          releaseDate: item.more_info?.year || item.year || '2024',
          trackCount: parseInt(item.more_info?.song_count || item.song_count || '5', 10) || 5
        }));
      }
    } catch (err) {
      console.warn('[JioSaavn API] searchAlbums error:', err);
    }

    return [];
  },

  async searchArtists(query: string, limit = 15): Promise<Artist[]> {
    if (!query || !query.trim()) return [];
    const clean = query.trim();

    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=search.getArtistResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        clean
      )}&n=${limit}`;
      const data = await fetchDirectSaavn(url);
      if (data && data.results && Array.isArray(data.results)) {
        return data.results.map((item: any) => ({
          id: `saavn_artist_${item.id || item.artistid || encodeURIComponent(item.name || item.title)}`,
          name: decodeHtmlEntities(item.name || item.title || 'Artist'),
          imageUrl: enhanceArtworkUrl(item.image),
          genres: [item.extra || item.role || 'Artist', item.language || 'Music'].filter(Boolean),
          bio: `${decodeHtmlEntities(item.name || item.title)} - Top recording artist on JioSaavn.`
        }));
      }
    } catch (err) {
      console.warn('[JioSaavn API] searchArtists error:', err);
    }

    return [];
  },

  async getAlbumDetails(albumId: string): Promise<{ album: Album; songs: Song[] } | null> {
    const cleanId = albumId.replace('saavn_album_', '');
    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=content.getAlbumDetails&_format=json&_marker=0&api_version=4&ctx=web6dot0&albumid=${cleanId}`;
      const data = await fetchDirectSaavn(url);
      if (data && (data.title || data.name)) {
        const rawSongs = data.list || data.songs || [];
        const songs: Song[] = rawSongs
          .map((s: any) => this.mapDirectSong(s))
          .filter((s: Song) => Boolean(s.audioUrl));

        const primaryArtist =
          data.primary_artists ||
          data.artist ||
          data.more_info?.artistMap?.primary_artists?.[0]?.name ||
          'Various Artists';

        const album: Album = {
          id: `saavn_album_${data.id || cleanId}`,
          title: decodeHtmlEntities(data.title || data.name),
          artistId: `saavn_artist_${data.primary_artists_id || 'artist'}`,
          artistName: decodeHtmlEntities(primaryArtist),
          coverUrl: enhanceArtworkUrl(data.image),
          genre: data.language ? data.language.toUpperCase() : 'Pop',
          releaseDate: data.release_date || data.year || '2024',
          trackCount: songs.length,
          tracks: songs
        };
        return { album, songs };
      }
    } catch (err) {
      console.warn('[JioSaavn API] getAlbumDetails error:', err);
    }

    return null;
  },

  async getSongDetails(songId: string): Promise<Song | null> {
    const cleanId = songId.replace('saavn_', '');
    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=song.getDetails&_format=json&_marker=0&api_version=4&ctx=web6dot0&pids=${cleanId}`;
      const data = await fetchDirectSaavn(url);
      if (data && data[cleanId]) {
        return this.mapDirectSong(data[cleanId]);
      }
    } catch {
      // ignore
    }
    return null;
  },

  async getLyrics(songId: string): Promise<string> {
    if (!songId) return '';
    const cleanId = songId.replace('saavn_', '');
    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=lyrics.getLyrics&_format=json&_marker=0&api_version=4&ctx=web6dot0&lyrics_id=${cleanId}`;
      const data = await fetchDirectSaavn(url);
      if (data && data.lyrics) {
        return decodeHtmlEntities(data.lyrics).replace(/<br\s*[\/]?>/gi, '\n');
      }
    } catch {
      // ignore
    }
    return '';
  },

  mapDirectSong(item: any): Song {
    const encMediaUrl =
      item.more_info?.encrypted_media_url || item.encrypted_media_url || '';
    const streamUrl = decryptMediaUrl(encMediaUrl, '320');
    const primaryArtists =
      item.more_info?.artistMap?.primary_artists?.map((a: any) => a.name).join(', ') ||
      item.more_info?.singers ||
      item.more_info?.music ||
      item.subtitle ||
      'Artist';

    const title = decodeHtmlEntities(item.title || item.song || item.name || 'Track');
    const albumTitle = decodeHtmlEntities(
      item.more_info?.album || item.album || 'Single'
    );
    const duration = parseInt(
      item.more_info?.duration || item.duration || '210',
      10
    );
    const lang = (item.more_info?.language || item.language || 'tamil').toLowerCase();

    return {
      id: `saavn_${item.id}`,
      title,
      artistId: item.more_info?.artistMap?.primary_artists?.[0]?.id
        ? `saavn_artist_${item.more_info.artistMap.primary_artists[0].id}`
        : 'artist_saavn',
      artistName: decodeHtmlEntities(primaryArtists),
      albumId: item.more_info?.album_id
        ? `saavn_album_${item.more_info.album_id}`
        : item.albumid
        ? `saavn_album_${item.albumid}`
        : undefined,
      albumTitle,
      duration: isNaN(duration) ? 210 : duration,
      audioUrl: streamUrl,
      coverUrl: enhanceArtworkUrl(item.image),
      language: lang,
      genre: decodeHtmlEntities(item.more_info?.genre || lang.toUpperCase() || 'Music'),
      releaseDate: item.more_info?.release_date || item.year || '2024',
      lyrics:
        item.more_info?.has_lyrics === 'true' && item.more_info?.lyrics_snippet
          ? decodeHtmlEntities(item.more_info.lyrics_snippet)
          : undefined,
      bitrate: 320
    };
  }
};
