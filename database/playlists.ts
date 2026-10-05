import { Playlist } from '../types/playlist';
import { Song } from '../types/music';
import { dbStorage } from './storage';
import { CURATED_FEATURED_SONGS } from '../client-api/sources';
import {
  DEFAULT_PLAYLIST_COVER,
  getPlaylistCover,
  getArtistImage,
  isValidImage
} from '../constants/artistImages';
import { musicApi } from '../services/musicApi';
import { deduplicateSongs } from '../utils/filterMusic';

const CURATED_DEFAULT_PLAYLISTS: Playlist[] = [
  // --- Dedicated Separated Language Playlists ---
  {
    id: 'pl_lang_ta',
    title: 'Top Tamil Hits 🇮🇳',
    description: 'Kollywood blockbusters, viral kuthu tracks, and classic Tamil melodies.',
    coverUrl: 'https://c.saavncdn.com/187/Jailer-Tamil-2023-20230728081443-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 15,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'ta'),
    isCustom: false
  },
  {
    id: 'pl_lang_hi',
    title: 'Bollywood Hindi Hits 🇮🇳',
    description: 'Chart-topping Bollywood romance, heartbreak ballads, and dance hits.',
    coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 10,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'hi'),
    isCustom: false
  },
  {
    id: 'pl_lang_en',
    title: 'Global English Hits 🇺🇸',
    description: 'Worldwide Billboard pop, synthwave, R&B, and global smash anthems.',
    coverUrl: 'https://c.saavncdn.com/820/Blinding-Lights-English-2020-20200912094411-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 10,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'en'),
    isCustom: false
  },
  {
    id: 'pl_lang_te',
    title: 'Tollywood Telugu Hits 🇮🇳',
    description: 'High-octane mass beats and evergreen Telugu chartbusters.',
    coverUrl: 'https://c.saavncdn.com/882/Pushpa-The-Rise-Telugu-2021-20211210134426-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 8,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'te'),
    isCustom: false
  },
  {
    id: 'pl_lang_ml',
    title: 'Mollywood Malayalam Hits 🇮🇳',
    description: 'Atmospheric, soothing acoustic melodies and trending Kerala hits.',
    coverUrl: 'https://c.saavncdn.com/488/Aavesham-Malayalam-2024-20240410141013-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 8,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'ml'),
    isCustom: false
  },
  {
    id: 'pl_lang_pa',
    title: 'Punjabi Party Hits 🇮🇳',
    description: 'High-energy Punjabi bangers, hip-hop, and chart-topping beats.',
    coverUrl: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_004_20221006184542_500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 8,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'pa'),
    isCustom: false
  },
  {
    id: 'pl_lang_kn',
    title: 'Sandalwood Kannada Hits 🇮🇳',
    description: 'Massive Sandalwood mass themes and mesmerizing Kannada melodies.',
    coverUrl: 'https://c.saavncdn.com/006/KGF-Chapter-2-Kannada-2022-20220413180437-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'kn'),
    isCustom: false
  },
  {
    id: 'pl_lang_ko',
    title: 'Top K-Pop Korean Hits 🇰🇷',
    description: 'Global sensation K-Pop tracks, dance-pop, and addictive Korean hits.',
    coverUrl: 'https://c.saavncdn.com/152/Seven-feat-Latto-Clean-Ver-English-2023-20230714100627-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'ko'),
    isCustom: false
  },
  {
    id: 'pl_lang_es',
    title: 'Latin Pop & Reggaeton 🇪🇸',
    description: 'Vibrant Spanish reggaeton, Latin pop, and energetic dance anthems.',
    coverUrl: 'https://c.saavncdn.com/393/Despacito-Spanish-2017-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'es'),
    isCustom: false
  },
  {
    id: 'pl_lang_ja',
    title: 'J-Pop & Anime OST 🇯🇵',
    description: 'Iconic Japanese anime themes, city pop, and trending J-Pop tracks.',
    coverUrl: 'https://c.saavncdn.com/079/Idol-Japanese-2023-20230412140418-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter((s) => s.language === 'ja'),
    isCustom: false
  },

  // --- Vibe & Mood Curated Playlists ---
  {
    id: 'pl_vibe_party',
    title: 'Tamil Party & Mass Vibe 🔥',
    description: 'High-voltage Tamil dance party, kuthu beats, and energetic chartbusters to light up the mood.',
    coverUrl: 'https://c.saavncdn.com/187/Jailer-Tamil-2023-20230728081443-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 7,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) =>
        s.id === 'tamil_1' ||
        s.id === 'tamil_2' ||
        s.id === 'tamil_3' ||
        s.id === 'tamil_4' ||
        s.id === 'saavn_nHs_0eEA' ||
        s.id === 'saavn__GIuQbB_' ||
        s.id === 'aura_song_chellamma'
    ),
    isCustom: false
  },
  {
    id: 'pl_tamil_melody',
    title: 'Soulful Tamil Melodies 💖',
    description: 'Evergreen romantic tracks, heartwarming acoustic strings, and timeless love melodies.',
    coverUrl: 'https://c.saavncdn.com/590/I-Tamil-2014-20190822153052-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) =>
        s.id === 'tamil_5' ||
        s.id === 'tamil_7' ||
        s.id === 'saavn_asyeukc4' ||
        s.id === 'saavn_-TFpspH-' ||
        s.id === 'saavn_fqKx7XVg' ||
        s.id === 'saavn_HifBw1Ku'
    ),
    isCustom: false
  },
  {
    id: 'pl_breakup_hits',
    title: 'Tamil Breakup & Love Failure 💔',
    description: '3 AM heartbreak anthems, painful memories, and emotional healing tracks.',
    coverUrl: 'https://c.saavncdn.com/470/David-2012-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 5,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) =>
        s.id === 'saavn_itXw9yrX' ||
        s.id === 'saavn_o-IsoK2n' ||
        s.id === 'saavn_fqKx7XVg' ||
        s.id === 'saavn_EzAV-RzR' ||
        s.id === 'tamil_5'
    ),
    isCustom: false
  },
  {
    id: 'pl_sad_melancholy',
    title: 'Sad Songs & Yuvan Drugs 🌧️',
    description: 'Soul-stirring melancholy, rainy night feelings, deep emotion, and introspective melodies.',
    coverUrl: 'https://c.saavncdn.com/artists/Yuvan_Shankar_Raja_002_20180802174245_500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 5,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) =>
        s.id === 'saavn_EzAV-RzR' ||
        s.id === 'saavn_itXw9yrX' ||
        s.id === 'saavn_fqKx7XVg' ||
        s.id === 'saavn_HifBw1Ku' ||
        s.id === 'saavn_o-IsoK2n'
    ),
    isCustom: false
  },
  {
    id: 'pl_motivation_workout',
    title: 'Tamil Workout & Beast Motivation ⚡',
    description: 'Adrenaline-pumping beast mode tracks, hard-hitting gym motivation, and champion anthems.',
    coverUrl: 'https://c.saavncdn.com/415/Leo-Original-Motion-Picture-Soundtrack-English-2023-20231019170311-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 5,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) =>
        s.id === 'tamil_6' ||
        s.id === 'tamil_1' ||
        s.id === 'tamil_4' ||
        s.id === 'saavn_Cadaj1l5' ||
        s.id === 'saavn_yYDStxbl'
    ),
    isCustom: false
  },
  {
    id: 'pl_latenight_chill',
    title: 'Late Night Chill & Lo-Fi 🌙',
    description: 'Mellow acoustic rhythms, soothing Tamil lo-fi, and midnight peaceful vibes.',
    coverUrl: 'https://c.saavncdn.com/118/Katchi-Sera-From-Think-Indie-Tamil-2024-20251026074526-500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 5,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) =>
        s.id === 'tamil_8' ||
        s.id === 'saavn_-TFpspH-' ||
        s.id === 'tamil_7' ||
        s.id === 'saavn_asyeukc4' ||
        s.id === 'aura_song_enjoy_enjaami'
    ),
    isCustom: false
  },
  {
    id: 'pl_longdrive_vibe',
    title: 'Tamil Long Drive & Road Trip 🚗',
    description: 'Windows down, breezy highway melodies, and feel-good cruising tracks.',
    coverUrl: 'https://c.saavncdn.com/492/Mersal-Tamil-2017-20170820120559-500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 5,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) =>
        s.id === 'saavn_yYDStxbl' ||
        s.id === 'tamil_8' ||
        s.id === 'saavn_-TFpspH-' ||
        s.id === 'aura_song_chellamma' ||
        s.id === 'saavn_nHs_0eEA'
    ),
    isCustom: false
  },
  {
    id: 'pl_nostalgia_classics',
    title: '90s & 2000s Nostalgia Classics 📻',
    description: 'Evergreen golden era classics from Ilaiyaraaja, early A.R. Rahman, and Vidyasagar.',
    coverUrl: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 5,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) =>
        s.id === 'tamil_5' ||
        s.id === 'tamil_7' ||
        s.artistId === 'artist_arrahman' ||
        s.artistId === 'artist_harris'
    ).slice(0, 5),
    isCustom: false
  },

  // --- Artist & Curated Mixes ---
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
    id: 'pl_yuvan_hits',
    title: 'Yuvan Shankar Raja Drugs & Melodies',
    description: 'Soul-stirring BGM, addictive melodies, and vintage anthems by Yuvan Shankar Raja.',
    coverUrl: 'https://c.saavncdn.com/artists/Yuvan_Shankar_Raja_003_20210204123512_500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) => s.artistName.toLowerCase().includes('yuvan') || s.artistId === 'artist_yuvan'
    ).slice(0, 6),
    isCustom: false
  },
  {
    id: 'pl_harris_hits',
    title: 'Best of Harris Jayaraj',
    description: 'Breathtaking romantic guitar tunes, harmonies, and melodies by Harris Jayaraj.',
    coverUrl: 'https://c.saavncdn.com/artists/Harris_Jayaraj_002_20220601054350_500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) => s.artistName.toLowerCase().includes('harris') || s.artistId === 'artist_harris'
    ).slice(0, 6),
    isCustom: false
  },
  {
    id: 'pl_sid_sriram',
    title: 'Sid Sriram Vocal Magic',
    description: 'Deeply expressive, emotional vocals and romantic chartbusters by Sid Sriram.',
    coverUrl: 'https://c.saavncdn.com/artists/Sid_Sriram_002_20201211054516_500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) => s.artistName.toLowerCase().includes('sid sriram') || s.artistId === 'artist_sidsriram'
    ).slice(0, 6),
    isCustom: false
  },
  {
    id: 'pl_arijit_hits',
    title: 'Best of Arijit Singh',
    description: 'Heart-melting romantic ballads and soulful Bollywood hits by Arijit Singh.',
    coverUrl: 'https://c.saavncdn.com/artists/Arijit_Singh_002_20210603180808_500x500.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) => s.artistName.toLowerCase().includes('arijit') || s.artistId === 'artist_arijit'
    ).slice(0, 6),
    isCustom: false
  },
  {
    id: 'pl_taylor_hits',
    title: 'Taylor Swift Pop Anthems',
    description: 'Iconic pop masterstrokes, narrative poetry, and era-defining Taylor Swift classics.',
    coverUrl: 'https://c.saavncdn.com/artists/Taylor_Swift_500x500.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songCount: 6,
    tracks: CURATED_FEATURED_SONGS.filter(
      (s) => s.artistName.toLowerCase().includes('taylor swift') || s.artistId === 'artist_taylor'
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

    // Sanitize any existing playlists in storage: correct covers & deduplicate tracks (one song one time)
    list = list.map((p) => {
      const properCover = getPlaylistCover(p);
      if (p.coverUrl !== properCover) {
        p.coverUrl = properCover;
        modified = true;
      }
      if (p.tracks && p.tracks.length > 0) {
        const langTarget = p.id.startsWith('pl_lang_') ? p.id.replace('pl_lang_', '') : 'ta';
        const deduplicated = deduplicateSongs(p.tracks, langTarget);
        if (deduplicated.length !== p.tracks.length) {
          p.tracks = deduplicated;
          p.songCount = deduplicated.length;
          modified = true;
        }
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
    let found = list.find(
      (p) => p.id === id || p.id.toLowerCase() === cleanId || p.title.toLowerCase() === cleanId
    );

    // 2. Check directly in CURATED_DEFAULT_PLAYLISTS
    if (!found) {
      found = CURATED_DEFAULT_PLAYLISTS.find(
        (p) => p.id === id || p.id.toLowerCase() === cleanId || p.title.toLowerCase() === cleanId
      );
    }

    // 3. Normalized slug / substring search
    if (!found) {
      const normalizedTarget = cleanId.replace(/[^a-z0-9]/g, '');
      found = list.find((p) => {
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
    }

    // 4. If found, ensure tracks are populated (auto-fill by playlist title if empty!)
    if (found) {
      if (!found.tracks || found.tracks.length === 0) {
        const songs = await musicApi.getSongsForPlaylistName(found.title, 35);
        if (songs.length > 0) {
          found.tracks = songs;
          found.songCount = songs.length;
          await this.updatePlaylistTracks(found.id, songs);
        }
      }
      return found;
    }

    // 5. If not found at all, create a dynamic playlist by title so it never says "Playlist Not Found"!
    const generatedTitle = decodeURIComponent(id)
      .replace(/pl_artist_/gi, 'Best of ')
      .replace(/pl_/gi, '')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .trim();

    const titleCase = generatedTitle
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const songs = await musicApi.getSongsForPlaylistName(titleCase || id, 35);
    const newPlaylist: Playlist = {
      id,
      title: titleCase || 'Curated Playlist',
      description: `Curated mix featuring ${songs.length} top tracks.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      songCount: songs.length,
      tracks: songs,
      coverUrl: songs[0]?.coverUrl || DEFAULT_PLAYLIST_COVER,
      isCustom: true
    };

    list.unshift(newPlaylist);
    await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, list);
    return newPlaylist;
  },

  async updatePlaylistTracks(playlistId: string, tracks: Song[]): Promise<Playlist | null> {
    const list = await this.getPlaylists();
    const target = list.find((p) => p.id === playlistId);
    if (!target) return null;

    const langTarget = playlistId.startsWith('pl_lang_') ? playlistId.replace('pl_lang_', '') : 'ta';
    const cleanTracks = deduplicateSongs(tracks, langTarget);

    target.tracks = cleanTracks;
    target.songCount = cleanTracks.length;
    target.updatedAt = new Date().toISOString();
    if (cleanTracks.length > 0 && (!isValidImage(target.coverUrl) || target.coverUrl === DEFAULT_PLAYLIST_COVER)) {
      target.coverUrl = cleanTracks[0].coverUrl;
    }
    await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, list);
    return target;
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

    const langTarget = playlistId.startsWith('pl_lang_') ? playlistId.replace('pl_lang_', '') : 'ta';
    const cleanTracks = deduplicateSongs([...target.tracks, song], langTarget);

    target.tracks = cleanTracks;
    target.songCount = cleanTracks.length;
    target.updatedAt = new Date().toISOString();
    if (!isValidImage(target.coverUrl) || target.coverUrl === DEFAULT_PLAYLIST_COVER) {
      target.coverUrl = song.coverUrl;
    }
    await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, list);
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
  },

  async saveArtistPlaylist(
    artist: { id: string; name: string; imageUrl?: string },
    songs: Song[],
    mode: 'top20' | 'all' = 'top20'
  ): Promise<Playlist> {
    const list = await this.getPlaylists();
    const deduplicated = deduplicateSongs(songs, 'ta');
    const cleanSongs = mode === 'top20' ? deduplicated.slice(0, 20) : deduplicated;
    const cleanId = artist.id.replace(/[^a-zA-Z0-9_]/g, '');
    const playlistId = `pl_artist_${cleanId}_${mode}`;
    const title = mode === 'top20' ? `Best of ${artist.name} (Top 20)` : `${artist.name} Complete Collection`;
    const description =
      mode === 'top20'
        ? `The top ${cleanSongs.length} essential chartbusters and timeless hits by ${artist.name}.`
        : `Complete collection of ${cleanSongs.length} tracks by ${artist.name}.`;
    const coverUrl = getArtistImage(artist.name, artist.imageUrl);

    const existingIdx = list.findIndex((p) => p.id === playlistId);
    const playlist: Playlist = {
      id: playlistId,
      title,
      description,
      createdAt: existingIdx >= 0 ? list[existingIdx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      songCount: cleanSongs.length,
      tracks: cleanSongs,
      coverUrl,
      isCustom: true
    };

    if (existingIdx >= 0) {
      list[existingIdx] = playlist;
    } else {
      list.unshift(playlist);
    }

    await dbStorage.setItem(dbStorage.KEYS.PLAYLISTS, list);
    return playlist;
  },

  async isArtistPlaylistSaved(artistId: string, mode: 'top20' | 'all' = 'top20'): Promise<boolean> {
    const list = await this.getPlaylists();
    const cleanId = artistId.replace(/[^a-zA-Z0-9_]/g, '');
    const playlistId = `pl_artist_${cleanId}_${mode}`;
    return list.some((p) => p.id === playlistId);
  }
};
