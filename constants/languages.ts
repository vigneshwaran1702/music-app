export interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
  gradient: [string, string];
  popularGenres: string[];
}

export const LANGUAGES: LanguageOption[] = [
  {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    code: 'ta',
    flag: '🇮🇳',
    gradient: ['#f97316', '#dc2626'],
    popularGenres: ['Kollywood', 'Kuthu', 'Melody', 'Carnatic', 'Indie Tamil']
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    code: 'hi',
    flag: '🇮🇳',
    gradient: ['#ec4899', '#f97316'],
    popularGenres: ['Bollywood', 'Classical', 'Sufi', 'Indipop']
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    code: 'en',
    flag: '🇺🇸',
    gradient: ['#4f46e5', '#7c3aed'],
    popularGenres: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Indie']
  },
  {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    code: 'te',
    flag: '🇮🇳',
    gradient: ['#eab308', '#ea580c'],
    popularGenres: ['Tollywood', 'Folk', 'Mass', 'Melody']
  },
  {
    id: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    code: 'pa',
    flag: '🇮🇳',
    gradient: ['#06b6d4', '#4f46e5'],
    popularGenres: ['Bhangra', 'Punjabi Pop', 'Hip Hop', 'Sufi']
  },
  {
    id: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    code: 'ml',
    flag: '🇮🇳',
    gradient: ['#10b981', '#047857'],
    popularGenres: ['Mollywood', 'Melody', 'Indie', 'Folk']
  },
  {
    id: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    code: 'kn',
    flag: '🇮🇳',
    gradient: ['#f43f5e', '#be123c'],
    popularGenres: ['Sandalwood', 'Folk', 'Bhavageethe']
  },
  {
    id: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    code: 'bn',
    flag: '🇮🇳',
    gradient: ['#14b8a6', '#0f766e'],
    popularGenres: ['Rabindra Sangeet', 'Tollywood', 'Bangla Pop']
  },
  {
    id: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    code: 'mr',
    flag: '🇮🇳',
    gradient: ['#fb923c', '#c2410c'],
    popularGenres: ['Natya Sangeet', 'Lavani', 'Marathi Pop']
  },
  {
    id: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    code: 'gu',
    flag: '🇮🇳',
    gradient: ['#a855f7', '#7e22ce'],
    popularGenres: ['Garba', 'Sugam Sangeet', 'Folk', 'Gujarati Pop']
  },
  {
    id: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    code: 'es',
    flag: '🇪🇸',
    gradient: ['#f59e0b', '#ef4444'],
    popularGenres: ['Latin', 'Reggaeton', 'Flamenco', 'Salsa']
  },
  {
    id: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    code: 'ko',
    flag: '🇰🇷',
    gradient: ['#8b5cf6', '#d946ef'],
    popularGenres: ['K-Pop', 'K-Indie', 'R&B', 'Ballad']
  },
  {
    id: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    code: 'ja',
    flag: '🇯🇵',
    gradient: ['#e11d48', '#be123c'],
    popularGenres: ['J-Pop', 'Anime OST', 'City Pop', 'Lo-Fi']
  },
  {
    id: 'fr',
    name: 'French',
    nativeName: 'Français',
    code: 'fr',
    flag: '🇫🇷',
    gradient: ['#06b6d4', '#3b82f6'],
    popularGenres: ['Chanson', 'Electro', 'French Hip-Hop', 'Acoustic']
  },
  {
    id: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    code: 'de',
    flag: '🇩🇪',
    gradient: ['#10b981', '#059669'],
    popularGenres: ['Techno', 'Rock', 'Classical', 'Pop']
  },
  {
    id: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    code: 'ar',
    flag: '🇦🇪',
    gradient: ['#d97706', '#b45309'],
    popularGenres: ['Mahraganat', 'Tarab', 'Khaleeji', 'Oud']
  }
];
