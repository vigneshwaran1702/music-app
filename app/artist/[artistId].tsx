import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { artistApi } from '../../services/artistApi';
import { Artist } from '../../types/artist';
import { SongCard } from '../../components/SongCard';
import { Loading } from '../../components/Loading';
import { usePlayer } from '../../hooks/usePlayer';
import { APP_CONFIG } from '../../constants/config';

export default function ArtistDetailScreen() {
  const { artistId } = useLocalSearchParams<{ artistId: string }>();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    async function load() {
      if (!artistId) return;
      setLoading(true);
      const data = await artistApi.getArtistById(artistId);
      setArtist(data);
      setLoading(false);
    }
    load();
  }, [artistId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loading message="Loading artist profile..." />
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Artist not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Artist Hero Header */}
        <View style={styles.heroBox}>
          <Image source={{ uri: artist.imageUrl }} style={styles.heroImage} />
          <Text style={styles.heroName}>{artist.name}</Text>
          {artist.monthlyListeners ? (
            <Text style={styles.listenersText}>
              {artist.monthlyListeners.toLocaleString()} Monthly Listeners
            </Text>
          ) : null}

          {artist.genres && (
            <View style={styles.genrePills}>
              {artist.genres.map((g, i) => (
                <View key={i} style={styles.genrePill}>
                  <Text style={styles.genrePillText}>{g}</Text>
                </View>
              ))}
            </View>
          )}

          {artist.topTracks && artist.topTracks.length > 0 && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => playTrack(artist.topTracks![0], artist.topTracks)}
            >
              <Ionicons name="play" size={20} color="#ffffff" />
              <Text style={styles.playButtonText}>Play Artist Radio</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bio */}
        {artist.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{artist.bio}</Text>
          </View>
        ) : null}

        {/* Top Tracks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Songs</Text>
          {artist.topTracks && artist.topTracks.length > 0 ? (
            artist.topTracks.map((s) => (
              <SongCard key={s.id} song={s} playlist={artist.topTracks} variant="list" />
            ))
          ) : (
            <Text style={styles.noSongsText}>No tracks listed yet.</Text>
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
  heroBox: {
    alignItems: 'center',
    marginBottom: 28
  },
  heroImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: APP_CONFIG.THEME.accentPrimary,
    marginBottom: 14,
    backgroundColor: '#1c1f30'
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary
  },
  listenersText: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 4
  },
  genrePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center'
  },
  genrePill: {
    backgroundColor: '#1b1e30',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#292f4c'
  },
  genrePillText: {
    fontSize: 12,
    color: APP_CONFIG.THEME.accentCyan,
    fontWeight: '600'
  },
  playButton: {
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
  playButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8
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
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: APP_CONFIG.THEME.textSecondary,
    backgroundColor: APP_CONFIG.THEME.cardBackground,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_CONFIG.THEME.border
  },
  noSongsText: {
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
