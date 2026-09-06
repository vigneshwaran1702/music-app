import { Song } from '../types/music';
import { dbStorage } from './storage';

const MAX_HISTORY = 50;
const MAX_SEARCH_HISTORY = 10;

export const historyDb = {
  async getListeningHistory(): Promise<Song[]> {
    return await dbStorage.getItem<Song[]>(dbStorage.KEYS.HISTORY, []);
  },

  async addToHistory(song: Song): Promise<void> {
    const list = await this.getListeningHistory();
    const filtered = list.filter((s) => s.id !== song.id);
    const updated = [song, ...filtered].slice(0, MAX_HISTORY);
    await dbStorage.setItem(dbStorage.KEYS.HISTORY, updated);
  },

  async clearListeningHistory(): Promise<void> {
    await dbStorage.setItem(dbStorage.KEYS.HISTORY, []);
  },

  async getRecentSearches(): Promise<string[]> {
    return await dbStorage.getItem<string[]>(dbStorage.KEYS.RECENT_SEARCHES, []);
  },

  async addRecentSearch(query: string): Promise<void> {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    const list = await this.getRecentSearches();
    const filtered = list.filter((q) => q.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, MAX_SEARCH_HISTORY);
    await dbStorage.setItem(dbStorage.KEYS.RECENT_SEARCHES, updated);
  },

  async clearRecentSearches(): Promise<void> {
    await dbStorage.setItem(dbStorage.KEYS.RECENT_SEARCHES, []);
  }
};
