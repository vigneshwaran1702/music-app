export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string;
  albumTitle?: string;
  duration: number; // in seconds
  audioUrl: string;
  localPath?: string;
  coverUrl: string;
  language: string;
  genre: string;
  releaseDate?: string;
  bitrate?: number;
  license?: string;
  lyrics?: string;
  playCount?: number;
  isFavorite?: boolean;
  isDownloaded?: boolean;
}

export type PlaybackMode = 'normal' | 'repeat-all' | 'repeat-one' | 'shuffle';

export interface PlaybackStatus {
  isPlaying: boolean;
  isBuffering: boolean;
  position: number; // seconds
  duration: number; // seconds
  volume: number; // 0.0 - 1.0
  playbackMode: PlaybackMode;
}

export interface PlayerQueue {
  currentTrack: Song | null;
  queue: Song[];
  currentIndex: number;
  originalQueue: Song[];
}
