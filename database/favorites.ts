import { Song } from '../types/music';
import { dbStorage } from './storage';

export const favoritesDb = {
  async getFavorites(): Promise<Song[]> {
    return await dbStorage.getItem<Song[]>(dbStorage.KEYS.FAVORITES, []);
  },

  async isFavorite(songId: string): Promise<boolean> {
    const list = await this.getFavorites();
    return list.some((s) => s.id === songId);
  },

  async toggleFavorite(song: Song): Promise<boolean> {
    const list = await this.getFavorites();
    const index = list.findIndex((s) => s.id === song.id);
    let updated: Song[];
    let isNowFavorite = false;

    if (index >= 0) {
      updated = list.filter((s) => s.id !== song.id);
      isNowFavorite = false;
    } else {
      updated = [{ ...song, isFavorite: true }, ...list];
      isNowFavorite = true;
    }

    await dbStorage.setItem(dbStorage.KEYS.FAVORITES, updated);
    return isNowFavorite;
  },

  async removeFavorite(songId: string): Promise<Song[]> {
    const list = await this.getFavorites();
    const updated = list.filter((s) => s.id !== songId);
    await dbStorage.setItem(dbStorage.KEYS.FAVORITES, updated);
    return updated;
  }
};
