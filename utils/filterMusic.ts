import { Song } from '../types/music';

export function filterSongsByQuery(songs: Song[], query: string): Song[] {
  if (!query || !query.trim()) return songs;
  const clean = query.trim().toLowerCase();
  return songs.filter(
    (s) =>
      s.title.toLowerCase().includes(clean) ||
      s.artistName.toLowerCase().includes(clean) ||
      (s.albumTitle && s.albumTitle.toLowerCase().includes(clean)) ||
      (s.genre && s.genre.toLowerCase().includes(clean))
  );
}

export function filterSongsByLanguage(songs: Song[], langCode: string): Song[] {
  if (!langCode || langCode === 'all') return songs;
  return songs.filter((s) => s.language.toLowerCase() === langCode.toLowerCase());
}

export function filterSongsByGenre(songs: Song[], genreId: string): Song[] {
  if (!genreId || genreId === 'all') return songs;
  return songs.filter((s) => s.genre.toLowerCase().includes(genreId.toLowerCase()));
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
