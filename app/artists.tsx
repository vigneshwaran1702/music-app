import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { artistApi } from '../services/artistApi';
import { Artist } from '../types/artist';
import { Loading } from '../components/Loading';
import { APP_CONFIG } from '../constants/config';

export default function ArtistsScreen() {
  const router = useRouter();
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
        <Text style={styles.headerTitle}>Featured Artists</Text>
        <Text style={styles.headerSubtitle}>Discover visionary creators shaping global music scenes.</Text>

        {loading ? (
          <Loading message="Loading artists..." />
        ) : (
          <View style={styles.list}>
            {artists.map((artist) => (
              <TouchableOpacity
                key={artist.id}
                style={styles.artistRow}
                onPress={() => router.push(`/artist/${artist.id}`)}
              >
                <Image source={{ uri: artist.imageUrl }} style={styles.avatar} />
                <View style={styles.info}>
                  <Text style={styles.name}>{artist.name}</Text>
                  <Text style={styles.genres}>
                    {artist.genres ? artist.genres.join(' • ') : 'Independent Artist'}
                  </Text>
                  {artist.monthlyListeners ? (
                    <Text style={styles.listeners}>
                      {artist.monthlyListeners.toLocaleString()} monthly listeners
                    </Text>
                  ) : null}
                </View>
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
  list: {
    gap: 12
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.THEME.cardBackground,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_CONFIG.THEME.border
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1d2136'
  },
  info: {
    flex: 1,
    marginLeft: 14
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  genres: {
    fontSize: 13,
    color: APP_CONFIG.THEME.accentPrimary,
    marginTop: 2
  },
  listeners: {
    fontSize: 11,
    color: APP_CONFIG.THEME.textMuted,
    marginTop: 4
  }
});
