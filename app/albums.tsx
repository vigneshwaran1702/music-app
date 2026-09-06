import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { albumApi } from '../services/albumApi';
import { Album } from '../types/album';
import { Loading } from '../components/Loading';
import { APP_CONFIG } from '../constants/config';

export default function AlbumsScreen() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const list = await albumApi.getAllAlbums();
      setAlbums(list);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Albums & EPs</Text>
        <Text style={styles.headerSubtitle}>
          Complete studio albums and curated music compilations.
        </Text>

        {loading ? (
          <Loading message="Loading albums..." />
        ) : (
          <View style={styles.grid}>
            {albums.map((album) => (
              <TouchableOpacity
                key={album.id}
                style={styles.albumCard}
                onPress={() => router.push(`/album/${album.id}`)}
              >
                <Image source={{ uri: album.coverUrl }} style={styles.cover} />
                <Text numberOfLines={1} style={styles.title}>
                  {album.title}
                </Text>
                <Text numberOfLines={1} style={styles.artist}>
                  {album.artistName}
                </Text>
                <Text style={styles.meta}>
                  {album.genre} • {album.trackCount || 0} tracks
                </Text>
              </TouchableOpacity>
            ))}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 6
  },
  headerSubtitle: {
    fontSize: 14,
    color: APP_CONFIG.THEME.textSecondary,
    marginBottom: 20
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  albumCard: {
    width: '48%',
    backgroundColor: APP_CONFIG.THEME.cardBackground,
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: APP_CONFIG.THEME.border
  },
  cover: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#1b1e30',
    marginBottom: 10
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
  meta: {
    fontSize: 11,
    color: APP_CONFIG.THEME.textMuted,
    marginTop: 4
  }
});
