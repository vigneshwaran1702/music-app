import { Platform } from 'react-native';
import CryptoJS from 'crypto-js';
import { APP_CONFIG } from '../constants/config';
import { Song } from '../types/music';
import { Album } from '../types/album';
import { Artist } from '../types/artist';

const DES_SECRET_KEY = '38346591';

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
  } catch (err) {
    console.warn('[JioSaavn] Decryption error:', err);
    return '';
  }
}

function enhanceArtworkUrl(imgUrl: string): string {
  if (!imgUrl) return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
  return imgUrl.replace('150x150', '500x500').replace('50x50', '500x500');
}

async function fetchSaavn(endpointUrl: string): Promise<any> {
  const isWeb = Platform.OS === 'web';
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(endpointUrl)}`;

  if (isWeb) {
    try {
      const res = await fetch(proxyUrl);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // try allorigins
      try {
        const alt = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(endpointUrl)}`);
        if (alt.ok) return await alt.json();
      } catch {
        // ignore
      }
    }
  }

  // Native or direct fetch
  try {
    const response = await fetch(endpointUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (response.ok) return await response.json();
  } catch (err) {
    console.warn('[fetchSaavn] Direct fetch error:', err);
  }
  return null;
}

export const jioSaavnApi = {
  async searchSongs(query: string, limit = 20): Promise<Song[]> {
    if (!query || !query.trim()) return [];
    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        query.trim()
      )}&n=${limit}`;
      const data = await fetchSaavn(url);
      if (!data || !data.results || !Array.isArray(data.results)) return [];

      return data.results
        .map((item: any) => this.mapSong(item))
        .filter((s: Song) => Boolean(s.audioUrl));
    } catch (error) {
      console.warn('[JioSaavn API] Search songs error:', error);
      return [];
    }
  },

  async getTrendingSongs(language = 'hindi,english,punjabi,tamil', limit = 20): Promise<Song[]> {
    try {
      const queries = [
        'Top Tamil Hits Anirudh',
        'Top Bollywood Hits Arijit',
        'Trending Global Songs',
        'Top Punjabi Hits'
      ];
      const selectedQuery = queries[Math.floor(Math.random() * queries.length)];
      return await this.searchSongs(selectedQuery, limit);
    } catch (error) {
      console.warn('[JioSaavn API] getTrendingSongs error:', error);
      return [];
    }
  },

  async searchAlbums(query: string, limit = 10): Promise<Album[]> {
    if (!query || !query.trim()) return [];
    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=search.getAlbumResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        query.trim()
      )}&n=${limit}`;
      const data = await fetchSaavn(url);
      if (!data || !data.results || !Array.isArray(data.results)) return [];

      return data.results.map((item: any) => ({
        id: `saavn_album_${item.id}`,
        title: decodeHtmlEntities(item.title || item.name),
        artistId: `saavn_artist_${item.more_info?.artist_id || 'various'}`,
        artistName: decodeHtmlEntities(item.more_info?.music || item.more_info?.artistMap?.primary_artists?.[0]?.name || 'Various Artists'),
        coverUrl: enhanceArtworkUrl(item.image),
        genre: item.more_info?.language ? item.more_info.language.toUpperCase() : 'Pop',
        releaseDate: item.more_info?.year || '2024',
        trackCount: parseInt(item.more_info?.song_count, 10) || 5
      }));
    } catch (error) {
      console.warn('[JioSaavn API] Search albums error:', error);
      return [];
    }
  },

  async searchArtists(query: string, limit = 10): Promise<Artist[]> {
    if (!query || !query.trim()) return [];
    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=search.getArtistResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        query.trim()
      )}&n=${limit}`;
      const data = await fetchSaavn(url);
      if (!data || !data.results || !Array.isArray(data.results)) return [];

      return data.results.map((item: any) => ({
        id: `saavn_artist_${item.id}`,
        name: decodeHtmlEntities(item.name || item.title),
        imageUrl: enhanceArtworkUrl(item.image),
        genres: [item.extra || 'Artist', item.language || 'Music'],
        bio: `${decodeHtmlEntities(item.name)} on JioSaavn & MusicBrainz`
      }));
    } catch (error) {
      console.warn('[JioSaavn API] Search artists error:', error);
      return [];
    }
  },

  async getAlbumDetails(albumId: string): Promise<{ album: Album; songs: Song[] } | null> {
    try {
      const cleanId = albumId.replace('saavn_album_', '');
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=content.getAlbumDetails&_format=json&_marker=0&api_version=4&ctx=web6dot0&albumid=${cleanId}`;
      const data = await fetchSaavn(url);
      if (!data || (!data.title && !data.name)) return null;

      const songs: Song[] = (data.list || data.songs || []).map((s: any) => this.mapSong(s)).filter((s: Song) => Boolean(s.audioUrl));

      const album: Album = {
        id: `saavn_album_${data.id || cleanId}`,
        title: decodeHtmlEntities(data.title || data.name),
        artistId: `saavn_artist_${data.primary_artists_id || 'artist'}`,
        artistName: decodeHtmlEntities(data.primary_artists || data.artist || 'Various Artists'),
        coverUrl: enhanceArtworkUrl(data.image),
        genre: data.language ? data.language.toUpperCase() : 'Pop',
        releaseDate: data.release_date || data.year,
        trackCount: songs.length,
        tracks: songs
      };

      return { album, songs };
    } catch (error) {
      console.warn('[JioSaavn API] getAlbumDetails error:', error);
      return null;
    }
  },

  async getLyrics(lyricsId: string): Promise<string> {
    if (!lyricsId) return '';
    try {
      const url = `${APP_CONFIG.JIOSAAVN_API_BASE}?__call=lyrics.getLyrics&_format=json&_marker=0&api_version=4&ctx=web6dot0&lyrics_id=${lyricsId}`;
      const data = await fetchSaavn(url);
      if (!data) return '';
      return decodeHtmlEntities(data.lyrics || '').replace(/<br\s*[\/]?>/gi, '\n');
    } catch {
      return '';
    }
  },

  mapSong(item: any): Song {
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
