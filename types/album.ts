import { Song } from './music';

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  releaseDate?: string;
  genre: string;
  trackCount: number;
  tracks?: Song[];
}
