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
