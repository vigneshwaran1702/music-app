import { Song } from './music';

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  imageUrl: string;
  monthlyListeners?: number;
  genres: string[];
  website?: string;
  topTracks?: Song[];
  albumCount?: number;
}
