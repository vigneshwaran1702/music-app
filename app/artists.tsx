import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { artistApi } from '../services/artistApi';
import { Artist } from '../types/artist';
import { ArtistCard } from '../components/ArtistCard';
import { Loading } from '../components/Loading';

export default function ArtistsScreen() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const list = await artistApi.getAllArtists();
      setArtists(list);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Popular Artists</Text>
        <Text style={styles.headerSubtitle}>Discover visionary creators shaping global music scenes.</Text>

        {loading ? (
          <Loading message="Loading artists..." />
        ) : (
          <View style={styles.grid}>
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} showBio size={150} />
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
