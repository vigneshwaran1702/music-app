import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../types/music';
import { usePlayer } from '../hooks/usePlayer';
import { FavoriteButton } from './FavoriteButton';
import { DownloadButton } from './DownloadButton';
import { formatDuration } from '../utils/formatDuration';
import { APP_CONFIG } from '../constants/config';

interface SongCardProps {
  song: Song;
  playlist?: Song[];
  variant?: 'list' | 'card' | 'compact';
  onPress?: () => void;
  showActions?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  playlist,
  variant = 'list',
  onPress,
  showActions = true
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const isCurrent = currentTrack?.id === song.id;

  const handleCardPress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(song, playlist);
    }
  };

  if (variant === 'card') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.cardContainer, isCurrent && styles.activeBorder]}
        onPress={handleCardPress}
      >
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: song.coverUrl }} style={styles.cardImage} />
          <View style={styles.playOverlay}>
            <Ionicons
              name={isCurrent && isPlaying ? 'pause' : 'play'}
              size={24}
              color="#ffffff"
            />
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text numberOfLines={1} style={[styles.cardTitle, isCurrent && styles.activeText]}>
            {song.title}
          </Text>
          <Text numberOfLines={1} style={styles.cardArtist}>
            {song.artistName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.listContainer, isCurrent && styles.activeBg]}
      onPress={handleCardPress}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: song.coverUrl }} style={styles.listImage} />
        {isCurrent && (
          <View style={styles.playingBadge}>
            <Ionicons
              name={isPlaying ? 'volume-high' : 'pause'}
              size={14}
              color={APP_CONFIG.THEME.accentPrimary}
            />
          </View>
        )}
      </View>

      <View style={styles.infoWrapper}>
        <Text numberOfLines={1} style={[styles.listTitle, isCurrent && styles.activeText]}>
          {song.title}
        </Text>
        <View style={styles.subMeta}>
          <Text numberOfLines={1} style={styles.listArtist}>
            {song.artistName}
          </Text>
          {song.duration ? (
            <Text style={styles.durationText}> • {formatDuration(song.duration)}</Text>
          ) : null}
        </View>
      </View>

      {showActions && (
        <View style={styles.actionsWrapper}>
          <DownloadButton song={song} size={18} />
          <FavoriteButton song={song} size={18} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: APP_CONFIG.THEME.cardBackground
  },
  activeBg: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1
  },
  activeBorder: {
    borderColor: APP_CONFIG.THEME.accentPrimary,
    borderWidth: 2
  },
  imageWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden'
  },
  listImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1f2438'
  },
  playingBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 2
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 3
  },
  activeText: {
    color: APP_CONFIG.THEME.accentPrimary,
    fontWeight: '700'
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  listArtist: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    maxWidth: '80%'
  },
  durationText: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted
  },
  actionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  cardContainer: {
    width: 140,
    marginRight: 14,
    borderRadius: 14,
    backgroundColor: APP_CONFIG.THEME.cardBackground,
    padding: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  cardImageWrapper: {
    width: '100%',
    height: 124,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1f2438'
  },
  playOverlay: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(15, 17, 26, 0.8)',
    borderRadius: 20,
    padding: 6
  },
  cardInfo: {
    marginTop: 8
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary
  },
  cardArtist: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 2
  }
});
