import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { usePlayer } from '../hooks/usePlayer';
import { APP_CONFIG } from '../constants/config';
import { FavoriteButton } from './FavoriteButton';

export const MiniPlayer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentTrack, isPlaying, togglePlayPause, nextTrack, position, duration } = usePlayer();

  // Hide mini player on full-screen player screen
  if (!currentTrack || pathname === '/player') {
    return null;
  }

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={() => router.push('/player')}
    >
      {/* Mini Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.content}>
        <Image source={{ uri: currentTrack.coverUrl }} style={styles.cover} />

        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.title}>
            {currentTrack.title}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {currentTrack.artistName}
          </Text>
        </View>

        <View style={styles.actions}>
          <FavoriteButton song={currentTrack} size={20} />

          <TouchableOpacity
            style={styles.playButton}
            onPress={(e) => {
              e.stopPropagation?.();
              togglePlayPause();
            }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={(e) => {
              e.stopPropagation?.();
              nextTrack();
            }}
          >
            <Ionicons name="play-skip-forward" size={20} color={APP_CONFIG.THEME.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 12,
    left: 12,
    right: 12,
    backgroundColor: '#151724',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#25293d',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999
  },
  progressBarBackground: {
    width: '100%',
    height: 3,
    backgroundColor: '#202436'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: APP_CONFIG.THEME.accentPrimary
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1e2236'
  },
  meta: {
    flex: 1,
    marginHorizontal: 12
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  artist: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 2
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4
  },
  nextButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
