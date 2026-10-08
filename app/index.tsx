import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMusic } from '../hooks/useMusic';
import { usePlayer } from '../hooks/usePlayer';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../context/AuthContext';
import { historyDb } from '../database/history';
import { favoritesDb } from '../database/favorites';
import { Song } from '../types/music';
import { CURATED_ARTISTS, CURATED_ALBUMS } from '../client-api/sources';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';
import { AlbumCard } from '../components/AlbumCard';
import { Loading } from '../components/Loading';
import { LoginModal } from '../components/LoginModal';
import { APP_CONFIG } from '../constants/config';

type HomeFilter = 'all' | 'youtube' | 'instagram' | 'spotify' | 'google' | 'tamil';

export default function HomeScreen() {
  const router = useRouter();
  const { isDesktop, isTablet, isMobile } = useResponsive();
  const { user, isLoggedIn, triggerShuffle } = useAuth();
  const {
    loading,
    featured,
    trending,
    youtubeTrending,
    instagramTrending,
    spotifyTrending,
    googleTrending,
    newReleases,
    chillOut,
    refresh,
    shuffleFeed
  } = useMusic();
  const { playTrack, currentTrack } = usePlayer();

  const [activeFilter, setActiveFilter] = useState<HomeFilter>('all');
  const [recentHistory, setRecentHistory] = useState<Song[]>([]);
  const [likedCount, setLikedCount] = useState<number>(0);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [shuffleToast, setShuffleToast] = useState<string | null>(null);

  // Carousel refs for desktop scroll arrows
  const ytScrollRef = useRef<ScrollView>(null);
  const igScrollRef = useRef<ScrollView>(null);
  const spotifyScrollRef = useRef<ScrollView>(null);
  const googleScrollRef = useRef<ScrollView>(null);
  const tamilScrollRef = useRef<ScrollView>(null);
  const trendingScrollRef = useRef<ScrollView>(null);
  const artistScrollRef = useRef<ScrollView>(null);
  const albumScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    historyDb.getListeningHistory().then((h) => setRecentHistory(h.slice(0, 8)));
    favoritesDb.getFavorites().then((favs) => setLikedCount(favs.length));
  }, [currentTrack]);

  const showShuffleFeedback = (msg = 'Shuffled! Songs randomized across YouTube, Instagram, Spotify & Google') => {
    setShuffleToast(msg);
    setTimeout(() => {
      setShuffleToast(null);
    }, 4000);
  };

  const handleManualShuffle = () => {
    shuffleFeed();
    triggerShuffle();
    showShuffleFeedback('🔀 Shuffled! Discover fresh trending hits across all platforms.');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const nameStr = user?.name ? `, ${user.name.split(' ')[0]}` : '';
    if (hour < 12) return `Good morning${nameStr}`;
    if (hour < 18) return `Good afternoon${nameStr}`;
    return `Good evening${nameStr}`;
  };

  const tamilSongs = trending.filter(
    (s) => s.language === 'ta' || (s.genre || '').toLowerCase().includes('kollywood')
  );

  const anirudhSongs = trending.filter(
    (s) => s.artistName.toLowerCase().includes('anirudh') || s.artistId === 'artist_anirudh'
  );
  const rahmanSongs = trending.filter(
    (s) => s.artistName.toLowerCase().includes('rahman') || s.artistId === 'artist_arrahman'
  );

  const quickAccessItems = [
    {
      id: 'qa_yt',
      title: 'YouTube Trending',
      icon: 'logo-youtube',
      bg: '#dc2626',
      route: '#youtube',
      songs: youtubeTrending,
      onPress: () => {
        if (youtubeTrending.length > 0) playTrack(youtubeTrending[0], youtubeTrending);
      }
    },
    {
      id: 'qa_ig',
      title: 'Instagram Reels Viral',
      icon: 'logo-instagram',
      bg: '#e1306c',
      route: '#instagram',
      songs: instagramTrending,
      onPress: () => {
        if (instagramTrending.length > 0) playTrack(instagramTrending[0], instagramTrending);
      }
    },
    {
      id: 'qa_spotify',
      title: 'Spotify Top 50',
      icon: 'musical-notes',
      bg: '#16a34a',
      route: '#spotify',
      songs: spotifyTrending,
      onPress: () => {
        if (spotifyTrending.length > 0) playTrack(spotifyTrending[0], spotifyTrending);
      }
    },
    {
      id: 'qa_google',
      title: 'Google Trends',
      icon: 'search',
      bg: '#2563eb',
      route: '#google',
      songs: googleTrending,
      onPress: () => {
        if (googleTrending.length > 0) playTrack(googleTrending[0], googleTrending);
      }
    },
    {
      id: 'qa_liked',
      title: 'Liked Songs',
      icon: 'heart',
      bg: '#4f46e5',
      route: '/favorites',
      songs: trending
    },
    {
      id: 'qa_tamil',
      title: 'Tamil Chartbusters',
      icon: 'flame',
      bg: '#ea580c',
      route: '/tamil',
      songs: tamilSongs.length > 0 ? tamilSongs : trending
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
      title: 'New Releases',
      icon: 'sparkles',
      bg: '#7c3aed',
      route: '/search',
      songs: newReleases
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
          {isMobile ? (
            <TouchableOpacity
              style={styles.mobileBrandRow}
              activeOpacity={0.8}
              onPress={() => router.push('/')}
            >
              <Image
                source={require('../assets/icons/aura-logo.png')}
                style={styles.mobileLogo}
                resizeMode="contain"
              />
              <Text style={styles.mobileBrandText}>Aura Music</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.arrowCircle}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills with Horizontal Scroll on Mobile */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topFilterScrollContent}
          style={styles.topFilterPills}
        >
          <TouchableOpacity
            style={[styles.topPill, activeFilter === 'all' && styles.topPillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.topPillText, activeFilter === 'all' && styles.topPillTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topPill, activeFilter === 'youtube' && styles.topPillActive, styles.youtubePill]}
            onPress={() => setActiveFilter('youtube')}
          >
            <Ionicons
              name="logo-youtube"
              size={14}
              color={activeFilter === 'youtube' ? '#dc2626' : '#ef4444'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.topPillText,
                { color: activeFilter === 'youtube' ? '#000000' : '#ef4444', fontWeight: '700' }
              ]}
            >
              YouTube
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topPill, activeFilter === 'instagram' && styles.topPillActive, styles.instaPill]}
            onPress={() => setActiveFilter('instagram')}
          >
            <Ionicons
              name="logo-instagram"
              size={14}
              color={activeFilter === 'instagram' ? '#e1306c' : '#f43f5e'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.topPillText,
                { color: activeFilter === 'instagram' ? '#000000' : '#f43f5e', fontWeight: '700' }
              ]}
            >
              Instagram
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topPill, activeFilter === 'spotify' && styles.topPillActive, styles.spotifyPill]}
            onPress={() => setActiveFilter('spotify')}
          >
            <Ionicons
              name="musical-notes"
              size={14}
              color={activeFilter === 'spotify' ? '#16a34a' : '#22c55e'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.topPillText,
                { color: activeFilter === 'spotify' ? '#000000' : '#22c55e', fontWeight: '700' }
              ]}
            >
              Spotify
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topPill, activeFilter === 'google' && styles.topPillActive, styles.googlePill]}
            onPress={() => setActiveFilter('google')}
          >
            <Ionicons
              name="search"
              size={14}
              color={activeFilter === 'google' ? '#2563eb' : '#60a5fa'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.topPillText,
                { color: activeFilter === 'google' ? '#000000' : '#60a5fa', fontWeight: '700' }
              ]}
            >
              Google
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
        </ScrollView>

        {/* Right Header Actions: Reshuffle Button + Profile Avatar */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.shuffleHeaderBtn}
            onPress={handleManualShuffle}
            activeOpacity={0.8}
          >
            <Ionicons name="shuffle" size={16} color="#000000" />
            {!isMobile && <Text style={styles.shuffleHeaderBtnText}>Shuffle</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.userAvatarBtn}
            onPress={() => setShowLoginModal(true)}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.userAvatarImg} />
            ) : (
              <Ionicons name="person" size={16} color="#ffffff" />
            )}
            {isLoggedIn && <View style={styles.onlineBadgeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Shuffled Feedback Toast Notification */}
      {shuffleToast && (
        <View style={styles.toastBanner}>
          <Ionicons name="sparkles" size={16} color="#1ed760" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{shuffleToast}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 170 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              refresh();
              showShuffleFeedback('Feed refreshed & reshuffled!');
            }}
            tintColor="#1ed760"
          />
        }
      >
        {/* Dynamic Atmospheric Ambient Gradient Backdrop */}
        <LinearGradient
          colors={['#1e3a5f', '#142033', '#121212']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.ambientBackdrop, isMobile && { paddingHorizontal: 16 }]}
        >
          {/* Greeting Row with User Profile Summary */}
          <View style={styles.greetingRow}>
            <View>
              <Text style={[styles.greetingHeading, isMobile && { fontSize: 24, marginBottom: 4 }]}>
                {getGreeting()}
              </Text>
              <Text style={styles.greetingSubtext}>
                {isLoggedIn
                  ? `Logged in as ${user?.name} • Shuffled on login`
                  : 'Songs automatically shuffled across YouTube, Instagram, Spotify & Google'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.reShufflePillBtn}
              onPress={handleManualShuffle}
              activeOpacity={0.8}
            >
              <Ionicons name="shuffle" size={15} color="#1ed760" style={{ marginRight: 5 }} />
              <Text style={styles.reShufflePillText}>Shuffle Home</Text>
            </TouchableOpacity>
          </View>

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
                onPress={() => {
                  if (item.onPress) {
                    item.onPress();
                  } else {
                    router.push(item.route as any);
                  }
                }}
              >
                <View style={[styles.quickTileThumb, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={20} color="#ffffff" />
                </View>

                <Text numberOfLines={isMobile ? 2 : 1} style={[styles.quickTileTitle, isMobile && { fontSize: 12, marginLeft: 8 }]}>
                  {item.title}
                </Text>

                {!isMobile && (
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
                )}
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {loading && !featured.length ? (
          <Loading message="Streaming & shuffling trending music..." />
        ) : (
          <View style={styles.sectionsContainer}>

            {/* 1. YOUTUBE TRENDING SECTION (Shown for 'all' or 'youtube') */}
            {(activeFilter === 'all' || activeFilter === 'youtube') && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <View style={styles.platformSectionTitleRow}>
                    <View style={[styles.platformIconBadge, { backgroundColor: '#dc2626' }]}>
                      <Ionicons name="logo-youtube" size={16} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Trending on YouTube</Text>
                      <Text style={styles.sectionSubTitle}>
                        Viral music videos, 1B+ view anthems & chartbusters breaking records
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sectionHeaderRight}>
                    <TouchableOpacity
                      style={styles.platformShuffleSmallBtn}
                      onPress={handleManualShuffle}
                    >
                      <Ionicons name="shuffle" size={14} color="#ef4444" />
                      <Text style={[styles.showAllText, { color: '#ef4444' }]}>Shuffle</Text>
                    </TouchableOpacity>
                    {!isMobile && (
                      <View style={styles.carouselArrowsRow}>
                        <TouchableOpacity
                          style={styles.arrowSmallBtn}
                          onPress={() => scrollCarousel(ytScrollRef, 'left')}
                        >
                          <Ionicons name="chevron-back" size={16} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.arrowSmallBtn}
                          onPress={() => scrollCarousel(ytScrollRef, 'right')}
                        >
                          <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <ScrollView
                  ref={ytScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsRow}
                >
                  {(youtubeTrending.length > 0 ? youtubeTrending : trending).map((song) => (
                    <SongCard key={`yt_${song.id}`} song={song} playlist={youtubeTrending} variant="card" />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 2. INSTAGRAM REELS VIRAL SECTION (Shown for 'all' or 'instagram') */}
            {(activeFilter === 'all' || activeFilter === 'instagram') && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <View style={styles.platformSectionTitleRow}>
                    <View style={[styles.platformIconBadge, { backgroundColor: '#e1306c' }]}>
                      <Ionicons name="logo-instagram" size={16} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Viral on Instagram Reels</Text>
                      <Text style={styles.sectionSubTitle}>
                        Top trending audio, background hooks & viral sounds taking over feeds
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sectionHeaderRight}>
                    <TouchableOpacity
                      style={styles.platformShuffleSmallBtn}
                      onPress={handleManualShuffle}
                    >
                      <Ionicons name="shuffle" size={14} color="#f43f5e" />
                      <Text style={[styles.showAllText, { color: '#f43f5e' }]}>Shuffle</Text>
                    </TouchableOpacity>
                    {!isMobile && (
                      <View style={styles.carouselArrowsRow}>
                        <TouchableOpacity
                          style={styles.arrowSmallBtn}
                          onPress={() => scrollCarousel(igScrollRef, 'left')}
                        >
                          <Ionicons name="chevron-back" size={16} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.arrowSmallBtn}
                          onPress={() => scrollCarousel(igScrollRef, 'right')}
                        >
                          <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <ScrollView
                  ref={igScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsRow}
                >
                  {(instagramTrending.length > 0 ? instagramTrending : trending).map((song) => (
                    <SongCard key={`ig_${song.id}`} song={song} playlist={instagramTrending} variant="card" />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 3. SPOTIFY TOP CHARTS SECTION (Shown for 'all' or 'spotify') */}
            {(activeFilter === 'all' || activeFilter === 'spotify') && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <View style={styles.platformSectionTitleRow}>
                    <View style={[styles.platformIconBadge, { backgroundColor: '#16a34a' }]}>
                      <Ionicons name="musical-notes" size={16} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Top Charts on Spotify</Text>
                      <Text style={styles.sectionSubTitle}>
                        Global Top 50, Today's Top Hits & most streamed tracks worldwide
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sectionHeaderRight}>
                    <TouchableOpacity
                      style={styles.platformShuffleSmallBtn}
                      onPress={handleManualShuffle}
                    >
                      <Ionicons name="shuffle" size={14} color="#22c55e" />
                      <Text style={[styles.showAllText, { color: '#22c55e' }]}>Shuffle</Text>
                    </TouchableOpacity>
                    {!isMobile && (
                      <View style={styles.carouselArrowsRow}>
                        <TouchableOpacity
                          style={styles.arrowSmallBtn}
                          onPress={() => scrollCarousel(spotifyScrollRef, 'left')}
                        >
                          <Ionicons name="chevron-back" size={16} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.arrowSmallBtn}
                          onPress={() => scrollCarousel(spotifyScrollRef, 'right')}
                        >
                          <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <ScrollView
                  ref={spotifyScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsRow}
                >
                  {(spotifyTrending.length > 0 ? spotifyTrending : trending).map((song) => (
                    <SongCard key={`spot_${song.id}`} song={song} playlist={spotifyTrending} variant="card" />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 4. GOOGLE SEARCH TRENDS SECTION (Shown for 'all' or 'google') */}
            {(activeFilter === 'all' || activeFilter === 'google') && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <View style={styles.platformSectionTitleRow}>
                    <View style={[styles.platformIconBadge, { backgroundColor: '#2563eb' }]}>
                      <Ionicons name="search" size={16} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Trending on Google</Text>
                      <Text style={styles.sectionSubTitle}>
                        Most searched songs, viral search queries & breakout movie soundtracks
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sectionHeaderRight}>
                    <TouchableOpacity
                      style={styles.platformShuffleSmallBtn}
                      onPress={handleManualShuffle}
                    >
                      <Ionicons name="shuffle" size={14} color="#60a5fa" />
                      <Text style={[styles.showAllText, { color: '#60a5fa' }]}>Shuffle</Text>
                    </TouchableOpacity>
                    {!isMobile && (
                      <View style={styles.carouselArrowsRow}>
                        <TouchableOpacity
                          style={styles.arrowSmallBtn}
                          onPress={() => scrollCarousel(googleScrollRef, 'left')}
                        >
                          <Ionicons name="chevron-back" size={16} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.arrowSmallBtn}
                          onPress={() => scrollCarousel(googleScrollRef, 'right')}
                        >
                          <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <ScrollView
                  ref={googleScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsRow}
                >
                  {(googleTrending.length > 0 ? googleTrending : trending).map((song) => (
                    <SongCard key={`goog_${song.id}`} song={song} playlist={googleTrending} variant="card" />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 5. Tamil Music Spotlight Hub Banner */}
            <TouchableOpacity
              style={[styles.tamilHubBanner, isMobile && { marginHorizontal: 16 }]}
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

            {/* 6. Top Tamil Hits Section with Navigation Arrows */}
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

            {/* 7. Popular Artists */}
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

            {/* 8. Tamil Mood & Vibe Albums */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Tamil Mood & Vibe Albums • தமிழ் ஆல்பங்கள்</Text>
                  <Text style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                    காதல், பிரிவு, சோகம், மகிழ்ச்சி, மெலடி, குத்து & வைப்
                  </Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/albums?filter=tamil' as any)}>
                  <Text style={styles.showAllText}>Show all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                ref={albumScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {CURATED_ALBUMS.filter((al) => al.id.startsWith('album_tamil_')).map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </ScrollView>
            </View>

            {/* 9. Movie Soundtracks & OSTs */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Blockbuster Soundtracks & OSTs</Text>
                <TouchableOpacity onPress={() => router.push('/albums?filter=soundtrack' as any)}>
                  <Text style={styles.showAllText}>Show all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {CURATED_ALBUMS.filter((al) => !al.id.startsWith('album_tamil_')).map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </ScrollView>
            </View>

            {/* 10. Fresh Releases */}
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

            {/* 11. Chill & Lo-Fi Selection */}
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

      {/* Login / Profile Modal */}
      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onShuffled={() => showShuffleFeedback('🔀 Welcome back! Feed reshuffled with fresh trending tracks.')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212'
  },
  scrollContent: {
    paddingBottom: 130
  },
  topStickyHeader: {
    height: 64,
    backgroundColor: 'rgba(18, 18, 18, 0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  navHistoryArrows: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mobileBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  mobileLogo: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  mobileBrandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3
  },
  topFilterPills: {
    flex: 1,
    marginHorizontal: 10
  },
  topFilterScrollContent: {
    alignItems: 'center',
    gap: 6,
    paddingRight: 8
  },
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  topPillActive: {
    backgroundColor: '#ffffff'
  },
  youtubePill: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)'
  },
  instaPill: {
    backgroundColor: 'rgba(225, 48, 108, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(225, 48, 108, 0.3)'
  },
  spotifyPill: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)'
  },
  googlePill: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)'
  },
  tamilSpecialPill: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)'
  },
  topPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff'
  },
  topPillTextActive: {
    color: '#000000',
    fontWeight: '700'
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  shuffleHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1ed760',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4
  },
  shuffleHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000'
  },
  userAvatarBtn: {
    position: 'relative',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  userAvatarImg: {
    width: 31,
    height: 31,
    borderRadius: 15.5
  },
  onlineBadgeDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1ed760',
    borderWidth: 1.5,
    borderColor: '#121212'
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: '#1ed760',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 9
  },
  toastText: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '600'
  },
  ambientBackdrop: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  greetingHeading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5
  },
  greetingSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4
  },
  reShufflePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 215, 96, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(30, 215, 96, 0.3)'
  },
  reShufflePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1ed760'
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
    paddingRight: 12
  },
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
    paddingTop: 12,
    paddingBottom: 150
  },
  sectionBlock: {
    marginBottom: 36
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16
  },
  platformSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  platformIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3
  },
  sectionSubTitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  platformShuffleSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  carouselArrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  arrowSmallBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  showAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a7a7a7'
  },
  cardsRow: {
    paddingLeft: 24,
    paddingRight: 12
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
  }
});
