import React, { useEffect, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { musicApi } from '../services/musicApi';
import { usePlayer } from '../hooks/usePlayer';
import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';
import { Loading } from '../components/Loading';
import { APP_CONFIG } from '../constants/config';

type TamilCategory =
  | 'all'
  | 'trending'
  | 'hits'
  | 'latest'
  | 'movieHits'
  | 'loveSongs'
  | 'melody'
  | 'folk'
  | 'classics';

export default function TamilMusicHubScreen() {
  const router = useRouter();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const [activeCategory, setActiveCategory] = useState<TamilCategory>('all');
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<{
    trending: Song[];
    hits: Song[];
    latest: Song[];
    movieHits: Song[];
    loveSongs: Song[];
    melody: Song[];
    folk: Song[];
    classics: Song[];
    topArtists: Artist[];
  }>({
    trending: [],
    hits: [],
    latest: [],
    movieHits: [],
    loveSongs: [],
    melody: [],
    folk: [],
    classics: [],
    topArtists: []
  });

  useEffect(() => {
    fetchTamilData();
  }, []);

  const fetchTamilData = async () => {
    setLoading(true);
    try {
      const res = await musicApi.getTamilHubData();
      setData(res);
    } catch (e) {
      console.warn('Tamil hub load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const categories: { id: TamilCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All Tamil Music', icon: 'apps' },
    { id: 'trending', label: 'Trending', icon: 'flame' },
    { id: 'hits', label: 'Kollywood Hits', icon: 'trophy' },
    { id: 'latest', label: 'Latest Drops', icon: 'sparkles' },
    { id: 'movieHits', label: 'Movie Songs', icon: 'film' },
    { id: 'loveSongs', label: 'Romantic Melodies', icon: 'heart' },
    { id: 'melody', label: 'Soulful Melody', icon: 'musical-note' },
    { id: 'folk', label: 'Kuthu & Folk', icon: 'flash' },
    { id: 'classics', label: '90s Classics', icon: 'time' }
  ];

  const heroSong = data.trending[0] || data.hits[0];

  const allSongsFlat = [
    ...data.trending,
    ...data.hits,
    ...data.latest,
    ...data.movieHits,
    ...data.loveSongs,
    ...data.melody,
    ...data.folk,
    ...data.classics
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchTamilData}
            tintColor={APP_CONFIG.THEME.accentTamil}
          />
        }
      >
        {/* Hub Header Banner */}
        <LinearGradient
          colors={['#f97316', '#dc2626', '#7f1d1d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.badgeRow}>
            <View style={styles.flagBadge}>
              <Text style={styles.flagText}>தமிழ் இசை • TAMIL MUSIC HUB</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Tamil Chartbusters</Text>
          <Text style={styles.heroSubtitle}>
            Stream top tracks from Anirudh, AR Rahman, Yuvan, Harris Jayaraj, Santhosh Narayanan, and evergreen classics in 320kbps audio.
          </Text>

          {allSongsFlat.length > 0 && (
            <View style={styles.heroActionRow}>
              <TouchableOpacity
                style={styles.playAllBtn}
                onPress={() => playTrack(heroSong || allSongsFlat[0], allSongsFlat)}
              >
                <Ionicons name="play" size={18} color="#000000" />
                <Text style={styles.playAllText}>Play Tamil Hits</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.searchTamilBtn}
                onPress={() => router.push('/search')}
              >
                <Ionicons name="search" size={18} color="#ffffff" />
                <Text style={styles.searchTamilText}>Search Tamil</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsScroll}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={15}
                  color={isActive ? '#ffffff' : APP_CONFIG.THEME.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive && styles.categoryChipTextActive
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading && !data.trending.length ? (
          <Loading message="Streaming Tamil tracks from JioSaavn catalog..." />
        ) : (
          <>
            {/* Category Filter View */}
            {activeCategory !== 'all' ? (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    {categories.find((c) => c.id === activeCategory)?.label}
                  </Text>
                  <Text style={styles.itemCountText}>
                    {(data[activeCategory as keyof typeof data] as Song[])?.length || 0} songs
                  </Text>
                </View>

                <View style={styles.listGrid}>
                  {((data[activeCategory as keyof typeof data] as Song[]) || []).map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      playlist={(data[activeCategory as keyof typeof data] as Song[]) || []}
                      variant="list"
                    />
                  ))}
                </View>
              </View>
            ) : (
              /* All Categories View */
              <>
                {/* 1. Tamil Trending Now */}
                {data.trending.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.titleWithIcon}>
                        <Ionicons name="flame" size={20} color={APP_CONFIG.THEME.accentTamil} />
                        <Text style={styles.sectionTitle}>Tamil Trending Now</Text>
                      </View>
                      <TouchableOpacity onPress={() => setActiveCategory('trending')}>
                        <Text style={styles.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalScroll}
                    >
                      {data.trending.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          playlist={data.trending}
                          variant="card"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* 2. Top Tamil Artists */}
                {data.topArtists.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.titleWithIcon}>
                        <Ionicons name="people" size={20} color={APP_CONFIG.THEME.accentPrimary} />
                        <Text style={styles.sectionTitle}>Top Tamil Composers & Singers</Text>
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
                      {data.topArtists.map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* 3. Kollywood Blockbuster Hits */}
                {data.hits.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.titleWithIcon}>
                        <Ionicons name="trophy" size={20} color="#eab308" />
                        <Text style={styles.sectionTitle}>Kollywood Blockbusters</Text>
                      </View>
                      <TouchableOpacity onPress={() => setActiveCategory('hits')}>
                        <Text style={styles.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalScroll}
                    >
                      {data.hits.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          playlist={data.hits}
                          variant="card"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* 4. Tamil Romantic Melodies */}
                {data.loveSongs.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.titleWithIcon}>
                        <Ionicons name="heart" size={20} color={APP_CONFIG.THEME.accentSecondary} />
                        <Text style={styles.sectionTitle}>Tamil Love & Romantic Melodies</Text>
                      </View>
                      <TouchableOpacity onPress={() => setActiveCategory('loveSongs')}>
                        <Text style={styles.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalScroll}
                    >
                      {data.loveSongs.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          playlist={data.loveSongs}
                          variant="card"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* 5. Kuthu & Gaana Beats */}
                {data.folk.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.titleWithIcon}>
                        <Ionicons name="flash" size={20} color="#f59e0b" />
                        <Text style={styles.sectionTitle}>Kuthu & Gaana Hits</Text>
                      </View>
                      <TouchableOpacity onPress={() => setActiveCategory('folk')}>
                        <Text style={styles.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.verticalListWrap}>
                      {data.folk.slice(0, 6).map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          playlist={data.folk}
                          variant="list"
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* 6. Soulful Melodies */}
                {data.melody.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.titleWithIcon}>
                        <Ionicons name="musical-note" size={20} color="#10b981" />
                        <Text style={styles.sectionTitle}>Soulful Melodies</Text>
                      </View>
                      <TouchableOpacity onPress={() => setActiveCategory('melody')}>
                        <Text style={styles.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.verticalListWrap}>
                      {data.melody.slice(0, 6).map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          playlist={data.melody}
                          variant="list"
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* 7. 90s Evergreen Classics */}
                {data.classics.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.titleWithIcon}>
                        <Ionicons name="time" size={20} color="#8b5cf6" />
                        <Text style={styles.sectionTitle}>90s & Evergreen Tamil Classics</Text>
                      </View>
                      <TouchableOpacity onPress={() => setActiveCategory('classics')}>
                        <Text style={styles.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalScroll}
                    >
                      {data.classics.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          playlist={data.classics}
                          variant="card"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
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
  heroBanner: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  flagBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12
  },
  flagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 18,
    maxWidth: 580
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  playAllText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700'
  },
  searchTamilBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8
  },
  searchTamilText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  categoryChipsScroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141727',
    borderWidth: 1,
    borderColor: '#22273e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  categoryChipActive: {
    backgroundColor: APP_CONFIG.THEME.accentTamil,
    borderColor: APP_CONFIG.THEME.accentTamil
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textSecondary
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  sectionContainer: {
    marginTop: 14,
    marginBottom: 8
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  itemCountText: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.accentTamil
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 8
  },
  verticalListWrap: {
    paddingHorizontal: 20
  },
  listGrid: {
    paddingHorizontal: 20
  }
});
