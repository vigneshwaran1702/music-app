import { Playlist } from '../types/playlist';
import { Song } from '../types/music';
import { dbStorage } from './storage';

export const playlistsDb = {
  async getPlaylists(): Promise<Playlist[]> {
    return await dbStorage.getItem<Playlist[]>(dbStorage.KEYS.PLAYLISTS, []);
  },

  async getPlaylistById(id: string): Promise<Playlist | null> {
    const list = await this.getPlaylists();
    return list.find((p) => p.id === id) || null;
  },

  async createPlaylist(title: string, description = ''): Promise<Playlist> {
    const list = await this.getPlaylists();
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      songCount: 0,
      tracks: [],
      isCustom: true,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
    };

    const updated = [newPlaylist, ...list];
    await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, updated);
    return newPlaylist;
  },

  async addSongToPlaylist(playlistId: string, song: Song): Promise<Playlist | null> {
    const list = await this.getPlaylists();
    const target = list.find((p) => p.id === playlistId);
    if (!target) return null;

    if (!target.tracks.some((s) => s.id === song.id)) {
      target.tracks.push(song);
      target.songCount = target.tracks.length;
      target.updatedAt = new Date().toISOString();
      if (!target.coverUrl || target.coverUrl.includes('unsplash')) {
        target.coverUrl = song.coverUrl;
      }
      await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, list);
    }
    return target;
  },

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist | null> {
    const list = await this.getPlaylists();
    const target = list.find((p) => p.id === playlistId);
    if (!target) return null;

    target.tracks = target.tracks.filter((s) => s.id !== songId);
    target.songCount = target.tracks.length;
    target.updatedAt = new Date().toISOString();
    await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, list);
    return target;
  },

  async renamePlaylist(playlistId: string, newTitle: string): Promise<Playlist | null> {
    const list = await this.getPlaylists();
    const target = list.find((p) => p.id === playlistId);
    if (!target) return null;
    target.title = newTitle;
    target.updatedAt = new Date().toISOString();
    await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, list);
    return target;
  },

  async deletePlaylist(playlistId: string): Promise<boolean> {
    const list = await this.getPlaylists();
    const updated = list.filter((p) => p.id !== playlistId);
    await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, updated);
    return true;
  }
};
