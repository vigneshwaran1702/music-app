import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';

export const CURATED_FEATURED_SONGS: Song[] = [
  // 1. Hukum - Thalaivar Alappara (Jailer)
  {
    id: 'tamil_1',
    title: 'Hukum - Thalaivar Alappara',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander, Super Subu',
    albumId: 'album_jailer',
    albumTitle: 'Jailer (Tamil)',
    duration: 207,
    audioUrl: 'https://aac.saavncdn.com/187/0c4d0aee91a3ac81d4b645ec448a2960_320.mp4',
    coverUrl: 'https://c.saavncdn.com/187/Jailer-Tamil-2023-20230728081443-500x500.jpg',
    language: 'ta',
    genre: 'Kuthu / Kollywood',
    releaseDate: '2023-08-10',
    lyrics: "ஹுக்கும்.. டைகர் கா ஹுக்கும்!\nஅளப்பற கெளப்புறோம்.. தறுமாறு வெட்டுறோம்!\nசூப்பர் ஸ்டார்.. தலைவர் வந்தா அலறனும்..."
  },
  // 2. Naa Ready (Leo)
  {
    id: 'tamil_2',
    title: 'Naa Ready',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander, Thalapathy Vijay',
    albumId: 'album_leo',
    albumTitle: 'Leo (Tamil)',
    duration: 248,
    audioUrl: 'https://aac.saavncdn.com/415/3789bee89b94522160f1e50b2266d2c4_320.mp4',
    coverUrl: 'https://c.saavncdn.com/415/Leo-Original-Motion-Picture-Soundtrack-English-2023-20231019170311-500x500.jpg',
    language: 'ta',
    genre: 'Kuthu / Dance',
    releaseDate: '2023-10-19',
    lyrics: "நான் ரெடி தான் வரவா?\nஅண்ணன் எறங்கி வரவா?\nதுப்பாக்கி சுடவா?\nரோட்டுல கொடி பறக்க விடுவோமா..."
  },
  // 3. Arabic Kuthu - Halamithi Habibo (Beast)
  {
    id: 'tamil_3',
    title: 'Arabic Kuthu - Halamithi Habibo',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander, Jonita Gandhi',
    albumId: 'album_beast',
    albumTitle: 'Beast',
    duration: 279,
    audioUrl: 'https://aac.saavncdn.com/510/9d96fc7ddd4ffadb745f25aed86f7a4e_320.mp4',
    coverUrl: 'https://c.saavncdn.com/510/Beast-Tamil-2022-20220504184736-500x500.jpg',
    language: 'ta',
    genre: 'Arabic Kuthu',
    releaseDate: '2022-04-13',
    lyrics: "மாலமதி அபிபோ.. அனஸ்தா ரஹீபோ..\nஅரபிக் குத்து ஆடுவோமா!\nஹலமிதி ஹபீபோ..."
  },
  // 4. Pathala Pathala (Vikram)
  {
    id: 'tamil_4',
    title: 'Pathala Pathala',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander, Kamal Haasan',
    albumId: 'album_vikram',
    albumTitle: 'Vikram',
    duration: 211,
    audioUrl: 'https://aac.saavncdn.com/973/59aea3adfea3141ddbe1bd7e1d62c762_320.mp4',
    coverUrl: 'https://c.saavncdn.com/973/Vikram-Tamil-2022-20220515182605-500x500.jpg',
    language: 'ta',
    genre: 'Folk / Kuthu',
    releaseDate: '2022-06-03',
    lyrics: "பத்தல பத்தல குத்து பத்தல!\nகஜா புஜா கஜா புஜா கலா பத்தல...\nஒண்டியா நின்னு ஜெயிப்போம்டா!"
  },
  // 5. Ennodu Nee Irundhaal (I)
  {
    id: 'tamil_5',
    title: 'Ennodu Nee Irundhaal',
    artistId: 'artist_arrahman',
    artistName: 'A.R. Rahman, Sid Sriram, Sunitha Sarathy',
    albumId: 'album_i',
    albumTitle: 'I (Original Soundtrack)',
    duration: 354,
    audioUrl: 'https://aac.saavncdn.com/590/19c5fc3ede661e36e5a87f11df716919_320.mp4',
    coverUrl: 'https://c.saavncdn.com/590/I-Tamil-2014-20190822153052-500x500.jpg',
    language: 'ta',
    genre: 'Melody / Classical',
    releaseDate: '2015-01-14',
    lyrics: "என்னோடு நீ இருந்தால் உயிரோடு நான் இருப்பேன்...\nஎன்னோடு நீ இருந்தால் நிலவோடு நான் சிரிப்பேன்..."
  },
  // 6. Badass (Leo)
  {
    id: 'tamil_6',
    title: 'Badass',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander',
    albumId: 'album_leo',
    albumTitle: 'Leo (Tamil)',
    duration: 229,
    audioUrl: 'https://aac.saavncdn.com/415/46a7b21d2a3f4b9e019a7cdff7442c55_320.mp4',
    coverUrl: 'https://c.saavncdn.com/415/Leo-Original-Motion-Picture-Soundtrack-English-2023-20231019170311-500x500.jpg',
    language: 'ta',
    genre: 'Rock / Kollywood',
    releaseDate: '2023-10-19'
  },
  // 7. Vaseegara (Minnale)
  {
    id: 'tamil_7',
    title: 'Vaseegara',
    artistId: 'artist_harris',
    artistName: 'Bombay Jayashri, Harris Jayaraj',
    albumId: 'album_minnale',
    albumTitle: 'Minnale',
    duration: 299,
    audioUrl: 'https://aac.saavncdn.com/450/4f7b9da8e887586e60b11afb602befac_320.mp4',
    coverUrl: 'https://c.saavncdn.com/450/2-In-1-Hits-Of-Maddy-Tamil-2001-20190515150512-500x500.jpg',
    language: 'ta',
    genre: 'Melody / Romance',
    releaseDate: '2001-02-02'
  },
  // 8. Katchi Sera
  {
    id: 'tamil_8',
    title: 'Katchi Sera',
    artistId: 'artist_sai',
    artistName: 'Sai Abhyankkar',
    albumTitle: 'Think Indie',
    duration: 181,
    audioUrl: 'https://aac.saavncdn.com/118/3456f4e5990e8fb33d7af6678aca034a_320.mp4',
    coverUrl: 'https://c.saavncdn.com/118/Katchi-Sera-From-Think-Indie-Tamil-2024-20251026074526-500x500.jpg',
    language: 'ta',
    genre: 'Indie Pop',
    releaseDate: '2024-01-22'
  },
  // 9. Illuminati (Aavesham)
  {
    id: 'ml_1',
    title: 'Illuminati',
    artistId: 'artist_sushin',
    artistName: 'Sushin Shyam, Dabzee',
    albumTitle: 'Aavesham',
    duration: 212,
    audioUrl: 'https://aac.saavncdn.com/202/ba6006006a2f40e6b20b5ced32cc2885_320.mp4',
    coverUrl: 'https://c.saavncdn.com/202/Aavesham-Original-Motion-Picture-Soundtrack-Malayalam-2024-20250910150630-500x500.jpg',
    language: 'ml',
    genre: 'South Indie / EDM',
    releaseDate: '2024-04-11'
  },
  // 10. Tauba Tauba (Bad Newz)
  {
    id: 'hi_1',
    title: 'Tauba Tauba',
    artistId: 'artist_karan',
    artistName: 'Karan Aujla',
    albumTitle: 'Bad Newz',
    duration: 207,
    audioUrl: 'https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4',
    coverUrl: 'https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20250730113701-500x500.jpg',
    language: 'hi',
    genre: 'Bollywood / Punjabi Pop',
    releaseDate: '2024-07-02'
  },
  // 11. Chaleya (Jawan)
  {
    id: 'hi_2',
    title: 'Chaleya',
    artistId: 'artist_anirudh',
    artistName: 'Arijit Singh, Shilpa Rao, Anirudh Ravichander',
    albumTitle: 'Jawan',
    duration: 200,
    audioUrl: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
    coverUrl: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    language: 'hi',
    genre: 'Bollywood Romance',
    releaseDate: '2023-08-14'
  },
  // 12. Kesariya (Brahmastra)
  {
    id: 'hi_3',
    title: 'Kesariya',
    artistId: 'artist_arijit',
    artistName: 'Arijit Singh, Pritam',
    albumTitle: 'Brahmastra',
    duration: 268,
    audioUrl: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4',
    coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    language: 'hi',
    genre: 'Romantic',
    releaseDate: '2022-07-17'
  },
  // 13. Shape of You
  {
    id: 'en_1',
    title: 'Shape of You',
    artistId: 'artist_edsheeran',
    artistName: 'Ed Sheeran',
    albumTitle: 'Shape of You',
    duration: 233,
    audioUrl: 'https://aac.saavncdn.com/126/da7cde34b008294e181842062530546d_320.mp4',
    coverUrl: 'https://c.saavncdn.com/126/Shape-of-You-English-2017-500x500.jpg',
    language: 'en',
    genre: 'Pop',
    releaseDate: '2017-01-06'
  },
  // 14. Blinding Lights
  {
    id: 'en_2',
    title: 'Blinding Lights',
    artistId: 'artist_theweeknd',
    artistName: 'The Weeknd',
    albumTitle: 'After Hours',
    duration: 204,
    audioUrl: 'https://aac.saavncdn.com/820/5ddb9a79a5218f85ca9bef170f3a461d_320.mp4',
    coverUrl: 'https://c.saavncdn.com/820/Blinding-Lights-English-2020-20200912094411-500x500.jpg',
    language: 'en',
    genre: 'Synthwave / Pop',
    releaseDate: '2020-03-20'
  },
  // 15. Cruel Summer
  {
    id: 'en_3',
    title: 'Cruel Summer',
    artistId: 'artist_taylorswift',
    artistName: 'Taylor Swift',
    albumTitle: 'Lover',
    duration: 178,
    audioUrl: 'https://aac.saavncdn.com/243/cf6b522de1390996fdbe109298873c72_320.mp4',
    coverUrl: 'https://c.saavncdn.com/243/Lover-English-2019-20190823000539-500x500.jpg',
    language: 'en',
    genre: 'Pop / Synth-pop',
    releaseDate: '2019-08-23'
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
    id: 'artist_arijit',
    name: 'Arijit Singh',
    bio: 'One of the most celebrated Indian playback singers, revered for soulful melodies and timeless ballads.',
    imageUrl: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    monthlyListeners: 38000000,
    genres: ['Bollywood', 'Romantic', 'Classical', 'Sufi']
  },
  {
    id: 'artist_taylorswift',
    name: 'Taylor Swift',
    bio: 'Global music icon, 14-time Grammy Award winner, and one of the highest-selling artists of all time.',
    imageUrl: 'https://c.saavncdn.com/243/Lover-English-2019-20190823000539-500x500.jpg',
    monthlyListeners: 105000000,
    genres: ['Pop', 'Synth-pop', 'Folk', 'Country']
  },
  {
    id: 'artist_theweeknd',
    name: 'The Weeknd',
    bio: 'Canadian record-breaking artist renowned for his signature R&B, dark pop, and synthwave anthems.',
    imageUrl: 'https://c.saavncdn.com/820/Blinding-Lights-English-2020-20200912094411-500x500.jpg',
    monthlyListeners: 110000000,
    genres: ['R&B', 'Pop', 'Synthwave']
  },
  {
    id: 'artist_edsheeran',
    name: 'Ed Sheeran',
    bio: 'English singer-songwriter known for chart-topping pop acoustic ballads and global arena tours.',
    imageUrl: 'https://c.saavncdn.com/126/Shape-of-You-English-2017-500x500.jpg',
    monthlyListeners: 82000000,
    genres: ['Pop', 'Acoustic', 'Folk Pop']
  }
];

export const CURATED_ALBUMS: Album[] = [
  {
    id: 'album_jailer',
    title: 'Jailer (Original Soundtrack)',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander',
    coverUrl: 'https://c.saavncdn.com/187/Jailer-Tamil-2023-20230728081443-500x500.jpg',
    genre: 'Kollywood / Kuthu',
    releaseDate: '2023-08-10',
    trackCount: 5
  },
  {
    id: 'album_leo',
    title: 'Leo (Original Motion Picture Soundtrack)',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander',
    coverUrl: 'https://c.saavncdn.com/415/Leo-Original-Motion-Picture-Soundtrack-English-2023-20231019170311-500x500.jpg',
    genre: 'Action / Kuthu',
    releaseDate: '2023-10-19',
    trackCount: 6
  },
  {
    id: 'album_vikram',
    title: 'Vikram (Original Soundtrack)',
    artistId: 'artist_anirudh',
    artistName: 'Anirudh Ravichander',
    coverUrl: 'https://c.saavncdn.com/973/Vikram-Tamil-2022-20220515182605-500x500.jpg',
    genre: 'Kollywood',
    releaseDate: '2022-06-03',
    trackCount: 5
  }
];
