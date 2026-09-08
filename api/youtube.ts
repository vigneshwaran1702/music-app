import { Song } from '../types/music';
import { APP_CONFIG } from '../constants/config';
import { decodeHtmlEntities, jioSaavnApi } from './jiosaavn';

export interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
}

function cleanYouTubeTitle(rawTitle: string): { title: string; artistName: string } {
  let cleaned = decodeHtmlEntities(rawTitle)
    .replace(/\[official\s*(music\s*)?video\]/gi, '')
    .replace(/\(official\s*(music\s*)?video\)/gi, '')
    .replace(/\[lyric\s*(video)?\]/gi, '')
    .replace(/\(lyric\s*(video)?\)/gi, '')
    .replace(/\[4k\s*(uhd)?\]/gi, '')
    .replace(/\(4k\s*(uhd)?\)/gi, '')
    .replace(/\[full\s*song\]/gi, '')
    .replace(/\(full\s*song\)/gi, '')
    .replace(/\[audio\]/gi, '')
    .replace(/\(audio\)/gi, '')
    .replace(/\|.*$/g, '')
    .trim();

  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ');
    if (parts.length >= 2) {
      return {
        artistName: parts[0].trim(),
        title: parts.slice(1).join(' - ').trim()
      };
    }
  }

  return {
    title: cleaned,
    artistName: 'YouTube Music'
  };
}

export const youtubeApi = {
  async searchSongs(query: string, limit = 20): Promise<Song[]> {
    if (!query || !query.trim()) return [];
    const cleanQuery = query.trim();

    if (APP_CONFIG.YOUTUBE_API_KEY) {
      try {
        const url = `${APP_CONFIG.YOUTUBE_API_BASE}/search?part=snippet&maxResults=${limit}&q=${encodeURIComponent(
          cleanQuery
        )}&type=video&videoCategoryId=10&key=${APP_CONFIG.YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.items && Array.isArray(data.items)) {
            const rawItems = data.items.filter((item: YouTubeSearchItem) =>
              Boolean(item.id?.videoId)
            );

            const songs: Song[] = [];
            for (const item of rawItems) {
              const song = await this.mapYouTubeItemWithFullAudio(item);
              if (song.audioUrl) {
                songs.push(song);
              }
            }
            return songs;
          }
        }
      } catch (err) {
        console.warn('[YouTube API] YouTube Data API request error:', err);
      }
    }

    return [];
  },

  async mapYouTubeItemWithFullAudio(item: YouTubeSearchItem): Promise<Song> {
    const videoId = item.id.videoId;
    const { title, artistName } = cleanYouTubeTitle(item.snippet.title);
    const channelName = decodeHtmlEntities(item.snippet.channelTitle);
    const coverUrl =
      item.snippet.thumbnails.high?.url ||
      item.snippet.thumbnails.medium?.url ||
      item.snippet.thumbnails.default?.url ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Resolve full-length 320kbps audio from JioSaavn
    let audioUrl = '';
    let duration = 210;
    try {
      const matchQuery = `${title} ${artistName !== 'YouTube Music' ? artistName : ''}`.trim();
      const saavnMatches = await jioSaavnApi.searchSongs(matchQuery, 1);
      if (saavnMatches.length > 0 && saavnMatches[0].audioUrl) {
        audioUrl = saavnMatches[0].audioUrl;
        duration = saavnMatches[0].duration || 210;
      } else {
        // Fallback search with title only
        const saavnTitleMatches = await jioSaavnApi.searchSongs(title, 1);
        if (saavnTitleMatches.length > 0 && saavnTitleMatches[0].audioUrl) {
          audioUrl = saavnTitleMatches[0].audioUrl;
          duration = saavnTitleMatches[0].duration || 210;
        }
      }
    } catch {
      // ignore
    }

    return {
      id: `yt_${videoId}`,
      title,
      artistId: `yt_channel_${item.snippet.channelId || 'yt'}`,
      artistName: artistName !== 'YouTube Music' ? artistName : channelName,
      albumTitle: `${channelName} (YouTube)`,
      duration,
      audioUrl,
      coverUrl,
      language: 'ta',
      genre: 'Tamil / YouTube',
      releaseDate: item.snippet.publishedAt ? item.snippet.publishedAt.substring(0, 4) : '2024',
      bitrate: 320
    };
  }
};
