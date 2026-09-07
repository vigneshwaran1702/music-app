import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/SongCard';
import { Loading } from '../components/Loading';
import { shuffleArray } from '../utils/filterMusic';

export default function FavoritesScreen() {
  const { favorites, loading } = useFavorites();
  const { playTrack } = usePlayer();

  const handlePlayAll = (shuffle = false) => {
    if (!favorites.length) return;
    const queue = shuffle ? shuffleArray(favorites) : favorites;
    playTrack(queue[0], queue);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Spotify Liked Songs Hero Header */}
        <LinearGradient
          colors={['#5038a0', '#2e1c6a', '#121212']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.likedHeroThumb}>
            <Ionicons name="heart" size={64} color="#ffffff" />
          </View>

          <View style={styles.heroMeta}>
            <Text style={styles.playlistTypeLabel}>PLAYLIST</Text>
            <Text style={styles.heroTitle}>Liked Songs</Text>
            <View style={styles.heroSubRow}>
              <Text style={styles.heroAuthor}>You</Text>
              <Text style={styles.heroDot}>•</Text>
              <Text style={styles.heroCount}>{favorites.length} songs</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Action Controls Bar */}
        {favorites.length > 0 && (
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={styles.bigGreenPlayBtn}
              onPress={() => handlePlayAll(false)}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={26} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shuffleActionBtn}
              onPress={() => handlePlayAll(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="shuffle" size={24} color="#a7a7a7" />
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <Loading message="Loading liked songs..." />
        ) : favorites.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="heart-outline" size={64} color="#a7a7a7" />
            <Text style={styles.emptyTitle}>Songs you like will appear here</Text>
            <Text style={styles.emptySub}>
              Save songs by tapping the heart icon on any track while streaming.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {favorites.map((song, idx) => (
              <SongCard
                key={song.id}
                song={song}
                playlist={favorites}
                variant="list"
                index={idx}
              />
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
    paddingBottom: 120
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    gap: 24
  },
  likedHeroThumb: {
    width: 160,
    height: 160,
    borderRadius: 6,
    backgroundColor: '#450af5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8
  },
  heroMeta: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  playlistTypeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 10
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  heroAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  heroDot: {
    fontSize: 14,
    color: '#a7a7a7'
  },
  heroCount: {
    fontSize: 14,
    color: '#a7a7a7'
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
    shadowRadius: 8,
    elevation: 6
  },
  shuffleActionBtn: {
    padding: 8
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 16
  },
  emptySub: {
    fontSize: 14,
    color: '#a7a7a7',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 380
  },
  list: {
    paddingHorizontal: 24
  }
});
