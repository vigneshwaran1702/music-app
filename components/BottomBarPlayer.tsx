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
      {/* Left: Track Meta (Spotify style) */}
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

      {/* Center: Controls & Scrub Bar (Spotify style) */}
      <View style={styles.centerSection}>
        <View style={styles.controlsRow}>
          {/* Shuffle Toggle */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={togglePlaybackMode}>
            <Ionicons
              name="shuffle"
              size={18}
              color={playbackMode === 'shuffle' ? '#1ed760' : '#a7a7a7'}
            />
            {playbackMode === 'shuffle' && <View style={styles.activeDot} />}
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={previousTrack}>
            <Ionicons name="play-skip-back" size={20} color="#b3b3b3" />
          </TouchableOpacity>

          {/* Play/Pause Button (Spotify White Circle) */}
          <TouchableOpacity
            style={styles.playPauseBtn}
            onPress={togglePlayPause}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="#000000"
            />
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={nextTrack}>
            <Ionicons name="play-skip-forward" size={20} color="#b3b3b3" />
          </TouchableOpacity>

          {/* Repeat Toggle */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={togglePlaybackMode}>
            <Ionicons
              name={playbackMode === 'repeat-one' ? 'repeat' : 'repeat-outline'}
              size={18}
              color={playbackMode.includes('repeat') ? '#1ed760' : '#a7a7a7'}
            />
            {playbackMode !== 'normal' && <View style={styles.activeDot} />}
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
        {/* Now Playing View */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={toggleRightPanel}
        >
          <Ionicons
            name="play-circle-outline"
            size={19}
            color={isRightPanelOpen ? '#1ed760' : '#a7a7a7'}
          />
        </TouchableOpacity>

        {/* Lyrics */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={toggleLyrics}
        >
          <Ionicons
            name="mic-outline"
            size={18}
            color={isLyricsOpen ? '#1ed760' : '#a7a7a7'}
          />
        </TouchableOpacity>

        {/* Queue */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={toggleQueue}
        >
          <Ionicons
            name="list"
            size={19}
            color={isQueueOpen ? '#1ed760' : '#a7a7a7'}
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
              color="#a7a7a7"
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
          <Ionicons name="expand-outline" size={17} color="#a7a7a7" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 76,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#181818',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 1000
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    maxWidth: 320,
    gap: 12
  },
  coverWrapper: {
    width: 56,
    height: 56,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#282828'
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
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2
  },
  artist: {
    fontSize: 12,
    color: '#a7a7a7'
  },
  centerSection: {
    flex: 1,
    maxWidth: 722,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 4
  },
  ctrlBtn: {
    padding: 6,
    position: 'relative'
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1ed760'
  },
  playPauseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  repeatOneText: {
    position: 'absolute',
    top: 4,
    right: 3,
    fontSize: 9,
    fontWeight: '800',
    color: '#1ed760'
  },
  scrubBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8
  },
  timeText: {
    fontSize: 11,
    color: '#a7a7a7',
    width: 36,
    textAlign: 'center'
  },
  progressBarWrapper: {
    flex: 1,
    height: 14,
    justifyContent: 'center'
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#4d4d4d',
    borderRadius: 2,
    position: 'relative'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
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
    width: '30%',
    maxWidth: 320,
    justifyContent: 'flex-end',
    gap: 8
  },
  actionBtn: {
    padding: 6
  },
  volumeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    gap: 6
  },
  volumeIconBtn: {
    padding: 2
  },
  volumeBarWrapper: {
    flex: 1,
    height: 14,
    justifyContent: 'center'
  },
  volumeBarBackground: {
    height: 4,
    backgroundColor: '#4d4d4d',
    borderRadius: 2
  },
  volumeBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2
  }
});
