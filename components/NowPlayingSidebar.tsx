import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePlayer } from '../hooks/usePlayer';
import { APP_CONFIG } from '../constants/config';
import { FavoriteButton } from './FavoriteButton';

export const NowPlayingSidebar: React.FC = () => {
  const router = useRouter();
  const {
    currentTrack,
    isRightPanelOpen,
    toggleRightPanel,
    toggleQueue,
    isLyricsOpen,
    toggleLyrics
  } = usePlayer();

  if (!isRightPanelOpen || !currentTrack) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {currentTrack.albumTitle || 'Now Playing'}
        </Text>
        <TouchableOpacity style={styles.closeBtn} onPress={toggleRightPanel}>
          <Ionicons name="close" size={20} color={APP_CONFIG.THEME.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Large Artwork */}
        <View style={styles.artContainer}>
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.artImage} />
        </View>

        {/* Track Details */}
        <View style={styles.trackInfo}>
          <View style={styles.titleRow}>
            <View style={styles.metaCol}>
              <Text numberOfLines={2} style={styles.title}>
                {currentTrack.title}
              </Text>
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

            <FavoriteButton song={currentTrack} size={24} />
          </View>

          {/* Quick Action Chips */}
          <View style={styles.actionChips}>
            <TouchableOpacity style={styles.chip} onPress={toggleQueue}>
              <Ionicons name="list" size={16} color={APP_CONFIG.THEME.accentPrimary} />
              <Text style={styles.chipText}>View Queue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, isLyricsOpen && styles.chipActive]}
              onPress={toggleLyrics}
            >
              <Ionicons
                name="musical-notes"
                size={16}
                color={isLyricsOpen ? '#ffffff' : APP_CONFIG.THEME.accentSecondary}
              />
              <Text style={[styles.chipText, isLyricsOpen && styles.chipTextActive]}>
                Lyrics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lyrics Panel if opened */}
        {isLyricsOpen && (
          <View style={styles.lyricsCard}>
            <Text style={styles.lyricsHeader}>LYRICS</Text>
            <Text style={styles.lyricsBody}>
              {currentTrack.lyrics ||
                'Lyrics for this track are currently being synced with JioSaavn & MusicBrainz.'}
            </Text>
          </View>
        )}

        {/* About the Artist Card */}
        <View style={styles.artistCard}>
          <Text style={styles.cardSectionLabel}>ABOUT THE ARTIST</Text>
          <View style={styles.artistMiniRow}>
            <Image
              source={{ uri: currentTrack.coverUrl }}
              style={styles.artistAvatar}
            />
            <View style={styles.artistMiniMeta}>
              <Text numberOfLines={1} style={styles.artistMiniName}>
                {currentTrack.artistName}
              </Text>
              <Text style={styles.artistGenre}>
                {currentTrack.genre || 'Trending Music'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewArtistBtn}
            onPress={() => {
              if (currentTrack.artistId) {
                router.push(`/artist/${currentTrack.artistId}` as any);
              } else {
                router.push('/artists');
              }
            }}
          >
            <Text style={styles.viewArtistText}>View Artist Profile</Text>
            <Ionicons name="arrow-forward" size={14} color={APP_CONFIG.THEME.accentPrimary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    backgroundColor: APP_CONFIG.THEME.sidebarBg,
    borderLeftWidth: 1,
    borderLeftColor: APP_CONFIG.THEME.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONFIG.THEME.border
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    flex: 1
  },
  closeBtn: {
    padding: 4
  },
  scroll: {
    flex: 1
  },
  artContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#161928',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  artImage: {
    width: '100%',
    height: '100%'
  },
  trackInfo: {
    marginBottom: 20
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  metaCol: {
    flex: 1,
    marginRight: 10
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 4
  },
  artist: {
    fontSize: 14,
    color: APP_CONFIG.THEME.textSecondary
  },
  actionChips: {
    flexDirection: 'row',
    gap: 8
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#16192a',
    borderWidth: 1,
    borderColor: '#242a42',
    gap: 6
  },
  chipActive: {
    backgroundColor: APP_CONFIG.THEME.accentSecondary,
    borderColor: APP_CONFIG.THEME.accentSecondary
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textSecondary
  },
  chipTextActive: {
    color: '#ffffff'
  },
  lyricsCard: {
    backgroundColor: '#16192a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#242a42'
  },
  lyricsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8
  },
  lyricsBody: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textPrimary,
    lineHeight: 20
  },
  artistCard: {
    backgroundColor: '#141726',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#22273e'
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10
  },
  artistMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  artistAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  artistMiniMeta: {
    flex: 1
  },
  artistMiniName: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  artistGenre: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textSecondary
  },
  viewArtistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#20253a'
  },
  viewArtistText: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_CONFIG.THEME.accentPrimary
  }
});
