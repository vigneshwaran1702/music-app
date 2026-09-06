import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { albumApi } from '../../services/albumApi';
import { Album } from '../../types/album';
import { SongCard } from '../../components/SongCard';
import { Loading } from '../../components/Loading';
import { usePlayer } from '../../hooks/usePlayer';
import { APP_CONFIG } from '../../constants/config';

export default function AlbumDetailScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    async function load() {
      if (!albumId) return;
      setLoading(true);
      const data = await albumApi.getAlbumById(albumId);
      setAlbum(data);
      setLoading(false);
    }
    load();
  }, [albumId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loading message="Loading album tracks..." />
      </SafeAreaView>
    );
  }

  if (!album) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Album not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Album Cover & Info */}
        <View style={styles.header}>
          <Image source={{ uri: album.coverUrl }} style={styles.cover} />
          <Text style={styles.title}>{album.title}</Text>
          <Text style={styles.artist}>{album.artistName}</Text>
          <Text style={styles.meta}>
            {album.genre} • {album.tracks?.length || 0} Tracks • {album.releaseDate || '2024'}
          </Text>

          {album.tracks && album.tracks.length > 0 && (
            <TouchableOpacity
              style={styles.playAllBtn}
              onPress={() => playTrack(album.tracks![0], album.tracks)}
            >
              <Ionicons name="play" size={18} color="#ffffff" />
              <Text style={styles.playAllText}>Play Album</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tracklist */}
        <View style={styles.tracklistSection}>
          <Text style={styles.tracklistHeader}>Tracklist</Text>
          {album.tracks && album.tracks.length > 0 ? (
            album.tracks.map((s) => (
              <SongCard key={s.id} song={s} playlist={album.tracks} variant="list" />
            ))
          ) : (
            <Text style={styles.noTracksText}>No tracks found in this album.</Text>
          )}
        </View>
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
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#1b1e30',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary,
    textAlign: 'center'
  },
  artist: {
    fontSize: 15,
    color: APP_CONFIG.THEME.accentPrimary,
    fontWeight: '600',
    marginTop: 4
  },
  meta: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted,
    marginTop: 4
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 18,
    shadowColor: APP_CONFIG.THEME.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8
  },
  tracklistSection: {
    width: '100%'
  },
  tracklistHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 14
  },
  noTracksText: {
    fontSize: 14,
    color: APP_CONFIG.THEME.textMuted
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
