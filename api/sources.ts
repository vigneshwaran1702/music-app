import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';

export const CURATED_FEATURED_SONGS: Song[] = [
  // Tamil Blockbusters
  {
    id: 'tamil_1',
    title: 'Hukum - Thalaivar Alappara',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander, Super Subu',
    albumId: 'album_jailer',
    albumTitle: 'Jailer (Tamil)',
    duration: 202,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=spirit-blossom-15285.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    language: 'ta',
    genre: 'Kuthu / Kollywood',
    releaseDate: '2023-08-10',
    lyrics: "ஹுக்கும்.. டைகர் கா ஹுக்கும்!\nஅளப்பற கெளப்புறோம்.. தறுமாறு வெட்டுறோம்!\nசூப்பர் ஸ்டார்.. தலைவர் வந்தா அலறனும்..."
  },
  {
    id: 'tamil_2',
    title: 'Naa Ready (From Leo)',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander, Thalapathy Vijay',
    albumId: 'album_leo',
    albumTitle: 'Leo (Tamil)',
    duration: 248,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9a8a64936.mp3?filename=synthwave-80s-110045.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    language: 'ta',
    genre: 'Kuthu / Dance',
    releaseDate: '2023-10-19',
    lyrics: "நான் ரெடி தான் வரவா?\nஅண்ணன் எறங்கி வரவா?\nதுப்பாக்கி சுடவா?\nரோட்டுல கொடி பறக்க விடுவோமா..."
  },
  {
    id: 'tamil_3',
    title: 'Arabic Kuthu - Halamithi Habibo',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander, Jonita Gandhi',
    albumId: 'album_beast',
    albumTitle: 'Beast',
    duration: 279,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tropical-summer-10332.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    language: 'ta',
    genre: 'Arabic Kuthu',
    releaseDate: '2022-04-13',
    lyrics: "மாலமதி அபிபோ.. அனஸ்தா ரஹீபோ..\nஅரபிக் குத்து ஆடுவோமா!\nஹலமிதி ஹபீபோ..."
  },
  {
    id: 'tamil_4',
    title: 'Pathala Pathala',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander, Kamal Haasan',
    albumId: 'album_vikram',
    albumTitle: 'Vikram',
    duration: 211,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=electronic-future-beats-117997.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    language: 'ta',
    genre: 'Folk / Kuthu',
    releaseDate: '2022-06-03',
    lyrics: "பத்தல பத்தல குத்து பத்தல!\nகஜா புஜா கஜா புஜா கலா பத்தல...\nஒண்டியா நின்னு ஜெயிப்போம்டா!"
  },
  {
    id: 'tamil_5',
    title: 'Ennodu Nee Irundhaal',
    artistId: 'artist_arrahman',
    artistName: 'A.R. Rahman, Sid Sriram, Sunitha Sarathy',
    albumId: 'album_i',
    albumTitle: 'I (Original Soundtrack)',
    duration: 335,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88420c690f.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    language: 'ta',
    genre: 'Melody / Classical',
    releaseDate: '2015-01-14',
    lyrics: "என்னோடு நீ இருந்தால் உயிரோடு நான் இருப்பேன்...\nஎன்னோடு நீ இருந்தால் நிலவோடு நான் சிரிப்பேன்..."
  },

  // Global & Multi-Language Tracks
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
    releaseDate: '2024-03-15'
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
    releaseDate: '2024-01-20'
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
    releaseDate: '2024-02-10'
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
    releaseDate: '2024-04-01'
  }
];

export const CURATED_ARTISTS: Artist[] = [
  {
    id: 'artist_anirudh',
    name: 'Anirudh Ravichander',
    bio: 'Renowned Indian composer and singer, known as the rockstar of Tamil cinema (Jailer, Leo, Vikram, Master).',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    monthlyListeners: 18500000,
    genres: ['Kollywood', 'Kuthu', 'EDM', 'Rock'],
    website: 'https://anirudhofficial.com'
  },
  {
    id: 'artist_arrahman',
    name: 'A.R. Rahman',
    bio: 'Academy Award and Grammy Award-winning Indian composer, producer, and the Mozart of Madras.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    monthlyListeners: 24000000,
    genres: ['Soundtrack', 'Classical', 'Sufi', 'World']
  },
  {
    id: 'artist_1',
    name: 'Nova Horizon',
    bio: 'Electronic & Synthwave duo creating futuristic soundtracks with cinematic synth soundscapes.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    monthlyListeners: 1420000,
    genres: ['Electronic', 'Synthwave', 'Ambient']
  },
  {
    id: 'artist_2',
    name: 'Luna Valiente',
    bio: 'Latin Pop sensation blending acoustic guitar rhythms with modern tropical beats.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    monthlyListeners: 980000,
    genres: ['Latin Pop', 'Reggaeton', 'Flamenco']
  }
];

export const CURATED_ALBUMS: Album[] = [
  {
    id: 'album_jailer',
    title: 'Jailer (Original Soundtrack)',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    genre: 'Kollywood / Kuthu',
    releaseDate: '2023-08-10',
    trackCount: 5
  },
  {
    id: 'album_leo',
    title: 'Leo (Original Motion Picture Soundtrack)',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    genre: 'Action / Kuthu',
    releaseDate: '2023-10-19',
    trackCount: 6
  },
  {
    id: 'album_vikram',
    title: 'Vikram (Original Soundtrack)',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    genre: 'Kollywood',
    releaseDate: '2022-06-03',
    trackCount: 5
  }
];
