import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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
  index?: number;
  onPress?: () => void;
  showActions?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  playlist,
  variant = 'list',
  index,
  onPress,
  showActions = true
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const isCurrent = currentTrack?.id === song.id;
  const [isHovered, setIsHovered] = useState(false);

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
        activeOpacity={0.85}
        style={[
          styles.cardContainer,
          isCurrent && styles.cardActive,
          isHovered && styles.cardHovered
        ]}
        onPress={handleCardPress}
        // @ts-ignore
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: song.coverUrl }} style={styles.cardImage} />
          <View
            style={[
              styles.floatingPlayBtn,
              (isHovered || (isCurrent && isPlaying)) && styles.floatingPlayBtnVisible
            ]}
          >
            <Ionicons
              name={isCurrent && isPlaying ? 'pause' : 'play'}
              size={22}
              color="#000000"
            />
          </View>
        </View>

        <View style={styles.cardInfo}>
          <Text numberOfLines={1} style={[styles.cardTitle, isCurrent && styles.cardTitleActive]}>
            {song.title}
          </Text>
          <Text numberOfLines={2} style={styles.cardArtist}>
            {song.artistName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.listContainer,
        isCurrent && styles.listContainerActive,
        isHovered && styles.listContainerHovered
      ]}
      onPress={handleCardPress}
      // @ts-ignore
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {index !== undefined && (
        <View style={styles.indexCol}>
          {isHovered || isCurrent ? (
            <Ionicons
              name={isCurrent && isPlaying ? 'pause' : 'play'}
              size={14}
              color={isCurrent ? '#1ed760' : '#ffffff'}
            />
          ) : (
            <Text style={[styles.indexText, isCurrent && styles.indexTextActive]}>
              {index + 1}
            </Text>
          )}
        </View>
      )}

      <View style={styles.imageWrapper}>
        <Image source={{ uri: song.coverUrl }} style={styles.listImage} />
        {isCurrent && (
          <View style={styles.playingBadge}>
            <Ionicons
              name={isPlaying ? 'volume-high' : 'pause'}
              size={14}
              color="#1ed760"
            />
          </View>
        )}
      </View>

      <View style={styles.infoWrapper}>
        <Text numberOfLines={1} style={[styles.listTitle, isCurrent && styles.listTitleActive]}>
          {song.title}
        </Text>
        <View style={styles.subMeta}>
          <Text numberOfLines={1} style={styles.listArtist}>
            {song.artistName}
          </Text>
        </View>
      </View>

      <View style={styles.rightMeta}>
        {showActions && (
          <View style={styles.actionsWrapper}>
            <FavoriteButton song={song} size={18} />
          </View>
        )}

        {song.duration ? (
          <Text style={styles.durationText}>{formatDuration(song.duration)}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 172,
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 12,
    marginRight: 16,
    position: 'relative',
    transition: 'all 0.25s cubic-bezier(0.3, 0, 0, 1)'
  } as any,
  cardActive: {
    backgroundColor: '#282828'
  },
  cardHovered: {
    backgroundColor: '#242424',
    transform: [{ translateY: -4 }]
  },
  cardImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#282828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4
  },
  cardImage: {
    width: '100%',
    height: '100%'
  },
  floatingPlayBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    opacity: 0,
    transform: [{ translateY: 8 }],
    transition: 'all 0.25s ease'
  } as any,
  floatingPlayBtnVisible: {
    opacity: 1,
    transform: [{ translateY: 0 }]
  },
  cardInfo: {
    marginTop: 12
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4
  },
  cardTitleActive: {
    color: '#1ed760'
  },
  cardArtist: {
    fontSize: 12,
    color: '#a7a7a7',
    lineHeight: 16
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 2,
    transition: 'background-color 0.15s ease'
  } as any,
  listContainerActive: {
    backgroundColor: '#2a2a2a'
  },
  listContainerHovered: {
    backgroundColor: '#1f1f1f'
  },
  indexCol: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  indexText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a7a7a7'
  },
  indexTextActive: {
    color: '#1ed760'
  },
  imageWrapper: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 4,
    overflow: 'hidden'
  },
  listImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#282828'
  },
  playingBadge: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center'
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2
  },
  listTitleActive: {
    color: '#1ed760',
    fontWeight: '700'
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  listArtist: {
    fontSize: 12,
    color: '#a7a7a7'
  },
  rightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  durationText: {
    fontSize: 12,
    color: '#a7a7a7',
    minWidth: 40,
    textAlign: 'right'
  },
  actionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
