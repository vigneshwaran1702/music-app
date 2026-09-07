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

  // Inject sleek dark Spotify scrollbar styles on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'spotify-global-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          * {
            box-sizing: border-box;
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
                title: 'Top Artists'
              }}
            />
            <Stack.Screen
              name="artist/[artistId]"
              options={{
                title: 'Artist Profile'
              }}
            />
            <Stack.Screen
              name="albums"
              options={{
                title: 'Albums & EPs'
              }}
            />
            <Stack.Screen
              name="album/[albumId]"
              options={{
                title: 'Album'
              }}
            />
            <Stack.Screen
              name="playlists"
              options={{
                title: 'Your Playlists'
              }}
            />
            <Stack.Screen
              name="favorites"
              options={{
                title: 'Liked Songs'
              }}
            />
            <Stack.Screen
              name="downloads"
              options={{
                title: 'Offline Downloads'
              }}
            />
            <Stack.Screen
              name="song/[songId]"
              options={{
                title: 'Song Details'
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
