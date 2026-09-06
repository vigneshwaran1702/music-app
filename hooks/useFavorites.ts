import { useState, useEffect, useCallback } from 'react';
import { Song } from '../types/music';
import { favoritesDb } from '../database/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    const list = await favoritesDb.getFavorites();
    setFavorites(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (song: Song) => {
    const isNowFav = await favoritesDb.toggleFavorite(song);
    await loadFavorites();
    return isNowFav;
  };

  const isFavorite = (songId: string) => {
    return favorites.some((s) => s.id === songId);
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    refresh: loadFavorites
  };
}
