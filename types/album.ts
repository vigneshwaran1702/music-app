import { Song } from './music';

export interface Album {
  id: string;
  title: string;
  tamilTitle?: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  releaseDate?: string;
  genre: string;
  trackCount: number;
  tracks?: Song[];
  mood?: string;
  description?: string;
  searchQuery?: string;
  badge?: string;
  gradient?: [string, string];
}
