import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getLanguageByCode } from '../../utils/languageUtils';
import { musicApi } from '../../services/musicApi';
import { Song } from '../../types/music';
import { usePlayer } from '../../hooks/usePlayer';
import { SongCard } from '../../components/SongCard';
import { Loading } from '../../components/Loading';
import { APP_CONFIG } from '../../constants/config';

export default function LanguageDetailScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  const router = useRouter();
  const langConfig = getLanguageByCode(language || 'en');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    async function fetchLanguageSongs() {
      setLoading(true);
      const list = await musicApi.getSongsByLanguage(language || 'en');
      setSongs(list);
      setLoading(false);
    }
    fetchLanguageSongs();
  }, [language]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Hero Card */}
        <LinearGradient
          colors={langConfig.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <Text style={styles.heroFlag}>{langConfig.flag}</Text>
          <Text style={styles.heroTitle}>{langConfig.name} Music</Text>
          <Text style={styles.heroNative}>{langConfig.nativeName}</Text>

          {songs.length > 0 && (
            <TouchableOpacity
              style={styles.playAllBtn}
              onPress={() => playTrack(songs[0], songs)}
            >
              <Ionicons name="play" size={18} color="#000000" />
              <Text style={styles.playAllText}>Play All ({songs.length})</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {loading ? (
          <Loading message={`Loading ${langConfig.name} songs...`} />
        ) : (
          <View style={styles.songListSection}>
            <Text style={styles.sectionHeader}>Top {langConfig.name} Tracks</Text>
            {songs.map((s) => (
              <SongCard key={s.id} song={s} playlist={songs} variant="list" />
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
  heroBanner: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    alignItems: 'center'
  },
  heroFlag: {
    fontSize: 48,
    marginBottom: 8
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff'
  },
  heroNative: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    marginBottom: 16
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 6
  },
  songListSection: {
    width: '100%'
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 14
  }
});
