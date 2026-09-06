import { Song } from './music';

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
  songCount: number;
  tracks: Song[];
  isCustom?: boolean;
}
