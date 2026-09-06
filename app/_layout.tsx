import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { PlayerProvider } from '../context/PlayerContext';
import { MiniPlayer } from '../components/MiniPlayer';
import { APP_CONFIG } from '../constants/config';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
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

          {/* Persistent Floating Mini Audio Player */}
          <MiniPlayer />
        </View>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.THEME.background
  }
});
