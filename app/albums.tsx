import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { albumApi } from '../services/albumApi';
import { Album } from '../types/album';
import { AlbumCard } from '../components/AlbumCard';
import { Loading } from '../components/Loading';

export default function AlbumsScreen() {
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
              <AlbumCard key={album.id} album={album} size={150} />
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
    backgroundColor: '#121212'
  },
  content: {
    padding: 24,
    paddingBottom: 120
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 6
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a7a7a7',
    marginBottom: 24
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  }
});
