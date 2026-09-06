import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { musicApi } from '../../services/musicApi';
import { Song } from '../../types/music';
import { formatDuration } from '../../utils/formatDuration';
import { FavoriteButton } from '../../components/FavoriteButton';
import { DownloadButton } from '../../components/DownloadButton';
import { Loading } from '../../components/Loading';
import { usePlayer } from '../../hooks/usePlayer';
import { APP_CONFIG } from '../../constants/config';

export default function SongDetailScreen() {
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();

  useEffect(() => {
    async function load() {
      if (!songId) return;
      setLoading(true);
      const data = await musicApi.getSongById(songId);
      setSong(data);
      setLoading(false);
    }
    load();
  }, [songId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loading message="Loading song details..." />
      </SafeAreaView>
    );
  }

  if (!song) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Song not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrent = currentTrack?.id === song.id;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover & Basic Info */}
        <View style={styles.header}>
          <Image source={{ uri: song.coverUrl }} style={styles.cover} />
          <Text style={styles.title}>{song.title}</Text>
          <TouchableOpacity onPress={() => router.push(`/artist/${song.artistId}`)}>
            <Text style={styles.artist}>{song.artistName}</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => {
                if (isCurrent) {
                  togglePlayPause();
                } else {
                  playTrack(song);
                }
              }}
            >
              <Ionicons
                name={isCurrent && isPlaying ? 'pause' : 'play'}
                size={20}
                color="#ffffff"
              />
              <Text style={styles.playBtnText}>
                {isCurrent && isPlaying ? 'Pause Track' : 'Play Song'}
              </Text>
            </TouchableOpacity>

            <View style={styles.metaBtns}>
              <DownloadButton song={song} size={24} />
              <FavoriteButton song={song} size={26} />
            </View>
          </View>
        </View>

        {/* Track Details & Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track Information</Text>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>{formatDuration(song.duration)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Genre</Text>
              <Text style={styles.metaValue}>{song.genre || 'Various'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Language</Text>
              <Text style={styles.metaValue}>{song.language?.toUpperCase() || 'EN'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>License</Text>
              <Text style={styles.metaValue}>{song.license || 'Creative Commons'}</Text>
            </View>
          </View>
        </View>

        {/* Lyrics */}
        {song.lyrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lyrics</Text>
            <View style={styles.lyricsCard}>
              <Text style={styles.lyricsText}>{song.lyrics}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_CONFIG.THEME.background
  },
  content: {
    padding: 20,
    paddingBottom: 110
  },
  header: {
    alignItems: 'center',
    marginBottom: 28
  },
  cover: {
    width: 220,
    height: 220,
    borderRadius: 20,
    backgroundColor: '#1b1e30',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary,
    textAlign: 'center'
  },
  artist: {
    fontSize: 16,
    color: APP_CONFIG.THEME.accentPrimary,
    fontWeight: '600',
    marginTop: 4
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24
  },
  playBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 14
  },
  metaBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 12
  },
  metaGrid: {
    backgroundColor: APP_CONFIG.THEME.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: APP_CONFIG.THEME.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metaItem: {
    width: '48%',
    marginBottom: 12
  },
  metaLabel: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary,
    marginTop: 2
  },
  lyricsCard: {
    backgroundColor: APP_CONFIG.THEME.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: APP_CONFIG.THEME.border
  },
  lyricsText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#cbd5e1'
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notFoundText: {
    fontSize: 16,
    color: APP_CONFIG.THEME.textMuted
  }
});
