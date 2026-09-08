import { Song } from '../types/music';
import { APP_CONFIG } from '../constants/config';
import { decodeHtmlEntities } from './jiosaavn';

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

  // Try parsing "Artist - Title" or "Title - Artist" format
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

    // 1. If user provided a YouTube API key in config / environment
    if (APP_CONFIG.YOUTUBE_API_KEY) {
      try {
        const url = `${APP_CONFIG.YOUTUBE_API_BASE}/search?part=snippet&maxResults=${limit}&q=${encodeURIComponent(
          cleanQuery
        )}&type=video&videoCategoryId=10&key=${APP_CONFIG.YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.items && Array.isArray(data.items)) {
            return data.items
              .filter((item: YouTubeSearchItem) => Boolean(item.id?.videoId))
              .map((item: YouTubeSearchItem) => this.mapYouTubeItem(item));
          }
        }
      } catch (err) {
        console.warn('[YouTube API] YouTube Data API request error:', err);
      }
    }

    return [];
  },

  mapYouTubeItem(item: YouTubeSearchItem): Song {
    const videoId = item.id.videoId;
    const { title, artistName } = cleanYouTubeTitle(item.snippet.title);
    const channelName = decodeHtmlEntities(item.snippet.channelTitle);
    const coverUrl =
      item.snippet.thumbnails.high?.url ||
      item.snippet.thumbnails.medium?.url ||
      item.snippet.thumbnails.default?.url ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Direct streaming URL or fallback audio URL
    const audioUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return {
      id: `yt_${videoId}`,
      title,
      artistId: `yt_channel_${item.snippet.channelId || 'yt'}`,
      artistName: artistName !== 'YouTube Music' ? artistName : channelName,
      albumTitle: `${channelName} (YouTube)`,
      duration: 210,
      audioUrl,
      coverUrl,
      language: 'ta',
      genre: 'Tamil / YouTube',
      releaseDate: item.snippet.publishedAt ? item.snippet.publishedAt.substring(0, 4) : '2024',
      bitrate: 160
    };
  }
};
