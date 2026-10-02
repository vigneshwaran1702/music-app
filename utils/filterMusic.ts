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

/**
 * Normalizes song title for canonical duplicate identification.
 * Strips out film prefixes, '(From "...")', '[Tamil]', feat artists, etc.
 */
export function getCanonicalSongKey(song: Song): string {
  const rawTitle = song.title || '';
  const cleanedTitle = rawTitle
    .toLowerCase()
    .replace(/\(from.*?\)/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\(feat.*?\)/gi, '')
    .replace(/\(tamil.*?\)/gi, '')
    .replace(/\(telugu.*?\)/gi, '')
    .replace(/\(hindi.*?\)/gi, '')
    .replace(/\(kannada.*?\)/gi, '')
    .replace(/\(malayalam.*?\)/gi, '')
    .replace(/\(original motion picture.*?\)/gi, '')
    .replace(/\(original soundtrack.*?\)/gi, '')
    .replace(/\(soundtrack.*?\)/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/feat\..*$/gi, '')
    .replace(/ft\..*$/gi, '')
    .replace(/official.*$/gi, '')
    .replace(/video.*$/gi, '')
    .replace(/lyric.*$/gi, '')
    .replace(/remix/gi, '')
    .replace(/lofi/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  // If title became completely empty, fallback to raw alphanumeric
  const titleKey = cleanedTitle || rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

  const primaryArtist = (song.artistName || '')
    .toLowerCase()
    .split(/[,&]/)[0]
    .replace(/[^a-z0-9]/g, '')
    .trim();

  return `${titleKey}_${primaryArtist.slice(0, 10)}`;
}

/**
 * Deduplicates songs so each song appears strictly ONE time in a playlist.
 * In accordance with user preference:
 * "in playlist place one song one time in tamil version"
 * When multiple versions of the same track exist (e.g. dubbed/multilingual versions),
 * the Tamil version is given high priority.
 */
export function deduplicateSongs(songs: Song[], targetLanguage = 'ta'): Song[] {
  const map = new Map<string, Song>();

  for (const song of songs) {
    if (!song.audioUrl) continue;
    const key = getCanonicalSongKey(song);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, song);
      continue;
    }

    // Scoring comparator: decides which version to keep
    const scoreSong = (s: Song): number => {
      let score = 0;
      const lang = (s.language || '').toLowerCase();
      const titleLower = (s.title + ' ' + (s.albumTitle || '')).toLowerCase();

      // Target language priority
      if (lang === targetLanguage.toLowerCase()) {
        score += 60;
      }

      // Tamil version preference ("place one song one time in tamil version")
      if (lang === 'ta' || titleLower.includes('tamil') || s.lyrics?.includes('Tamil') || s.id.startsWith('tamil_')) {
        score += 50;
      }

      // Penalize non-Tamil dubbed versions when comparing against Tamil
      if (targetLanguage === 'ta' && (titleLower.includes('telugu') || titleLower.includes('hindi') || titleLower.includes('kannada'))) {
        score -= 40;
      }

      // Audio stream quality
      if (s.bitrate && s.bitrate >= 320) score += 20;
      if (s.audioUrl && !s.audioUrl.includes('apple.com') && !s.audioUrl.includes('AudioPreview')) score += 20;
      if (s.lyrics) score += 10;
      if (s.duration && s.duration > 120) score += 10;

      return score;
    };

    if (scoreSong(song) > scoreSong(existing)) {
      map.set(key, song);
    }
  }

  return Array.from(map.values());
}
