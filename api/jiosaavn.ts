import CryptoJS from 'crypto-js';
import { Song } from '../types/music';
import { Album } from '../types/album';
import { Artist } from '../types/artist';
import { APP_CONFIG } from '../constants/config';

// saavn.dev — hosted instance of the actively-maintained sumitkolhe/jiosaavn-api.
// Deployed on Cloudflare Workers/Vercel specifically for browser consumption, so it
// sends proper CORS headers. Returns plain, ready-to-stream download URLs already
// decrypted server-side, so we don't need any DES decryption / CORS proxy chain here.
const SAAVN_BASE = 'https://saavn.dev/api';
const DES_SECRET_KEY = '38346591';

const SAAVN_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9,ta;q=0.8,hi;q=0.7',
  Referer: 'https://www.jiosaavn.com/',
  Origin: 'https://www.jiosaavn.com',
  Cookie: 'L=tamil%2Chindi%2Cenglish%2Ctelugu%2Cpunjabi%2Cmalayalam%2Ckannada;'
};

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

// image/downloadUrl both come back as an array of { quality, url } — grab the
// highest-quality entry (last in the array), falling back gracefully.
function bestUrl(arr: any): string {
  if (!arr) return '';
  if (typeof arr === 'string') return arr;
  if (Array.isArray(arr) && arr.length > 0) {
    return arr[arr.length - 1]?.url || arr[0]?.url || '';
  }
  return '';
}

function decryptMediaUrl(encUrl: string, quality: '320' | '160' | '96' = '320'): string {
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

function enhanceArtworkUrl(imgUrl: string): string {
  if (!imgUrl) return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
  return imgUrl.replace('150x150', '500x500').replace('50x50', '500x500');
}

async function fetchSaavn(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[saavn.dev] HTTP ${response.status} for ${url}`);
      return null;
    }
    const json = await response.json();
    // saavn.dev wraps everything as { success, data } — bail out cleanly on failure
    if (!json || json.success === false) return null;
    return json.data ?? json;
  } catch {
    return null;
  }
}

async function fetchDirectSaavn(endpointUrl: string): Promise<any> {
  try {
    const response = await fetch(endpointUrl, {
      headers: SAAVN_HEADERS
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch {
    // ignore
  }
  return null;
}

export const jioSaavnApi = {
  async searchSongs(query: string, limit = 20): Promise<Song[]> {
    if (!query || !query.trim()) return [];
    const clean = query.trim();

    // 1. Try saavn.dev
    const data = await fetchSaavn(
      `${SAAVN_BASE}/search/songs?query=${encodeURIComponent(clean)}&limit=${limit}`
    );
    const results = data?.results || [];
    if (results.length > 0) {
      const mapped = results.map((item: any) => this.mapSong(item)).filter((s: Song) => Boolean(s.audioUrl));
      if (mapped.length > 0) return mapped;
    }

    // 2. Direct Saavn API Fallback
    try {
      const directUrl = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        clean
      )}&n=${limit}`;
      const directData = await fetchDirectSaavn(directUrl);
      if (directData && directData.results && Array.isArray(directData.results)) {
        return directData.results
          .map((item: any) => this.mapDirectSong(item))
          .filter((s: Song) => Boolean(s.audioUrl));
      }
    } catch {
      // ignore
    }

    return [];
  },

  async getTrendingSongs(_language = 'hindi,english,punjabi,tamil', limit = 20): Promise<Song[]> {
    const queries = [
      'Top Tamil Hits Anirudh',
      'Top Bollywood Hits Arijit',
      'Trending Global Songs',
      'Top Punjabi Hits'
    ];
    const selectedQuery = queries[Math.floor(Math.random() * queries.length)];
    return this.searchSongs(selectedQuery, limit);
  },

  async searchAlbums(query: string, limit = 10): Promise<Album[]> {
    if (!query || !query.trim()) return [];
    const clean = query.trim();

    // 1. Try saavn.dev
    const data = await fetchSaavn(
      `${SAAVN_BASE}/search/albums?query=${encodeURIComponent(clean)}&limit=${limit}`
    );
    const results = data?.results || [];
    if (results.length > 0) {
      return results.map((item: any) => ({
        id: `saavn_album_${item.id}`,
        title: decodeHtmlEntities(item.name || item.title),
        artistId: `saavn_artist_${item.artists?.primary?.[0]?.id || 'various'}`,
        artistName: decodeHtmlEntities(
          item.artists?.primary?.map((a: any) => a.name).join(', ') || 'Various Artists'
        ),
        coverUrl: bestUrl(item.image) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        genre: item.language ? item.language.toUpperCase() : 'Pop',
        releaseDate: item.year || '2024',
        trackCount: parseInt(item.songCount, 10) || 5
      }));
    }

    // 2. Direct Saavn API Fallback
    try {
      const directUrl = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=search.getAlbumResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        clean
      )}&n=${limit}`;
      const directData = await fetchDirectSaavn(directUrl);
      if (directData && directData.results && Array.isArray(directData.results)) {
        return directData.results.map((item: any) => ({
          id: `saavn_album_${item.id}`,
          title: decodeHtmlEntities(item.title || item.name),
          artistId: `saavn_artist_${item.more_info?.artist_id || 'various'}`,
          artistName: decodeHtmlEntities(item.more_info?.music || item.more_info?.artistMap?.primary_artists?.[0]?.name || 'Various Artists'),
          coverUrl: enhanceArtworkUrl(item.image),
          genre: item.more_info?.language ? item.more_info.language.toUpperCase() : 'Pop',
          releaseDate: item.more_info?.year || '2024',
          trackCount: parseInt(item.more_info?.song_count, 10) || 5
        }));
      }
    } catch {
      // ignore
    }

    return [];
  },

  async searchArtists(query: string, limit = 10): Promise<Artist[]> {
    if (!query || !query.trim()) return [];
    const clean = query.trim();

    // 1. Try saavn.dev
    const data = await fetchSaavn(
      `${SAAVN_BASE}/search/artists?query=${encodeURIComponent(clean)}&limit=${limit}`
    );
    const results = data?.results || [];
    if (results.length > 0) {
      return results.map((item: any) => ({
        id: `saavn_artist_${item.id}`,
        name: decodeHtmlEntities(item.name || item.title),
        imageUrl: bestUrl(item.image) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        genres: [item.role || 'Artist', item.type || 'Music'],
        bio: `${decodeHtmlEntities(item.name)} on JioSaavn`
      }));
    }

    // 2. Direct Saavn API Fallback
    try {
      const directUrl = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=search.getArtistResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        clean
      )}&n=${limit}`;
      const directData = await fetchDirectSaavn(directUrl);
      if (directData && directData.results && Array.isArray(directData.results)) {
        return directData.results.map((item: any) => ({
          id: `saavn_artist_${item.id}`,
          name: decodeHtmlEntities(item.name || item.title),
          imageUrl: enhanceArtworkUrl(item.image),
          genres: [item.extra || 'Artist', item.language || 'Music'],
          bio: `${decodeHtmlEntities(item.name)} on JioSaavn & MusicBrainz`
        }));
      }
    } catch {
      // ignore
    }

    return [];
  },

  async getAlbumDetails(albumId: string): Promise<{ album: Album; songs: Song[] } | null> {
    const cleanId = albumId.replace('saavn_album_', '');

    // 1. Try saavn.dev
    const data = await fetchSaavn(`${SAAVN_BASE}/albums?id=${encodeURIComponent(cleanId)}`);
    if (data && (data.name || data.title)) {
      const songs: Song[] = (data.songs || []).map((s: any) => this.mapSong(s)).filter((s: Song) => Boolean(s.audioUrl));

      const album: Album = {
        id: `saavn_album_${data.id || cleanId}`,
        title: decodeHtmlEntities(data.name || data.title),
        artistId: `saavn_artist_${data.artists?.primary?.[0]?.id || 'artist'}`,
        artistName: decodeHtmlEntities(
          data.artists?.primary?.map((a: any) => a.name).join(', ') || 'Various Artists'
        ),
        coverUrl: bestUrl(data.image),
        genre: data.language ? data.language.toUpperCase() : 'Pop',
        releaseDate: data.year,
        trackCount: songs.length,
        tracks: songs
      };

      return { album, songs };
    }

    // 2. Direct Saavn API Fallback
    try {
      const directUrl = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=content.getAlbumDetails&_format=json&_marker=0&api_version=4&ctx=web6dot0&albumid=${cleanId}`;
      const directData = await fetchDirectSaavn(directUrl);
      if (directData && (directData.title || directData.name)) {
        const songs: Song[] = (directData.list || directData.songs || []).map((s: any) => this.mapDirectSong(s)).filter((s: Song) => Boolean(s.audioUrl));
        const album: Album = {
          id: `saavn_album_${directData.id || cleanId}`,
          title: decodeHtmlEntities(directData.title || directData.name),
          artistId: `saavn_artist_${directData.primary_artists_id || 'artist'}`,
          artistName: decodeHtmlEntities(directData.primary_artists || directData.artist || 'Various Artists'),
          coverUrl: enhanceArtworkUrl(directData.image),
          genre: directData.language ? directData.language.toUpperCase() : 'Pop',
          releaseDate: directData.release_date || directData.year,
          trackCount: songs.length,
          tracks: songs
        };
        return { album, songs };
      }
    } catch {
      // ignore
    }

    return null;
  },

  async getLyrics(songId: string): Promise<string> {
    if (!songId) return '';
    const cleanId = songId.replace('saavn_', '');

    // 1. Try saavn.dev
    const data = await fetchSaavn(`${SAAVN_BASE}/songs/${encodeURIComponent(cleanId)}/lyrics`);
    if (data && data.lyrics) {
      return decodeHtmlEntities(data.lyrics || '').replace(/<br\s*[\/]?>/gi, '\n');
    }

    // 2. Direct Saavn API Fallback
    try {
      const directUrl = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=lyrics.getLyrics&_format=json&_marker=0&api_version=4&ctx=web6dot0&lyrics_id=${cleanId}`;
      const directData = await fetchDirectSaavn(directUrl);
      if (directData && directData.lyrics) {
        return decodeHtmlEntities(directData.lyrics || '').replace(/<br\s*[\/]?>/gi, '\n');
      }
    } catch {
      // ignore
    }

    return '';
  },

  mapSong(item: any): Song {
    const audioUrl = bestUrl(item.downloadUrl);
    const primaryArtists = item.artists?.primary?.map((a: any) => a.name).join(', ');
    const artistName = decodeHtmlEntities(primaryArtists || item.label || 'Artist');
    const title = decodeHtmlEntities(item.name || item.title || 'Track');
    const albumTitle = decodeHtmlEntities(item.album?.name || 'Single');
    const duration = parseInt(item.duration, 10);
    const lang = (item.language || 'hindi').toLowerCase();

    return {
      id: `saavn_${item.id}`,
      title,
      artistId: item.artists?.primary?.[0]?.id ? `saavn_artist_${item.artists.primary[0].id}` : 'artist_saavn',
      artistName,
      albumId: item.album?.id ? `saavn_album_${item.album.id}` : undefined,
      albumTitle,
      duration: isNaN(duration) ? 210 : duration,
      audioUrl,
      coverUrl: bestUrl(item.image) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      language: lang,
      genre: decodeHtmlEntities(lang.toUpperCase() || 'Music'),
      releaseDate: item.year,
      bitrate: 320
    };
  },

  mapDirectSong(item: any): Song {
    const encMediaUrl = item.more_info?.encrypted_media_url || item.encrypted_media_url;
    const streamUrl = decryptMediaUrl(encMediaUrl, '320');
    const primaryArtists = item.more_info?.artistMap?.primary_artists?.map((a: any) => a.name).join(', ');
    const artistName = decodeHtmlEntities(primaryArtists || item.more_info?.music || item.subtitle || 'Artist');
    const title = decodeHtmlEntities(item.title || item.song || 'Track');
    const albumTitle = decodeHtmlEntities(item.more_info?.album || item.album || 'Single');
    const duration = parseInt(item.more_info?.duration || item.duration || '210', 10);
    const lang = item.more_info?.language || item.language || 'hindi';

    return {
      id: `saavn_${item.id}`,
      title,
      artistId: item.more_info?.artistMap?.primary_artists?.[0]?.id ? `saavn_artist_${item.more_info.artistMap.primary_artists[0].id}` : 'artist_saavn',
      artistName,
      albumId: item.more_info?.album_id ? `saavn_album_${item.more_info.album_id}` : undefined,
      albumTitle,
      duration: isNaN(duration) ? 210 : duration,
      audioUrl: streamUrl,
      coverUrl: enhanceArtworkUrl(item.image),
      language: lang.toLowerCase(),
      genre: decodeHtmlEntities(item.more_info?.genre || lang.toUpperCase() || 'Music'),
      releaseDate: item.more_info?.release_date || item.year,
      lyrics: item.more_info?.has_lyrics === 'true' && item.more_info?.lyrics_snippet ? decodeHtmlEntities(item.more_info.lyrics_snippet) : undefined,
      bitrate: 320
    };
  }
};
