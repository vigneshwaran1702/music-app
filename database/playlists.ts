import { Playlist } from '../types/playlist';
import { Song } from '../types/music';
import { dbStorage } from './storage';
import { CURATED_FEATURED_SONGS } from '../client-api/sources';
import {
  DEFAULT_PLAYLIST_COVER,
  getPlaylistCover,
  isValidImage
} from '../constants/artistImages';

const CURATED_DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'pl_tamil_blockbusters',
    title: 'Top Tamil Chartbusters',
    description: 'Electrifying mass anthems and trending Kollywood chartbusters.',
    coverUrl: 'https://c.saavncdn.com/187/Jailer-Tamil-2023-20230728081443-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'ta').slice(0, 6),
    isCustom: false
  },
  {
    id: 'pl_anirudh_hits',
    title: 'Anirudh Rockstar Anthems',
    description: 'High-voltage beats, EDM and mass anthems composed by Anirudh Ravichander.',
    coverUrl: 'https://c.saavncdn.com/artists/Anirudh_Ravichander_003_20260121134149_500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) => s.artistName.toLowerCase().includes('anirudh') || s.artistId === 'artist_anirudh'
    ).slice(0, 6),
    isCustom: false
  },
  {
    id: 'pl_rahman_essentials',
    title: 'A.R. Rahman Masterpieces',
    description: 'Timeless compositions and soulful melodies by Oscar winner A.R. Rahman.',
    coverUrl: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 5,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) => s.artistName.toLowerCase().includes('rahman') || s.artistId === 'artist_arrahman'
    ).slice(0, 5),
    isCustom: false
  },
  {
    id: 'pl_romantic_melodies',
    title: 'Soulful Romantic Melodies',
    description: 'Heart-touching romantic tracks and soothing acoustic love songs.',
    coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) =>
        (s.genre || '').includes('Melody') ||
        (s.genre || '').includes('Romantic') ||
        s.title.includes('Kesariya') ||
        s.title.includes('Chaleya')
    ).slice(0, 6),
    isCustom: false
  },
  {
    id: 'pl_global_top',
    title: 'Global Top Smash Hits',
    description: 'Worldwide chart-topping pop, synthwave and R&B hits.',
    coverUrl: 'https://c.saavncdn.com/820/Blinding-Lights-English-2020-20200912094411-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'en').slice(0, 6),
    isCustom: false
  }
];

export const playlistsDb = {
  async getPlaylists(): Promise<Playlist[]> {
    let list = await dbStorage.getItem<Playlist[]>(dbStorage.KEYS.PLAYLISTS, []);
    if (!list) list = [];

    // Ensure curated default playlists are always present in the library
    let modified = false;
    for (const defPl of CURATED_DEFAULT_PLAYLISTS) {
      const idx = list.findIndex((p) => p.id === defPl.id);
      if (idx === -1) {
        list.push(defPl);
        modified = true;
      } else if (!list[idx].tracks || list[idx].tracks.length === 0) {
        // Upgrade empty placeholder with curated tracks
        list[idx] = { ...defPl, ...list[idx], tracks: defPl.tracks, songCount: defPl.tracks.length };
        modified = true;
      }
    }

    // Sanitize any existing playlists in storage to ensure accurate covers
    list = list.map((p) => {
      const properCover = getPlaylistCover(p);
      if (p.coverUrl !== properCover) {
        p.coverUrl = properCover;
        modified = true;
      }
      return p;
    });

    if (modified) {
      await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, list);
    }

    return list;
  },

  async getPlaylistById(id: string): Promise<Playlist | null> {
    if (!id) return null;
    const cleanId = decodeURIComponent(id).trim().toLowerCase();

    // 1. Check in full playlists collection
    const list = await this.getPlaylists();
    const found = list.find(
      (p) => p.id === id || p.id.toLowerCase() === cleanId || p.title.toLowerCase() === cleanId
    );
    if (found) return found;

    // 2. Check directly in CURATED_DEFAULT_PLAYLISTS
    const curated = CURATED_DEFAULT_PLAYLISTS.find(
      (p) => p.id === id || p.id.toLowerCase() === cleanId || p.title.toLowerCase() === cleanId
    );
    if (curated) return curated;

    // 3. Normalized slug / substring search
    const normalizedTarget = cleanId.replace(/[^a-z0-9]/g, '');
    const fuzzy = list.find((p) => {
      const normId = p.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normTitle = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        normId === normalizedTarget ||
        normTitle === normalizedTarget ||
        normId.includes(normalizedTarget) ||
        normalizedTarget.includes(normId) ||
        normTitle.includes(normalizedTarget) ||
        normalizedTarget.includes(normTitle)
      );
    });
    if (fuzzy) return fuzzy;

    return null;
  },

  async createPlaylist(title: string, description = '', coverUrl?: string): Promise<Playlist> {
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
      coverUrl: isValidImage(coverUrl) ? coverUrl : DEFAULT_PLAYLIST_COVER
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
      if (!isValidImage(target.coverUrl) || target.coverUrl === DEFAULT_PLAYLIST_COVER) {
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
    if (target.tracks.length > 0 && (!isValidImage(target.coverUrl) || target.coverUrl === DEFAULT_PLAYLIST_COVER)) {
      target.coverUrl = target.tracks[0].coverUrl;
    }
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
