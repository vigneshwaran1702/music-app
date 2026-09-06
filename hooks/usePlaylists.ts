import { useState, useEffect, useCallback } from 'react';
import { Playlist } from '../types/playlist';
import { Song } from '../types/music';
import { playlistsDb } from '../database/playlists';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    const list = await playlistsDb.getPlaylists();
    setPlaylists(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const createPlaylist = async (title: string, description?: string) => {
    const pl = await playlistsDb.createPlaylist(title, description);
    await loadPlaylists();
    return pl;
  };

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    const res = await playlistsDb.addSongToPlaylist(playlistId, song);
    await loadPlaylists();
    return res;
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const res = await playlistsDb.removeSongFromPlaylist(playlistId, songId);
    await loadPlaylists();
    return res;
  };

  const deletePlaylist = async (playlistId: string) => {
    const res = await playlistsDb.deletePlaylist(playlistId);
    await loadPlaylists();
    return res;
  };

  return {
    playlists,
    loading,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    refresh: loadPlaylists
  };
}
