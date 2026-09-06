import { useState, useEffect, useCallback } from 'react';
import { Song } from '../types/music';
import { musicApi } from '../services/musicApi';

export function useMusic() {
  const [loading, setLoading] = useState<boolean>(true);
  const [featured, setFeatured] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [chillOut, setChillOut] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await musicApi.getFeed();
      setFeatured(data.featured);
      setTrending(data.trending);
      setNewReleases(data.newReleases);
      setChillOut(data.chillOut);
    } catch (err: any) {
      setError(err?.message || 'Failed to load music feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    loading,
    error,
    featured,
    trending,
    newReleases,
    chillOut,
    refresh: fetchFeed
  };
}
