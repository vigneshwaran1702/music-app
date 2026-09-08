export const APP_CONFIG = {
  APP_NAME: 'Aura Music',
  APP_VERSION: '1.0.0',
  JIOSAAVN_API_BASE: 'https://www.jiosaavn.com/api.php',
  MUSICBRAINZ_API_BASE: 'https://musicbrainz.org/ws/2',
  COVERART_ARCHIVE_BASE: 'https://coverartarchive.org',
  JAMENDO_CLIENT_ID: '88adca7c',
  JAMENDO_API_BASE: 'https://api.jamendo.com/v3.0',
  YOUTUBE_API_KEY: process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || 'AIzaSyACGsf2rRqym_WW-hrgpbRxhGh5WpVnkzI',
  YOUTUBE_API_BASE: 'https://www.googleapis.com/youtube/v3',
  DEFAULT_LANGUAGE: 'all',
  AUDIO_BITRATE: '320kbps', // '320kbps' | '160kbps' | '96kbps'
  STORAGE_KEYS: {
    FAVORITES: '@aura_music_favorites_v1',
    PLAYLISTS: '@aura_music_playlists_v1',
    HISTORY: '@aura_music_history_v1',
    DOWNLOADS: '@aura_music_downloads_v1',
    USER_SETTINGS: '@aura_music_settings_v1',
    RECENT_SEARCHES: '@aura_music_recent_searches_v1'
  },
  THEME: {
    background: '#000000',
    islandBg: '#121212',
    sidebarBg: '#121212',
    cardBackground: '#181818',
    cardBackgroundHover: '#242424',
    cardBorder: 'transparent',
    playerBg: '#000000',
    accentPrimary: '#1ed760',
    accentBrand: '#6366f1',
    accentSecondary: '#ec4899',
    accentCyan: '#06b6d4',
    accentEmerald: '#1ed760',
    accentTamil: '#f97316',
    textPrimary: '#ffffff',
    textSecondary: '#a7a7a7',
    textMuted: '#6a6a6a',
    border: '#242424',
    activeBg: '#282828'
  }
};
