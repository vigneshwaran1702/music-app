import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMusic } from '../hooks/useMusic';
import { usePlayer } from '../hooks/usePlayer';
import { historyDb } from '../database/history';
import { favoritesDb } from '../database/favorites';
import { Song } from '../types/music';
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

  const [recentHistory, setRecentHistory] = useState<Song[]>([]);
  const [likedCount, setLikedCount] = useState<number>(0);

  useEffect(() => {
    historyDb.getListeningHistory().then((h) => setRecentHistory(h.slice(0, 6)));
    favoritesDb.getFavorites().then((favs) => setLikedCount(favs.length));
  }, [currentTrack]);

  // Dynamic greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const heroSong = featured[0] || trending[0];
  const tamilSongs = trending.filter((s) => s.language === 'ta' || (s.genre || '').toLowerCase().includes('kollywood'));
  const recommendedTracks = recentHistory.length > 0 ? [...recentHistory, ...featured] : featured;

  // Quick Access 6 items
  const quickAccessItems = [
    {
      id: 'qa_tamil',
      title: 'Top Tamil Hits',
      icon: 'flame',
      gradient: ['#f97316', '#dc2626'] as [string, string],
      route: '/tamil',
      songs: tamilSongs.length > 0 ? tamilSongs : trending
    },
    {
      id: 'qa_liked',
      title: 'Liked Songs',
      icon: 'heart',
      gradient: ['#ec4899', '#8b5cf6'] as [string, string],
      route: '/favorites',
      songs: trending
    },
    {
      id: 'qa_history',
      title: 'Recently Played',
      icon: 'time',
      gradient: ['#06b6d4', '#3b82f6'] as [string, string],
      route: '/library',
      songs: recentHistory.length > 0 ? recentHistory : trending
    },
    {
      id: 'qa_anirudh',
      title: 'Anirudh Specials',
      icon: 'flash',
      gradient: ['#eab308', '#f97316'] as [string, string],
      route: '/artist/artist_anirudh',
      songs: trending
    },
    {
      id: 'qa_new',
      title: 'Fresh Releases',
      icon: 'sparkles',
      gradient: ['#10b981', '#06b6d4'] as [string, string],
      route: '/search',
      songs: newReleases
    },
    {
      id: 'qa_chill',
      title: 'Chill Lo-Fi',
      icon: 'cafe',
      gradient: ['#6366f1', '#a855f7'] as [string, string],
      route: '/search',
      songs: chillOut
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={APP_CONFIG.THEME.accentPrimary}
          />
        }
      >
        {/* Top Greeting Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.brandTitle}>{APP_CONFIG.APP_NAME}</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={[styles.iconBtn, styles.tamilHeaderBtn]}
              onPress={() => router.push('/tamil' as any)}
            >
              <Ionicons name="flame" size={18} color="#ffffff" />
              <Text style={styles.tamilBtnText}>தமிழ்</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/search' as any)}>
              <Ionicons name="search" size={20} color={APP_CONFIG.THEME.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/favorites' as any)}>
              <Ionicons name="heart-outline" size={20} color={APP_CONFIG.THEME.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/library' as any)}>
              <Ionicons name="library-outline" size={20} color={APP_CONFIG.THEME.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {loading && !featured.length ? (
          <Loading message="Streaming music streams..." />
        ) : (
          <>
            {/* Quick Access Grid (Spotify style) */}
            <View style={styles.quickAccessContainer}>
              <View style={styles.quickAccessGrid}>
                {quickAccessItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.quickAccessCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(item.route as any)}
                  >
                    <LinearGradient
                      colors={item.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.quickAccessIconBox}
                    >
                      <Ionicons name={item.icon as any} size={22} color="#ffffff" />
                    </LinearGradient>

                    <Text numberOfLines={1} style={styles.quickAccessTitle}>
                      {item.title}
                    </Text>

                    <TouchableOpacity
                      style={styles.quickPlayBtn}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        if (item.songs && item.songs.length > 0) {
                          playTrack(item.songs[0], item.songs);
                        }
                      }}
                    >
                      <Ionicons name="play" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Featured Hero Banner */}
            {heroSong && (
              <View style={styles.heroCardContainer}>
                <Image source={{ uri: heroSong.coverUrl }} style={styles.heroImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(9, 10, 16, 0.95)']}
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
                        size={18}
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

            {/* Tamil Hub Spotlight Banner */}
            <TouchableOpacity
              style={styles.tamilSpotlightCard}
              activeOpacity={0.9}
              onPress={() => router.push('/tamil' as any)}
            >
              <LinearGradient
                colors={['#ea580c', '#c2410c', '#7c2d12']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tamilSpotlightGradient}
              >
                <View style={styles.tamilSpotlightContent}>
                  <View style={styles.tamilPillBadge}>
                    <Text style={styles.tamilPillText}>SPECIAL HUB</Text>
                  </View>
                  <Text style={styles.tamilSpotlightTitle}>Tamil Music Chartbusters</Text>
                  <Text style={styles.tamilSpotlightSubtitle}>
                    Anirudh, AR Rahman, Yuvan, Harris, Santhosh Narayanan & evergreen Kollywood hits.
                  </Text>
                </View>
                <View style={styles.tamilArrowCircle}>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* 1. Trending Now Section */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="trending-up" size={20} color={APP_CONFIG.THEME.accentPrimary} />
                <Text style={styles.sectionTitle}>Trending Now</Text>
              </View>
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

            {/* 2. Recommended For You */}
            {recommendedTracks.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="sparkles" size={20} color="#ec4899" />
                    <Text style={styles.sectionTitle}>Recommended For You</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {recommendedTracks.slice(0, 8).map((song) => (
                    <SongCard key={song.id} song={song} playlist={recommendedTracks} variant="card" />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 3. Tamil Blockbusters */}
            {tamilSongs.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="flame" size={20} color={APP_CONFIG.THEME.accentTamil} />
                    <Text style={styles.sectionTitle}>Top Tamil Hits</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/tamil' as any)}>
                    <Text style={styles.seeAllText}>Explore Tamil Hub</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {tamilSongs.map((song) => (
                    <SongCard key={song.id} song={song} playlist={tamilSongs} variant="card" />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 4. Top Artists */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="people" size={20} color="#06b6d4" />
                  <Text style={styles.sectionTitle}>Popular Artists</Text>
                </View>
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
            </View>

            {/* 5. Popular Albums */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="disc" size={20} color="#a855f7" />
                  <Text style={styles.sectionTitle}>Popular Albums & Soundtracks</Text>
                </View>
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
            </View>

            {/* 6. Fresh Releases List */}
            <View style={styles.verticalSection}>
              <View style={styles.sectionHeaderRowNoPad}>
                <Text style={styles.sectionTitle}>Fresh Drops & Singles</Text>
              </View>
              {newReleases.slice(0, 5).map((song) => (
                <SongCard key={song.id} song={song} playlist={newReleases} variant="list" />
              ))}
            </View>

            {/* 7. Languages Carousel */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="globe" size={20} color="#10b981" />
                  <Text style={styles.sectionTitle}>Music by Language</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/languages')}>
                  <Text style={styles.seeAllText}>All languages</Text>
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
            </View>

            {/* 8. Chill Vibes */}
            {chillOut.length > 0 && (
              <View style={styles.verticalSection}>
                <View style={styles.sectionHeaderRowNoPad}>
                  <Text style={styles.sectionTitle}>Chill & Lo-Fi Selection</Text>
                </View>
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
    paddingBottom: 120
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: APP_CONFIG.THEME.textPrimary,
    letterSpacing: -0.5
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#131625',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#20253b'
  },
  tamilHeaderBtn: {
    backgroundColor: APP_CONFIG.THEME.accentTamil,
    borderColor: APP_CONFIG.THEME.accentTamil,
    paddingHorizontal: 10,
    width: 'auto',
    flexDirection: 'row',
    gap: 4
  },
  tamilBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  quickAccessContainer: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  quickAccessCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131625',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f243a',
    overflow: 'hidden',
    height: 52,
    paddingRight: 10
  },
  quickAccessIconBox: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quickAccessTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginLeft: 10
  },
  quickPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9
  },
  heroCardContainer: {
    marginHorizontal: 20,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
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
    fontSize: 22,
    fontWeight: '800',
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
    paddingVertical: 9,
    borderRadius: 24,
    gap: 6
  },
  heroPlayText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  tamilSpotlightCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20
  },
  tamilSpotlightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18
  },
  tamilSpotlightContent: {
    flex: 1,
    marginRight: 12
  },
  tamilPillBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6
  },
  tamilPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  tamilSpotlightTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff'
  },
  tamilSpotlightSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2
  },
  tamilArrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionContainer: {
    marginTop: 18
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12
  },
  sectionHeaderRowNoPad: {
    marginBottom: 12
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
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
