import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { musicApi } from '../services/musicApi';
import { usePlayer } from '../hooks/usePlayer';
import { useResponsive } from '../hooks/useResponsive';
import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';
import { AlbumCard } from '../components/AlbumCard';
import { Loading } from '../components/Loading';
import { CURATED_ALBUMS } from '../client-api/sources';

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
  const { playTrack } = usePlayer();
  const { isMobile } = useResponsive();
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

  const TAMIL_VIBES = [
    {
      id: 'pl_vibe_party',
      title: 'Party & Mass Vibe',
      emoji: '🔥',
      desc: 'High-voltage kuthu & party bangers',
      cover: 'https://c.saavncdn.com/187/Jailer-Tamil-2023-20230728081443-500x500.jpg',
      colors: ['#ea580c', '#991b1b'] as [string, string]
    },
    {
      id: 'pl_tamil_melody',
      title: 'Soulful Melodies',
      emoji: '💖',
      desc: 'Evergreen romance & acoustic love',
      cover: 'https://c.saavncdn.com/590/I-Tamil-2014-20190822153052-500x500.jpg',
      colors: ['#db2777', '#9333ea'] as [string, string]
    },
    {
      id: 'pl_breakup_hits',
      title: 'Breakup & Failure',
      emoji: '💔',
      desc: '3 AM heartache & healing tracks',
      cover: 'https://c.saavncdn.com/470/David-2012-500x500.jpg',
      colors: ['#475569', '#1e293b'] as [string, string]
    },
    {
      id: 'pl_sad_melancholy',
      title: 'Sad & Yuvan Drugs',
      emoji: '🌧️',
      desc: 'Deep emotion & rainy night blues',
      cover: 'https://c.saavncdn.com/artists/Yuvan_Shankar_Raja_002_20180802174245_500x500.webp',
      colors: ['#0284c7', '#1e3a8a'] as [string, string]
    },
    {
      id: 'pl_motivation_workout',
      title: 'Beast Motivation',
      emoji: '⚡',
      desc: 'Gym adrenaline & champion fire',
      cover: 'https://c.saavncdn.com/415/Leo-Original-Motion-Picture-Soundtrack-English-2023-20231019170311-500x500.jpg',
      colors: ['#eab308', '#c2410c'] as [string, string]
    },
    {
      id: 'pl_latenight_chill',
      title: 'Late Night Chill',
      emoji: '🌙',
      desc: 'Mellow lo-fi & midnight calm',
      cover: 'https://c.saavncdn.com/118/Katchi-Sera-From-Think-Indie-Tamil-2024-20251026074526-500x500.jpg',
      colors: ['#7c3aed', '#312e81'] as [string, string]
    },
    {
      id: 'pl_longdrive_vibe',
      title: 'Long Drive & Trip',
      emoji: '🚗',
      desc: 'Windows down highway cruising',
      cover: 'https://c.saavncdn.com/492/Mersal-Tamil-2017-20170820120559-500x500.webp',
      colors: ['#059669', '#065f46'] as [string, string]
    },
    {
      id: 'pl_nostalgia_classics',
      title: '90s & 2000s Classics',
      emoji: '📻',
      desc: 'Timeless Ilaiyaraaja & Rahman magic',
      cover: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.webp',
      colors: ['#d97706', '#78350f'] as [string, string]
    }
  ];

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
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 170 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchTamilData}
            tintColor="#f97316"
          />
        }
      >
        {/* Hub Header Banner */}
        <LinearGradient
          colors={['#ea580c', '#9a3412', '#121212']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.heroBanner, isMobile && { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 }]}
        >
          <View style={styles.badgeRow}>
            <View style={styles.flagBadge}>
              <Text style={styles.flagText}>தமிழ் இசை • TAMIL MUSIC HUB</Text>
            </View>
          </View>

          <Text style={[styles.heroTitle, isMobile && { fontSize: 26 }]}>Tamil Chartbusters</Text>
          <Text style={styles.heroSubtitle}>
            Stream top tracks from Anirudh, AR Rahman, Yuvan, Harris Jayaraj, Santhosh Narayanan, and evergreen classics in 320kbps audio.
          </Text>

          {allSongsFlat.length > 0 && (
            <View style={[styles.heroActionRow, isMobile && { flexWrap: 'wrap', gap: 10 }]}>
              <TouchableOpacity
                style={styles.playAllBtn}
                onPress={() => playTrack(heroSong || allSongsFlat[0], allSongsFlat)}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={20} color="#000000" />
                <Text style={styles.playAllText}>Play Tamil Hits</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.searchTamilBtn}
                onPress={() => router.push('/search')}
                activeOpacity={0.8}
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
                  color={isActive ? '#000000' : '#ffffff'}
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
          <Loading message="Streaming Tamil chartbusters..." />
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
                  {((data[activeCategory as keyof typeof data] as Song[]) || []).map((song, idx) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      playlist={(data[activeCategory as keyof typeof data] as Song[]) || []}
                      variant="list"
                      index={idx}
                    />
                  ))}
                </View>
              </View>
            ) : (
              /* All Categories View */
              <>
                {/* 0a. Tamil Mood & Vibe Albums */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.titleWithIcon}>
                      <Ionicons name="disc" size={20} color="#f43f5e" />
                      <Text style={styles.sectionTitle}>Tamil Mood Albums • தமிழ் ஆல்பங்கள்</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/albums?filter=tamil' as any)}>
                      <Text style={styles.seeAllText}>All Albums</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                  >
                    {CURATED_ALBUMS.filter((al) => al.id.startsWith('album_tamil_')).map((album) => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
                  </ScrollView>
                </View>

                {/* 0b. Tamil Vibe & Mood Playlists */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.titleWithIcon}>
                      <Ionicons name="sparkles" size={20} color="#a855f7" />
                      <Text style={styles.sectionTitle}>Vibe & Mood Playlists</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/playlists')}>
                      <Text style={styles.seeAllText}>All Playlists</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                  >
                    {TAMIL_VIBES.map((vibe) => (
                      <TouchableOpacity
                        key={vibe.id}
                        style={styles.vibeCard}
                        onPress={() => router.push(`/playlist/${vibe.id}` as any)}
                        activeOpacity={0.85}
                      >
                        <Image source={{ uri: vibe.cover }} style={styles.vibeCover} />
                        <LinearGradient
                          colors={vibe.colors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.vibeGradientBar}
                        />
                        <View style={styles.vibeMeta}>
                          <Text style={styles.vibeTitle} numberOfLines={1}>
                            {vibe.emoji} {vibe.title}
                          </Text>
                          <Text style={styles.vibeDesc} numberOfLines={2}>
                            {vibe.desc}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* 1. Tamil Trending Now */}
                {data.trending.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.titleWithIcon}>
                        <Ionicons name="flame" size={20} color="#f97316" />
                        <Text style={styles.sectionTitle}>Tamil Trending Now</Text>
                      </View>
                      <TouchableOpacity onPress={() => setActiveCategory('trending')}>
                        <Text style={styles.seeAllText}>Show all</Text>
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
                        <Ionicons name="people" size={20} color="#1ed760" />
                        <Text style={styles.sectionTitle}>Top Tamil Composers & Singers</Text>
                      </View>
                      <TouchableOpacity onPress={() => router.push('/artists')}>
                        <Text style={styles.seeAllText}>Show all</Text>
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
                        <Text style={styles.seeAllText}>Show all</Text>
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
                        <Ionicons name="heart" size={20} color="#ec4899" />
                        <Text style={styles.sectionTitle}>Tamil Love & Romantic Melodies</Text>
                      </View>
                      <TouchableOpacity onPress={() => setActiveCategory('loveSongs')}>
                        <Text style={styles.seeAllText}>Show all</Text>
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
                        <Text style={styles.seeAllText}>Show all</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.verticalListWrap}>
                      {data.folk.slice(0, 6).map((song, idx) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          playlist={data.folk}
                          variant="list"
                          index={idx}
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
                        <Text style={styles.seeAllText}>Show all</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.verticalListWrap}>
                      {data.melody.slice(0, 6).map((song, idx) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          playlist={data.melody}
                          variant="list"
                          index={idx}
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
                        <Text style={styles.seeAllText}>Show all</Text>
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
    backgroundColor: '#121212'
  },
  scrollContent: {
    paddingBottom: 120
  },
  heroBanner: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    marginBottom: 8
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  flagBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
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
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 620
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1ed760',
    paddingHorizontal: 24,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
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
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  categoryChipActive: {
    backgroundColor: '#ffffff'
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff'
  },
  categoryChipTextActive: {
    color: '#000000',
    fontWeight: '700'
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 16
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14
  },
  titleWithIcon: {
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
  itemCountText: {
    fontSize: 13,
    color: '#a7a7a7'
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a7a7a7'
  },
  horizontalScroll: {
    paddingLeft: 24,
    paddingRight: 12
  },
  verticalListWrap: {
    paddingHorizontal: 24
  },
  listGrid: {
    paddingHorizontal: 24
  },
  vibeCard: {
    width: 145,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  vibeCover: {
    width: 145,
    height: 145,
    borderRadius: 10
  },
  vibeGradientBar: {
    height: 3,
    width: '100%'
  },
  vibeMeta: {
    padding: 10
  },
  vibeTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  vibeDesc: {
    color: '#a7a7a7',
    fontSize: 11,
    lineHeight: 14
  }
});
