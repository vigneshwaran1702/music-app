import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/SongCard';
import { Loading } from '../components/Loading';
import { APP_CONFIG } from '../constants/config';
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
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Liked Songs</Text>
            <Text style={styles.meta}>{favorites.length} favorite tracks</Text>
          </View>

          {favorites.length > 0 && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.shuffleBtn} onPress={() => handlePlayAll(true)}>
                <Ionicons name="shuffle" size={20} color={APP_CONFIG.THEME.accentPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playBtn} onPress={() => handlePlayAll(false)}>
                <Ionicons name="play" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {loading ? (
          <Loading message="Loading liked songs..." />
        ) : favorites.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="heart-outline" size={64} color={APP_CONFIG.THEME.textMuted} />
            <Text style={styles.emptyTitle}>No Liked Songs Yet</Text>
            <Text style={styles.emptySub}>
              Tap the heart icon on any song to save it to your personal favorites collection.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {favorites.map((song) => (
              <SongCard key={song.id} song={song} playlist={favorites} variant="list" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary
  },
  meta: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textMuted,
    marginTop: 2
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  shuffleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#161928',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#242a42'
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 64
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginTop: 14
  },
  emptySub: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: '80%'
  },
  list: {
    marginTop: 4
  }
});
