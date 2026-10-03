import React, { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, Platform } from 'react-native';
import { PlayerProvider } from '../context/PlayerContext';
import { MiniPlayer } from '../components/MiniPlayer';
import { BottomBarPlayer } from '../components/BottomBarPlayer';
import { Sidebar } from '../components/Sidebar';
import { NowPlayingSidebar } from '../components/NowPlayingSidebar';
import { BottomNav } from '../components/BottomNav';
import { QueueModal } from '../components/QueueModal';
import { useResponsive } from '../hooks/useResponsive';
import { APP_CONFIG } from '../constants/config';

function AppLayout() {
  const { isDesktop, isTablet, isMobile } = useResponsive();
  const pathname = usePathname();
  const isFullScreenPlayer = pathname === '/player';

  // Inject sleek dark styles and set Aura Music title/icon on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Aura Music';
      const faviconBase64 =
        'data:image/png;base64,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';

      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.type = 'image/png';
      link.href = faviconBase64;

      const styleId = 'spotify-global-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          * {
            box-sizing: border-box;
            outline: none !important;
            -webkit-tap-highlight-color: transparent;
          }
          *:focus, *:focus-visible {
            outline: none !important;
            box-shadow: none !important;
          }
          input, textarea, button, select, [role="button"], [tabindex] {
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
            border-width: 0 !important;
          }
          input:focus, textarea:focus, button:focus, [role="button"]:focus {
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
            border-width: 0 !important;
          }
          input[type="text"], input[type="search"], input {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            background-color: transparent !important;
          }
          body {
            background-color: #000000;
            overflow: hidden;
            user-select: none;
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.4);
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Body Row with Spotify floating islands */}
      <View style={styles.mainRow}>
        {/* Left Sidebar (Desktop & Tablet) */}
        {!isMobile && !isFullScreenPlayer && <Sidebar />}

        {/* Center Content Router Canvas Island */}
        <View style={[styles.contentCanvas, !isMobile && styles.desktopContentIsland]}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#121212'
              },
              headerTintColor: APP_CONFIG.THEME.textPrimary,
              headerTitleStyle: {
                fontWeight: '700',
                color: APP_CONFIG.THEME.textPrimary
              },
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: '#121212'
              }
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: 'Aura Music',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="search"
              options={{
                title: 'Search & Explore',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="tamil"
              options={{
                title: 'Tamil Music Hub',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="library"
              options={{
                title: 'Your Library',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="languages"
              options={{
                title: 'Music by Language'
              }}
            />
            <Stack.Screen
              name="language/[language]"
              options={{
                title: 'Language Tracks'
              }}
            />
            <Stack.Screen
              name="artists"
              options={{
                title: 'Top Artists',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="artist/[artistId]"
              options={{
                title: 'Artist Profile',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="albums"
              options={{
                title: 'Albums & EPs',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="album/[albumId]"
              options={{
                title: 'Album',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="playlists"
              options={{
                title: 'Your Playlists',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="playlist/[playlistId]"
              options={{
                title: 'Playlist',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="favorites"
              options={{
                title: 'Liked Songs',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="downloads"
              options={{
                title: 'Offline Downloads',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="song/[songId]"
              options={{
                title: 'Song Details',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="player"
              options={{
                presentation: 'modal',
                headerShown: false,
                animation: 'slide_from_bottom'
              }}
            />
          </Stack>
        </View>

        {/* Right Sidebar Now Playing Panel (Desktop only) */}
        {isDesktop && !isFullScreenPlayer && <NowPlayingSidebar />}
      </View>

      {/* Desktop / Tablet Persistent Bottom Bar Player */}
      {!isMobile && !isFullScreenPlayer && <BottomBarPlayer />}

      {/* Mobile Floating Mini Player */}
      {isMobile && !isFullScreenPlayer && <MiniPlayer />}

      {/* Mobile Bottom Navigation */}
      {isMobile && !isFullScreenPlayer && <BottomNav />}

      {/* Global Queue Drawer Modal */}
      <QueueModal />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <AppLayout />
      </PlayerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#000000'
  },
  contentCanvas: {
    flex: 1,
    height: '100%',
    backgroundColor: '#121212'
  },
  desktopContentIsland: {
    borderRadius: 8,
    marginVertical: 8,
    marginRight: 8,
    overflow: 'hidden',
    backgroundColor: '#121212'
  }
});
