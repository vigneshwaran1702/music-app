import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMusic } from '../hooks/useMusic';
import { usePlayer } from '../hooks/usePlayer';
import { LANGUAGES } from '../constants/languages';
import { CURATED_ARTISTS, CURATED_ALBUMS } from '../api/sources';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';
import { AlbumCard } from '../components/AlbumCard';
import { LanguageCard } from '../components/LanguageCard';
import { Loading } from '../components/Loading';
import { APP_CONFIG } from '../constants/config';

export default function HomeScreen() {
  const router = useRouter();
  const { loading, featured, trending, newReleases, chillOut, refresh } = useMusic();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();

  const heroSong = featured[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={APP_CONFIG.THEME.accentPrimary} />
        }
      >
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.brandTitle}>Aura Music</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/search')}>
              <Ionicons name="search" size={22} color={APP_CONFIG.THEME.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/favorites')}>
              <Ionicons name="heart-outline" size={22} color={APP_CONFIG.THEME.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/downloads')}>
              <Ionicons name="cloud-download-outline" size={22} color={APP_CONFIG.THEME.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/playlists')}>
              <Ionicons name="library-outline" size={22} color={APP_CONFIG.THEME.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {loading && !featured.length ? (
          <Loading message="Fetching trending streams..." />
        ) : (
          <>
            {/* Featured Hero Banner */}
            {heroSong && (
              <View style={styles.heroCardContainer}>
                <Image source={{ uri: heroSong.coverUrl }} style={styles.heroImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(10, 11, 16, 0.95)']}
                  style={styles.heroGradient}
                >
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>FEATURED TRACK</Text>
                  </View>
                  <Text numberOfLines={1} style={styles.heroTitle}>
                    {heroSong.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.heroArtist}>
                    {heroSong.artistName} • {heroSong.genre}
                  </Text>
                  <View style={styles.heroActions}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.heroPlayButton}
                      onPress={() => {
                        if (currentTrack?.id === heroSong.id) {
                          togglePlayPause();
                        } else {
                          playTrack(heroSong, featured);
                        }
                      }}
                    >
                      <Ionicons
                        name={currentTrack?.id === heroSong.id && isPlaying ? 'pause' : 'play'}
                        size={20}
                        color="#ffffff"
                      />
                      <Text style={styles.heroPlayText}>
                        {currentTrack?.id === heroSong.id && isPlaying ? 'Pause' : 'Play Now'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Quick Language Filter Pills */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Explore Languages</Text>
              <TouchableOpacity onPress={() => router.push('/languages')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {LANGUAGES.map((lang) => (
                <LanguageCard key={lang.id} language={lang} variant="pill" />
              ))}
            </ScrollView>

            {/* Trending Now */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Trending Worldwide</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {trending.map((song) => (
                <SongCard key={song.id} song={song} playlist={trending} variant="card" />
              ))}
            </ScrollView>

            {/* Top Artists */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Featured Artists</Text>
              <TouchableOpacity onPress={() => router.push('/artists')}>
                <Text style={styles.seeAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {CURATED_ARTISTS.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </ScrollView>

            {/* Popular Albums */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Popular Albums</Text>
              <TouchableOpacity onPress={() => router.push('/albums')}>
                <Text style={styles.seeAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {CURATED_ALBUMS.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </ScrollView>

            {/* Fresh Releases List */}
            <View style={styles.verticalSection}>
              <Text style={styles.sectionTitle}>Fresh Drops & Hits</Text>
              {newReleases.slice(0, 5).map((song) => (
                <SongCard key={song.id} song={song} playlist={newReleases} variant="list" />
              ))}
            </View>

            {/* Chill & Ambient Selection */}
            {chillOut.length > 0 && (
              <View style={styles.verticalSection}>
                <Text style={styles.sectionTitle}>Chill & Lo-Fi Vibes</Text>
                {chillOut.slice(0, 4).map((song) => (
                  <SongCard key={song.id} song={song} playlist={chillOut} variant="list" />
                ))}
              </View>
            )}
          </>
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
  scrollContent: {
    paddingBottom: 110
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '500',
    color: APP_CONFIG.THEME.textMuted
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary,
    letterSpacing: -0.5
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#151724',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#24283d'
  },
  heroCardContainer: {
    marginHorizontal: 20,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
    backgroundColor: '#161928'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'flex-end',
    padding: 20
  },
  featuredBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff'
  },
  heroArtist: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    marginBottom: 12
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  heroPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24
  },
  heroPlayText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.accentPrimary
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 8
  },
  verticalSection: {
    paddingHorizontal: 20,
    marginTop: 22
  }
});
