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
