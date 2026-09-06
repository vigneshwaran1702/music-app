import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';

export const CURATED_FEATURED_SONGS: Song[] = [
  {
    id: 'curated_1',
    title: 'Midnight City Lights',
    artistId: 'artist_1',
    artistName: 'Nova Horizon',
    albumId: 'album_1',
    albumTitle: 'Neon Odyssey',
    duration: 215,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    language: 'en',
    genre: 'Electronic',
    releaseDate: '2024-03-15',
    lyrics: "Neon signs reflecting in the rain\nLost in frequencies we can't explain\nChasing the beat through the sleepless night\nUnderneath the midnight city light..."
  },
  {
    id: 'curated_2',
    title: 'Sol y Arena',
    artistId: 'artist_2',
    artistName: 'Luna Valiente',
    albumId: 'album_2',
    albumTitle: 'Corazón del Mar',
    duration: 188,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tropical-summer-10332.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    language: 'es',
    genre: 'Latin Pop',
    releaseDate: '2024-01-20',
    lyrics: "Baila bajo el sol caliente\nOlas que acarician la mente\nSentir el ritmo en la piel\nUn amor que sabe a miel..."
  },
  {
    id: 'curated_3',
    title: 'Sufi Soul Whispers',
    artistId: 'artist_3',
    artistName: 'Aarav & The Mystic Band',
    albumId: 'album_3',
    albumTitle: 'Rangrez',
    duration: 260,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=spirit-blossom-15285.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    language: 'hi',
    genre: 'Sufi / Classical',
    releaseDate: '2024-02-10',
    lyrics: "तेरे रंग में रंगी ये शाम\nधड़कन लेती तेरा नाम\nरूहानी सुरों का ये समां\nखो जाए दिल यहाँ वहाँ..."
  },
  {
    id: 'curated_4',
    title: 'Tokyo Rain Memories',
    artistId: 'artist_4',
    artistName: 'Kenji Takahashi',
    albumId: 'album_4',
    albumTitle: 'Shinjuku Twilight',
    duration: 195,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chill-lofi-song-8444.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    language: 'ja',
    genre: 'Lo-Fi / Chill',
    releaseDate: '2024-04-01',
    lyrics: "雨の新宿、静かな街角\nコーヒーの香りと冷たい風\n遠ざかる足音、過ぎ去る時間..."
  },
  {
    id: 'curated_5',
    title: 'Champs-Élysées Dreams',
    artistId: 'artist_5',
    artistName: 'Chloé Fontaine',
    albumId: 'album_5',
    albumTitle: 'Parisian Nights',
    duration: 210,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88420c690f.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    language: 'fr',
    genre: 'Chanson / Acoustic',
    releaseDate: '2023-11-12',
    lyrics: "Dans les rues pavées de souvenirs\nLe vent murmure nos désirs\nUn café chaud, un doux regard\nTout recommence ce soir..."
  },
  {
    id: 'curated_6',
    title: 'Cyberpunk Drive 2099',
    artistId: 'artist_1',
    artistName: 'Nova Horizon',
    albumId: 'album_1',
    albumTitle: 'Neon Odyssey',
    duration: 240,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9a8a64936.mp3?filename=synthwave-80s-110045.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    language: 'en',
    genre: 'Synthwave',
    releaseDate: '2024-03-15'
  },
  {
    id: 'curated_7',
    title: 'Seoul Starlight',
    artistId: 'artist_6',
    artistName: 'Min-Jun & Luna',
    albumId: 'album_6',
    albumTitle: 'Hongdae Nights',
    duration: 198,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=floating-abstract-142819.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&auto=format&fit=crop&q=80',
    language: 'ko',
    genre: 'K-Indie / Pop',
    releaseDate: '2024-02-28'
  },
  {
    id: 'curated_8',
    title: 'Berlin Underground Pulse',
    artistId: 'artist_7',
    artistName: 'Klaus Richter',
    albumId: 'album_7',
    albumTitle: 'Klangwerk',
    duration: 275,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=electronic-future-beats-117997.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    language: 'de',
    genre: 'Techno',
    releaseDate: '2023-12-05'
  }
];

export const CURATED_ARTISTS: Artist[] = [
  {
    id: 'artist_1',
    name: 'Nova Horizon',
    bio: 'Electronic & Synthwave duo creating futuristic soundtracks with cinematic synth soundscapes.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    monthlyListeners: 1420000,
    genres: ['Electronic', 'Synthwave', 'Ambient'],
    website: 'https://novahorizon.music'
  },
  {
    id: 'artist_2',
    name: 'Luna Valiente',
    bio: 'Latin Pop sensation blending acoustic guitar rhythms with modern tropical beats.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    monthlyListeners: 980000,
    genres: ['Latin Pop', 'Reggaeton', 'Flamenco']
  },
  {
    id: 'artist_3',
    name: 'Aarav & The Mystic Band',
    bio: 'Pioneering fusion of classical Indian ragas and contemporary acoustic harmonies.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    monthlyListeners: 2300000,
    genres: ['Sufi', 'Classical', 'Indipop']
  },
  {
    id: 'artist_4',
    name: 'Kenji Takahashi',
    bio: 'Tokyo-based beatmaker producing nostalgic lo-fi, city pop and chillhop grooves.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    monthlyListeners: 750000,
    genres: ['Lo-Fi', 'Chillhop', 'Ambient']
  },
  {
    id: 'artist_5',
    name: 'Chloé Fontaine',
    bio: 'Parisian singer-songwriter crafting intimate acoustic melodies and indie chanson.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    monthlyListeners: 610000,
    genres: ['Chanson', 'Acoustic', 'Indie']
  }
];

export const CURATED_ALBUMS: Album[] = [
  {
    id: 'album_1',
    title: 'Neon Odyssey',
    artistId: 'artist_1',
    artistName: 'Nova Horizon',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    genre: 'Electronic',
    releaseDate: '2024-03-15',
    trackCount: 2
  },
  {
    id: 'album_2',
    title: 'Corazón del Mar',
    artistId: 'artist_2',
    artistName: 'Luna Valiente',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    genre: 'Latin Pop',
    releaseDate: '2024-01-20',
    trackCount: 1
  },
  {
    id: 'album_3',
    title: 'Rangrez',
    artistId: 'artist_3',
    artistName: 'Aarav & The Mystic Band',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    genre: 'Sufi / Classical',
    releaseDate: '2024-02-10',
    trackCount: 1
  },
  {
    id: 'album_4',
    title: 'Shinjuku Twilight',
    artistId: 'artist_4',
    artistName: 'Kenji Takahashi',
    coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi / Chill',
    releaseDate: '2024-04-01',
    trackCount: 1
  }
];
