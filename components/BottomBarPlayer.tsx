import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePlayer } from '../hooks/usePlayer';
import { APP_CONFIG } from '../constants/config';
import { FavoriteButton } from './FavoriteButton';
import { formatDuration } from '../utils/formatDuration';

export const BottomBarPlayer: React.FC = () => {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    playbackMode,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolumeLevel,
    togglePlaybackMode,
    toggleRightPanel,
    isRightPanelOpen,
    toggleQueue,
    isQueueOpen,
    toggleLyrics,
    isLyricsOpen
  } = usePlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  const handleProgressBarClick = (e: any) => {
    if (Platform.OS === 'web' && duration > 0) {
      const rect = e.currentTarget?.getBoundingClientRect?.();
      if (rect) {
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newSec = Math.max(0, Math.min(duration, (clickX / width) * duration));
        seekTo(newSec);
      }
    }
  };

  const handleVolumeBarClick = (e: any) => {
    if (Platform.OS === 'web') {
      const rect = e.currentTarget?.getBoundingClientRect?.();
      if (rect) {
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newVol = Math.max(0, Math.min(1, clickX / width));
        setVolumeLevel(newVol);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Left: Track Meta */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.coverWrapper}
          activeOpacity={0.8}
          onPress={() => router.push(`/song/${currentTrack.id}` as any)}
        >
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.cover} />
        </TouchableOpacity>

        <View style={styles.meta}>
          <TouchableOpacity onPress={() => router.push(`/song/${currentTrack.id}` as any)}>
            <Text numberOfLines={1} style={styles.title}>
              {currentTrack.title}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (currentTrack.artistId) {
                router.push(`/artist/${currentTrack.artistId}` as any);
              }
            }}
          >
            <Text numberOfLines={1} style={styles.artist}>
              {currentTrack.artistName}
            </Text>
          </TouchableOpacity>
        </View>

        <FavoriteButton song={currentTrack} size={18} />
      </View>

      {/* Center: Controls & Scrub Bar */}
      <View style={styles.centerSection}>
        <View style={styles.controlsRow}>
          {/* Shuffle Toggle */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={togglePlaybackMode}>
            <Ionicons
              name="shuffle"
              size={18}
              color={
                playbackMode === 'shuffle'
                  ? APP_CONFIG.THEME.accentPrimary
                  : APP_CONFIG.THEME.textMuted
              }
            />
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={previousTrack}>
            <Ionicons name="play-skip-back" size={20} color={APP_CONFIG.THEME.textSecondary} />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            style={styles.playPauseBtn}
            onPress={togglePlayPause}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={22}
              color="#ffffff"
            />
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={nextTrack}>
            <Ionicons name="play-skip-forward" size={20} color={APP_CONFIG.THEME.textSecondary} />
          </TouchableOpacity>

          {/* Repeat Toggle */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={togglePlaybackMode}>
            <Ionicons
              name={playbackMode === 'repeat-one' ? 'repeat' : 'repeat-outline'}
              size={18}
              color={
                playbackMode.includes('repeat')
                  ? APP_CONFIG.THEME.accentPrimary
                  : APP_CONFIG.THEME.textMuted
              }
            />
            {playbackMode === 'repeat-one' && (
              <Text style={styles.repeatOneText}>1</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Progress Scrub Bar */}
        <View style={styles.scrubBarRow}>
          <Text style={styles.timeText}>{formatDuration(position)}</Text>

          <TouchableOpacity
            style={styles.progressBarWrapper}
            activeOpacity={0.9}
            onPress={handleProgressBarClick}
          >
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.scrubKnob, { left: `${progressPercent}%` }]} />
            </View>
          </TouchableOpacity>

          <Text style={styles.timeText}>{formatDuration(duration)}</Text>
        </View>
      </View>

      {/* Right: Actions, Queue, Lyrics & Volume */}
      <View style={styles.rightSection}>
        {/* Lyrics */}
        <TouchableOpacity
          style={[styles.actionBtn, isLyricsOpen && styles.actionBtnActive]}
          onPress={toggleLyrics}
        >
          <Ionicons
            name="musical-notes-outline"
            size={18}
            color={isLyricsOpen ? APP_CONFIG.THEME.accentPrimary : APP_CONFIG.THEME.textSecondary}
          />
        </TouchableOpacity>

        {/* Queue */}
        <TouchableOpacity
          style={[styles.actionBtn, isQueueOpen && styles.actionBtnActive]}
          onPress={toggleQueue}
        >
          <Ionicons
            name="list"
            size={18}
            color={isQueueOpen ? APP_CONFIG.THEME.accentPrimary : APP_CONFIG.THEME.textSecondary}
          />
        </TouchableOpacity>

        {/* Right Info Panel Toggle */}
        <TouchableOpacity
          style={[styles.actionBtn, isRightPanelOpen && styles.actionBtnActive]}
          onPress={toggleRightPanel}
        >
          <Ionicons
            name="newspaper-outline"
            size={18}
            color={isRightPanelOpen ? APP_CONFIG.THEME.accentPrimary : APP_CONFIG.THEME.textSecondary}
          />
        </TouchableOpacity>

        {/* Volume Control */}
        <View style={styles.volumeGroup}>
          <TouchableOpacity
            onPress={() => setVolumeLevel(volume > 0 ? 0 : 0.8)}
            style={styles.volumeIconBtn}
          >
            <Ionicons
              name={
                volume === 0
                  ? 'volume-mute-outline'
                  : volume < 0.5
                  ? 'volume-low-outline'
                  : 'volume-high-outline'
              }
              size={18}
              color={APP_CONFIG.THEME.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.volumeBarWrapper}
            activeOpacity={0.9}
            onPress={handleVolumeBarClick}
          >
            <View style={styles.volumeBarBackground}>
              <View style={[styles.volumeBarFill, { width: `${volume * 100}%` }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Fullscreen Expand */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/player')}
        >
          <Ionicons name="expand-outline" size={18} color={APP_CONFIG.THEME.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 84,
    backgroundColor: APP_CONFIG.THEME.playerBg,
    borderTopWidth: 1,
    borderTopColor: APP_CONFIG.THEME.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1000
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '28%',
    maxWidth: 280,
    gap: 12
  },
  coverWrapper: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#181b2c'
  },
  cover: {
    width: '100%',
    height: '100%'
  },
  meta: {
    flex: 1
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 2
  },
  artist: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textSecondary
  },
  centerSection: {
    flex: 1,
    maxWidth: 640,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 6
  },
  ctrlBtn: {
    padding: 6,
    position: 'relative'
  },
  playPauseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: APP_CONFIG.THEME.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4
  },
  repeatOneText: {
    position: 'absolute',
    top: 4,
    right: 3,
    fontSize: 9,
    fontWeight: '800',
    color: APP_CONFIG.THEME.accentPrimary
  },
  scrubBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10
  },
  timeText: {
    fontSize: 11,
    color: APP_CONFIG.THEME.textMuted,
    width: 36,
    textAlign: 'center'
  },
  progressBarWrapper: {
    flex: 1,
    height: 18,
    justifyContent: 'center'
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#20253b',
    borderRadius: 2,
    position: 'relative'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    borderRadius: 2
  },
  scrubKnob: {
    position: 'absolute',
    top: -4,
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '28%',
    maxWidth: 280,
    justifyContent: 'flex-end',
    gap: 12
  },
  actionBtn: {
    padding: 6
  },
  actionBtnActive: {
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)'
  },
  volumeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
    gap: 6
  },
  volumeIconBtn: {
    padding: 2
  },
  volumeBarWrapper: {
    flex: 1,
    height: 18,
    justifyContent: 'center'
  },
  volumeBarBackground: {
    height: 4,
    backgroundColor: '#20253b',
    borderRadius: 2
  },
  volumeBarFill: {
    height: '100%',
    backgroundColor: APP_CONFIG.THEME.textSecondary,
    borderRadius: 2
  }
});
