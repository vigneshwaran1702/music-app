import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { artistApi } from '../../services/artistApi';
import { Artist } from '../../types/artist';
import { SongCard } from '../../components/SongCard';
import { Loading } from '../../components/Loading';
import { usePlayer } from '../../hooks/usePlayer';

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
        {/* Back navigation */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>

        {/* Spotify Artist Hero Header */}
        <LinearGradient
          colors={['#27272a', '#18181b', '#121212']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroBox}
        >
          <Image source={{ uri: artist.imageUrl }} style={styles.heroImage} />

          <View style={styles.heroMeta}>
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={18} color="#38bdf8" />
              <Text style={styles.verifiedText}>Verified Artist</Text>
            </View>

            <Text style={styles.heroName}>{artist.name}</Text>

            {artist.monthlyListeners ? (
              <Text style={styles.listenersText}>
                {artist.monthlyListeners.toLocaleString()} monthly listeners
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
          </View>
        </LinearGradient>

        {/* Actions Bar */}
        {artist.topTracks && artist.topTracks.length > 0 && (
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={styles.bigGreenPlayBtn}
              onPress={() => playTrack(artist.topTracks![0], artist.topTracks)}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={26} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.followBtn} activeOpacity={0.8}>
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Popular Songs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular</Text>
          {artist.topTracks && artist.topTracks.length > 0 ? (
            artist.topTracks.map((s, idx) => (
              <SongCard
                key={s.id}
                song={s}
                playlist={artist.topTracks}
                variant="list"
                index={idx}
              />
            ))
          ) : (
            <Text style={styles.noSongsText}>No tracks listed yet.</Text>
          )}
        </View>

        {/* About Bio */}
        {artist.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{artist.bio}</Text>
            </View>
          </View>
        ) : null}
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
    paddingBottom: 120
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8
  },
  heroBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 24
  },
  heroImage: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#282828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14
  },
  heroMeta: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  verifiedText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600'
  },
  heroName: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 8
  },
  listenersText: {
    fontSize: 14,
    color: '#a7a7a7',
    marginBottom: 10
  },
  genrePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  genrePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  genrePillText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600'
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 20
  },
  bigGreenPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
  followBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20
  },
  followBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
    letterSpacing: -0.3
  },
  bioCard: {
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 20
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#a7a7a7'
  },
  noSongsText: {
    fontSize: 14,
    color: '#a7a7a7'
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notFoundText: {
    fontSize: 16,
    color: '#a7a7a7'
  }
});
