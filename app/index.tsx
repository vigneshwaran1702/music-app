import React, { useState, useEffect, useRef } from 'react';
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
import { useResponsive } from '../hooks/useResponsive';
import { historyDb } from '../database/history';
import { favoritesDb } from '../database/favorites';
import { Song } from '../types/music';
import { CURATED_ARTISTS, CURATED_ALBUMS } from '../api/sources';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';
import { AlbumCard } from '../components/AlbumCard';
import { Loading } from '../components/Loading';
import { APP_CONFIG } from '../constants/config';

type HomeFilter = 'all' | 'tamil' | 'music' | 'trending';

export default function HomeScreen() {
  const router = useRouter();
  const { isDesktop, isTablet } = useResponsive();
  const { loading, featured, trending, newReleases, chillOut, refresh } = useMusic();
  const { playTrack, currentTrack } = usePlayer();

  const [activeFilter, setActiveFilter] = useState<HomeFilter>('all');
  const [recentHistory, setRecentHistory] = useState<Song[]>([]);
  const [likedCount, setLikedCount] = useState<number>(0);

  // Carousel refs for desktop scroll arrows
  const tamilScrollRef = useRef<ScrollView>(null);
  const trendingScrollRef = useRef<ScrollView>(null);
  const artistScrollRef = useRef<ScrollView>(null);
  const albumScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    historyDb.getListeningHistory().then((h) => setRecentHistory(h.slice(0, 8)));
    favoritesDb.getFavorites().then((favs) => setLikedCount(favs.length));
  }, [currentTrack]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const tamilSongs = trending.filter(
    (s) => s.language === 'ta' || (s.genre || '').toLowerCase().includes('kollywood')
  );

  const quickAccessItems = [
    {
      id: 'qa_liked',
      title: 'Liked Songs',
      icon: 'heart',
      bg: '#450af5',
      route: '/favorites',
      songs: trending
    },
    {
      id: 'qa_tamil',
      title: 'Top Tamil Chartbusters',
      icon: 'flame',
      bg: '#ea580c',
      route: '/tamil',
      songs: tamilSongs.length > 0 ? tamilSongs : trending
    },
    {
      id: 'qa_anirudh',
      title: 'Anirudh Hits',
      icon: 'flash',
      bg: '#eab308',
      route: '/artist/artist_anirudh',
      songs: trending
    },
    {
      id: 'qa_arrahman',
      title: 'A.R. Rahman Essentials',
      icon: 'musical-notes',
      bg: '#0284c7',
      route: '/artist/artist_arrahman',
      songs: trending
    },
    {
      id: 'qa_history',
      title: 'Recently Played',
      icon: 'time',
      bg: '#059669',
      route: '/library',
      songs: recentHistory.length > 0 ? recentHistory : trending
    },
    {
      id: 'qa_fresh',
      title: 'New Releases 2024',
      icon: 'sparkles',
      bg: '#7c3aed',
      route: '/search',
      songs: newReleases
    },
    {
      id: 'qa_jailer',
      title: 'Jailer (Soundtrack)',
      icon: 'disc',
      bg: '#b91c1c',
      route: '/album/album_jailer',
      songs: trending
    },
    {
      id: 'qa_chill',
      title: 'Chill Lo-Fi Beats',
      icon: 'cafe',
      bg: '#4f46e5',
      route: '/search',
      songs: chillOut
    }
  ];

  const scrollCarousel = (ref: React.RefObject<ScrollView>, direction: 'left' | 'right') => {
    // @ts-ignore
    ref.current?.scrollTo?.({
      x: direction === 'right' ? 600 : -600,
      animated: true
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Sticky Top Navigation Bar (Frosted Translucent) */}
      <View style={styles.topStickyHeader}>
        <View style={styles.navHistoryArrows}>
          <TouchableOpacity
            style={styles.arrowCircle}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.topFilterPills}>
          <TouchableOpacity
            style={[styles.topPill, activeFilter === 'all' && styles.topPillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.topPillText, activeFilter === 'all' && styles.topPillTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topPill, activeFilter === 'tamil' && styles.topPillActive, styles.tamilSpecialPill]}
            onPress={() => router.push('/tamil' as any)}
          >
            <Text style={[styles.topPillText, activeFilter === 'tamil' && styles.topPillTextActive, { color: '#f97316' }]}>
              Tamil Hits 🇮🇳
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topPill, activeFilter === 'music' && styles.topPillActive]}
            onPress={() => setActiveFilter('music')}
          >
            <Text style={[styles.topPillText, activeFilter === 'music' && styles.topPillTextActive]}>
              Music
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topPill, activeFilter === 'trending' && styles.topPillActive]}
            onPress={() => setActiveFilter('trending')}
          >
            <Text style={[styles.topPillText, activeFilter === 'trending' && styles.topPillTextActive]}>
              Trending
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Profile Avatar */}
        <TouchableOpacity
          style={styles.userAvatarBtn}
          onPress={() => router.push('/library' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="person" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#1ed760"
          />
        }
      >
        {/* Dynamic Atmospheric Ambient Gradient Backdrop */}
        <LinearGradient
          colors={['#1e3a5f', '#142033', '#121212']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.ambientBackdrop}
        >
          {/* Greeting */}
          <Text style={styles.greetingHeading}>{getGreeting()}</Text>

          {/* Scalable Pinned Quick Access Grid */}
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.quickAccessTile,
                  isDesktop ? styles.quickAccessTileDesktop : isTablet ? styles.quickAccessTileTablet : styles.quickAccessTileMobile
                ]}
                activeOpacity={0.8}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.quickTileThumb, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={22} color="#ffffff" />
                </View>

                <Text numberOfLines={1} style={styles.quickTileTitle}>
                  {item.title}
                </Text>

                <TouchableOpacity
                  style={styles.quickTilePlayBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    if (item.songs && item.songs.length > 0) {
                      playTrack(item.songs[0], item.songs);
                    }
                  }}
                >
                  <Ionicons name="play" size={18} color="#000000" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {loading && !featured.length ? (
          <Loading message="Streaming music catalog..." />
        ) : (
          <View style={styles.sectionsContainer}>
            {/* 1. Tamil Music Spotlight Hub Banner */}
            <TouchableOpacity
              style={styles.tamilHubBanner}
              activeOpacity={0.9}
              onPress={() => router.push('/tamil' as any)}
            >
              <LinearGradient
                colors={['#ea580c', '#c2410c', '#7c2d12']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tamilBannerGradient}
              >
                <View style={styles.tamilBannerContent}>
                  <View style={styles.tamilBadgePill}>
                    <Text style={styles.tamilBadgePillText}>SPOTLIGHT</Text>
                  </View>
                  <Text style={styles.tamilBannerTitle}>Tamil Music Chartbusters</Text>
                  <Text style={styles.tamilBannerSubtitle}>
                    Anirudh, AR Rahman, Yuvan, Harris, Santhosh Narayanan & evergreen Kollywood blockbusters.
                  </Text>
                </View>
                <View style={styles.tamilBannerPlayBtn}>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* 2. Top Tamil Hits Section with Navigation Arrows */}
            {tamilSongs.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Top Tamil Blockbusters</Text>
                  <View style={styles.sectionHeaderRight}>
                    <TouchableOpacity onPress={() => router.push('/tamil' as any)}>
                      <Text style={styles.showAllText}>Show all</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <ScrollView
                  ref={tamilScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsRow}
                >
                  {tamilSongs.map((song) => (
                    <SongCard key={song.id} song={song} playlist={tamilSongs} variant="card" />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 3. Trending Now Worldwide */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Now</Text>
                <TouchableOpacity onPress={() => router.push('/search' as any)}>
                  <Text style={styles.showAllText}>Show all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                ref={trendingScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {trending.map((song) => (
                  <SongCard key={song.id} song={song} playlist={trending} variant="card" />
                ))}
              </ScrollView>
            </View>

            {/* 4. Popular Artists */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Artists</Text>
                <TouchableOpacity onPress={() => router.push('/artists' as any)}>
                  <Text style={styles.showAllText}>Show all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                ref={artistScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {CURATED_ARTISTS.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </ScrollView>
            </View>

            {/* 5. Popular Albums & Soundtracks */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Albums & Soundtracks</Text>
                <TouchableOpacity onPress={() => router.push('/albums' as any)}>
                  <Text style={styles.showAllText}>Show all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                ref={albumScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {CURATED_ALBUMS.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </ScrollView>
            </View>

            {/* 6. Fresh Releases */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Fresh Drops & Singles</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {newReleases.map((song) => (
                  <SongCard key={song.id} song={song} playlist={newReleases} variant="card" />
                ))}
              </ScrollView>
            </View>

            {/* 7. Chill & Lo-Fi Selection */}
            {chillOut.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Chill & Lo-Fi Selection</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsRow}
                >
                  {chillOut.map((song) => (
                    <SongCard key={song.id} song={song} playlist={chillOut} variant="card" />
                  ))}
                </ScrollView>
              </View>
            )}
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
  scrollContent: {
    paddingBottom: 120
  },
  topStickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    zIndex: 10
  },
  navHistoryArrows: {
    flexDirection: 'row',
    gap: 8
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  topFilterPills: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    marginLeft: 16
  },
  topPill: {
    backgroundColor: '#232323',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    transition: 'background-color 0.15s ease'
  } as any,
  topPillActive: {
    backgroundColor: '#ffffff'
  },
  tamilSpecialPill: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)'
  },
  topPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff'
  },
  topPillTextActive: {
    color: '#000000',
    fontWeight: '700'
  },
  userAvatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ambientBackdrop: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28
  },
  greetingHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 20
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  quickAccessTile: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    overflow: 'hidden',
    paddingRight: 12,
    transition: 'background-color 0.2s ease'
  } as any,
  quickAccessTileDesktop: {
    width: 'calc(25% - 9px)' as any
  },
  quickAccessTileTablet: {
    width: 'calc(33.33% - 8px)' as any
  },
  quickAccessTileMobile: {
    width: 'calc(50% - 6px)' as any
  },
  quickTileThumb: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quickTileTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 12
  },
  quickTilePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4
  },
  sectionsContainer: {
    paddingTop: 12
  },
  tamilHubBanner: {
    marginHorizontal: 24,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 28
  },
  tamilBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24
  },
  tamilBannerContent: {
    flex: 1,
    marginRight: 16
  },
  tamilBadgePill: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  tamilBadgePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  tamilBannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff'
  },
  tamilBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 18
  },
  tamilBannerPlayBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionBlock: {
    marginBottom: 36
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    marginBottom: 16
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3
  },
  showAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a7a7a7'
  },
  cardsRow: {
    paddingLeft: 24,
    paddingRight: 12
  }
});
