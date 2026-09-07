import React from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Body Row */}
      <View style={styles.mainRow}>
        {/* Left Sidebar (Desktop & Tablet) */}
        {!isMobile && !isFullScreenPlayer && <Sidebar />}

        {/* Center Content Router Canvas */}
        <View style={styles.contentCanvas}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: APP_CONFIG.THEME.background
              },
              headerTintColor: APP_CONFIG.THEME.textPrimary,
              headerTitleStyle: {
                fontWeight: '700',
                color: APP_CONFIG.THEME.textPrimary
              },
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: APP_CONFIG.THEME.background
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
    backgroundColor: APP_CONFIG.THEME.background
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  contentCanvas: {
    flex: 1,
    height: '100%',
    backgroundColor: APP_CONFIG.THEME.background
  }
});
