import { useState, useEffect, useCallback, useRef } from 'react';
import { Song } from '../types/music';
import { musicApi, shuffleArray } from '../services/musicApi';
import { useAuth } from '../context/AuthContext';

export function useMusic() {
  const { shuffleCounter } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [featured, setFeatured] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [youtubeTrending, setYoutubeTrending] = useState<Song[]>([]);
  const [instagramTrending, setInstagramTrending] = useState<Song[]>([]);
  const [spotifyTrending, setSpotifyTrending] = useState<Song[]>([]);
  const [googleTrending, setGoogleTrending] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [chillOut, setChillOut] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  const prevCounter = useRef(shuffleCounter);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await musicApi.getFeed();
      setFeatured(data.featured);
      setTrending(data.trending);
      setYoutubeTrending(data.youtubeTrending);
      setInstagramTrending(data.instagramTrending);
      setSpotifyTrending(data.spotifyTrending);
      setGoogleTrending(data.googleTrending);
      setNewReleases(data.newReleases);
      setChillOut(data.chillOut);
    } catch (err: any) {
      setError(err?.message || 'Failed to load music feed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Instant in-place shuffle of current state (for ultra-fast reactive shuffle without awaiting network)
  const shuffleCurrentLists = useCallback(() => {
    setFeatured((prev) => shuffleArray(prev));
    setTrending((prev) => shuffleArray(prev));
    setYoutubeTrending((prev) => shuffleArray(prev));
    setInstagramTrending((prev) => shuffleArray(prev));
    setSpotifyTrending((prev) => shuffleArray(prev));
    setGoogleTrending((prev) => shuffleArray(prev));
    setNewReleases((prev) => shuffleArray(prev));
    setChillOut((prev) => shuffleArray(prev));
  }, []);

  // Initial load
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Reshuffle feed whenever shuffleCounter changes (triggered on login, logout, or manual shuffle)
  useEffect(() => {
    if (prevCounter.current !== shuffleCounter) {
      prevCounter.current = shuffleCounter;
      // Reshuffle existing songs instantly, then fetch fresh randomized batch
      shuffleCurrentLists();
      fetchFeed();
    }
  }, [shuffleCounter, shuffleCurrentLists, fetchFeed]);

  return {
    loading,
    error,
    featured,
    trending,
    youtubeTrending,
    instagramTrending,
    spotifyTrending,
    googleTrending,
    newReleases,
    chillOut,
    refresh: fetchFeed,
    shuffleFeed: shuffleCurrentLists
  };
}
