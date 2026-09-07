
<img width="1907" height="975" alt="Screenshot 2026-09-07 135525" src="https://github.com/user-attachments/assets/b1785d8c-b654-408f-9654-1b9eae161578" />




# Aura Music App 🎵

A feature-rich, high-performance Music Streaming & Offline playback application built with **Expo**, **Expo Router**, **Expo AV**, and **TypeScript**.

---

## 🌟 Key Features

- 🎧 **Audio Streaming & Offline Playback**: Powered by `expo-av` and `expo-file-system` with background audio playback capabilities.
- ⚡ **Full Playback Controls**: Interactive scrubber, play/pause, seek, skip back/forward, shuffle, and repeat modes.
- 🌐 **Multi-Language Music Hub**: Explore songs in English, Spanish, Hindi, French, German, Japanese, Korean, and more.
- 🔍 **Live Search & Discovery**: Instant debounced search for tracks, artists, genres, and albums with recent search history.
- 📂 **Local Storage & Playlists**: Create custom playlists, mark favorite songs, and track listening history using persistent storage.
- ⬇️ **Offline Download Manager**: Cache royalty-free tracks directly to local storage for offline playback with file size metrics.
- 💎 **Glassmorphic Dark Mode UI**: Modern aesthetic with neon cyan and electric violet accents.
- 📱 **Floating Mini Player & Full-Screen Player**: Persistent mini player with seamless transition to the full player with lyrics and up-next queue drawer.

---

## 📁 Architecture

```
MusicApp/
│
├── app/                              # Expo Router screens
│   ├── _layout.tsx                   # Global provider & mini-player layout
│   ├── index.tsx                     # Discover / Home feed
│   ├── search.tsx                    # Live search & genre browser
│   ├── languages.tsx                 # Language catalog
│   ├── artists.tsx                   # Artists directory
│   ├── albums.tsx                    # Albums directory
│   ├── playlists.tsx                 # User custom playlists
│   ├── downloads.tsx                 # Downloaded offline music
│   ├── favorites.tsx                 # Liked songs
│   ├── language/[language].tsx       # Language-specific tracks
│   ├── artist/[artistId].tsx         # Artist profile & discography
│   ├── album/[albumId].tsx           # Album tracklist view
│   ├── song/[songId].tsx             # Song details & lyrics
│   └── player.tsx                    # Full-screen audio player modal
│
├── components/                       # Modular UI Components
│   ├── SongCard.tsx                  # List & Card track item
│   ├── ArtistCard.tsx                # Artist avatar card
│   ├── AlbumCard.tsx                 # Album artwork card
│   ├── MusicList.tsx                 # Reusable song list
│   ├── LanguageCard.tsx              # Language banner & pill
│   ├── MiniPlayer.tsx                # Bottom docked audio bar
│   ├── MusicPlayer.tsx               # Full player with queue & lyrics
│   ├── SearchBar.tsx                 # Search input with clear button
│   ├── DownloadButton.tsx            # Offline download toggle & loader
│   ├── FavoriteButton.tsx            # Heart toggle
│   └── Loading.tsx                   # Animated loader
│
├── services/                         # Service Layer
│   ├── musicApi.ts                   # Feed & music catalog aggregator
│   ├── artistApi.ts                  # Artist data provider
│   ├── albumApi.ts                   # Album details provider
│   └── downloadService.ts            # Local filesystem downloader
│
├── api/                              # Music APIs
│   ├── jamendo.ts                    # Jamendo v3.0 API client
│   ├── musicbrainz.ts                # MusicBrainz metadata integration
│   └── sources.ts                    # Royalty-free curated streams
│
├── database/                         # Offline Persistence
│   ├── storage.ts                    # Storage wrapper
│   ├── favorites.ts                  # Liked songs storage
│   ├── playlists.ts                  # Custom playlists storage
│   ├── history.ts                    # Listening & search history
│   └── downloads.ts                  # Offline track registry
│
├── hooks/                            # Custom React Hooks
│   ├── useMusic.ts
│   ├── usePlayer.ts
│   ├── useFavorites.ts
│   ├── useDownloads.ts
│   └── usePlaylists.ts
│
├── context/
│   └── PlayerContext.tsx             # Audio player state management
│
├── utils/
│   ├── languageUtils.ts
│   ├── formatDuration.ts
│   ├── filterMusic.ts
│   └── storageUtils.ts
│
├── constants/
│   ├── languages.ts
│   ├── genres.ts
│   └── config.ts
│
└── types/
    ├── music.ts
    ├── artist.ts
    ├── album.ts
    └── playlist.ts
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npx expo start
```

### 3. Run on Target Platform
- **Web**: `npm run web` or press `w` in terminal
- **Android**: `npm run android` or press `a` (requires Android Emulator / Expo Go)
- **iOS**: `npm run ios` or press `i` (macOS / Xcode / Expo Go)
