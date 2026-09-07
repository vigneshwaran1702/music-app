import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';
import { AlbumCard } from '../components/AlbumCard';
import { musicApi } from '../services/musicApi';
import { historyDb } from '../database/history';
import { usePlayer } from '../hooks/usePlayer';
import { useResponsive } from '../hooks/useResponsive';
import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';

type FilterType = 'all' | 'songs' | 'artists' | 'albums';

const SPOTIFY_BROWSE_CATEGORIES = [
  { id: 'tamil', name: 'Tamil Hits', color: '#f97316', icon: 'flame', query: 'Tamil' },
  { id: 'anirudh', name: 'Anirudh Mix', color: '#eab308', icon: 'flash', query: 'Anirudh' },
  { id: 'rahman', name: 'A.R. Rahman', color: '#0284c7', icon: 'musical-notes', query: 'AR Rahman' },
  { id: 'kollywood', name: 'Kollywood OST', color: '#b91c1c', icon: 'film', query: 'Kollywood' },
  { id: 'pop', name: 'Pop & Viral', color: '#148a08', icon: 'trending-up', query: 'Pop' },
  { id: 'hiphop', name: 'Hip-Hop / Rap', color: '#bc5900', icon: 'mic', query: 'Hip Hop' },
  { id: 'chill', name: 'Chill & Relax', color: '#450af5', icon: 'cafe', query: 'Lo-Fi' },
  { id: 'romance', name: 'Romantic Songs', color: '#e8115b', icon: 'heart', query: 'Romantic' },
  { id: 'indie', name: 'Indie & Acoustic', color: '#503750', icon: 'headset', query: 'Indie' },
  { id: 'workout', name: 'Workout & Energy', color: '#e13300', icon: 'barbell', query: 'Workout' },
  { id: 'classical', name: 'Carnatic & Classic', color: '#8d67ab', icon: 'disc', query: 'Carnatic' },
  { id: 'party', name: 'Dance & Party', color: '#1e3264', icon: 'sparkles', query: 'Party' }
];

export default function SearchScreen() {
  const router = useRouter();
  const { playTrack } = usePlayer();
  const { isDesktop, isTablet } = useResponsive();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debounceTimeout = useRef<any>(null);

  const [results, setResults] = useState<{
    songs: Song[];
    artists: Artist[];
    albums: Album[];
  }>({ songs: [], artists: [], albums: [] });

  useEffect(() => {
    historyDb.getRecentSearches().then(setRecentSearches);
  }, []);

  const performSearch = async (text: string) => {
    const clean = text.trim();
    if (!clean) {
      setResults({ songs: [], artists: [], albums: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await musicApi.searchAll(clean);
      setResults(data);
      historyDb.addRecentSearch(clean).then(() => {
        historyDb.getRecentSearches().then(setRecentSearches);
      });
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults({ songs: [], artists: [], albums: [] });
      setLoading(false);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    setLoading(true);
    debounceTimeout.current = setTimeout(() => {
      performSearch(text);
    }, 400);
  };

  const handleClearHistory = async () => {
    await historyDb.clearRecentSearches();
    setRecentSearches([]);
  };

  const tamilSuggestions = [
    { label: 'அனிருத் (Anirudh)', query: 'Anirudh' },
    { label: 'வசீகரா (Vaseegara)', query: 'Vaseegara' },
    { label: 'ரஹ்மான் (AR Rahman)', query: 'AR Rahman' },
    { label: 'யுவன் (Yuvan)', query: 'Yuvan Shankar Raja' },
    { label: 'Leo Hits', query: 'Leo Tamil' },
    { label: 'Jailer Songs', query: 'Jailer Tamil' },
    { label: 'Tamil Melody', query: 'Tamil Melody' },
    { label: 'Katchi Sera', query: 'Katchi Sera' }
  ];

  const topSong = results.songs[0];
  const hasResults =
    results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Search Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#a7a7a7" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={() => performSearch(query)}
            placeholder="What do you want to play? (Songs, artists, தமிழ்...)"
            placeholderTextColor="#71717a"
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearInputBtn}
              onPress={() => {
                setQuery('');
                setResults({ songs: [], artists: [], albums: [] });
              }}
            >
              <Ionicons name="close-circle" size={18} color="#a7a7a7" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      {query.length > 0 && (
        <View style={styles.filterRow}>
          {(['all', 'songs', 'artists', 'albums'] as FilterType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filterType === tab && styles.filterTabActive]}
              onPress={() => setFilterType(tab)}
            >
              <Text style={[styles.filterTabText, filterType === tab && styles.filterTabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          /* Skeleton Loader */
          <View style={styles.skeletonContainer}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#1ed760" />
              <Text style={styles.loadingText}>Searching streaming catalogs...</Text>
            </View>
            {[1, 2, 3, 4, 5].map((idx) => (
              <View key={idx} style={styles.skeletonRow}>
                <View style={styles.skeletonCover} />
                <View style={styles.skeletonMeta}>
                  <View style={styles.skeletonLine1} />
                  <View style={styles.skeletonLine2} />
                </View>
              </View>
            ))}
          </View>
        ) : query.trim().length > 0 ? (
          /* Search Results */
          <View style={styles.resultsContainer}>
            {!hasResults ? (
              <View style={styles.noResultsBox}>
                <Ionicons name="search-outline" size={48} color="#a7a7a7" />
                <Text style={styles.noResultsTitle}>No results found for "{query}"</Text>
                <Text style={styles.noResultsSubtitle}>
                  Check your spelling or try searching for another song, composer, or Tamil keyword.
                </Text>
              </View>
            ) : (
              <>
                {/* Spotify 2-Column Top Result + Songs Section on Desktop */}
                {filterType === 'all' && (
                  <View style={[styles.topResultRow, isDesktop && styles.topResultRowDesktop]}>
                    {/* Top Result Card */}
                    {topSong && (
                      <View style={[styles.section, isDesktop ? styles.topResultLeftCol : { width: '100%' }]}>
                        <Text style={styles.sectionTitle}>Top result</Text>
                        <TouchableOpacity
                          style={styles.topResultCard}
                          activeOpacity={0.85}
                          onPress={() => playTrack(topSong, results.songs)}
                        >
                          <Image source={{ uri: topSong.coverUrl }} style={styles.topResultImg} />
                          <Text numberOfLines={1} style={styles.topResultTitle}>
                            {topSong.title}
                          </Text>
                          <View style={styles.topResultMetaRow}>
                            <View style={styles.topResultBadge}>
                              <Text style={styles.topResultBadgeText}>SONG</Text>
                            </View>
                            <Text numberOfLines={1} style={styles.topResultArtist}>
                              {topSong.artistName}
                            </Text>
                          </View>
                          <View style={styles.topResultPlayCircle}>
                            <Ionicons name="play" size={24} color="#000000" />
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Top 4 Songs List beside Top Result */}
                    {results.songs.length > 0 && (
                      <View style={[styles.section, isDesktop ? styles.topResultRightCol : { width: '100%' }]}>
                        <Text style={styles.sectionTitle}>Songs</Text>
                        {results.songs.slice(0, 4).map((s, idx) => (
                          <SongCard
                            key={s.id}
                            song={s}
                            playlist={results.songs}
                            variant="list"
                            index={idx}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Full Songs Section if filter = 'songs' */}
                {filterType === 'songs' && results.songs.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Songs ({results.songs.length})</Text>
                    {results.songs.map((s, idx) => (
                      <SongCard
                        key={s.id}
                        song={s}
                        playlist={results.songs}
                        variant="list"
                        index={idx}
                      />
                    ))}
                  </View>
                )}

                {/* Artists Section */}
                {(filterType === 'all' || filterType === 'artists') && results.artists.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Artists ({results.artists.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {results.artists.map((a) => (
                        <ArtistCard key={a.id} artist={a} showBio />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Albums Section */}
                {(filterType === 'all' || filterType === 'albums') && results.albums.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Albums ({results.albums.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {results.albums.map((al) => (
                        <AlbumCard key={al.id} album={al} />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          /* Initial Discover View: Tamil Suggestions, Recent Searches & Spotify Browse Categories */
          <View style={styles.initialContainer}>
            {/* Tamil Trending Searches */}
            <View style={styles.suggestionSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.titleWithIcon}>
                  <Ionicons name="flame" size={18} color="#ea580c" />
                  <Text style={styles.sectionTitle}>Trending Tamil Searches</Text>
                </View>
              </View>
              <View style={styles.chipsWrap}>
                {tamilSuggestions.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.tamilChip}
                    onPress={() => {
                      setQuery(item.query);
                      performSearch(item.query);
                    }}
                  >
                    <Text style={styles.tamilChipText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipsWrap}>
                  {recentSearches.map((term, i) => (
                    <TouchableOpacity
                      key={`${term}_${i}`}
                      style={styles.recentChip}
                      onPress={() => {
                        setQuery(term);
                        performSearch(term);
                      }}
                    >
                      <Ionicons name="time-outline" size={14} color="#a7a7a7" />
                      <Text style={styles.recentChipText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Spotify Browse All Categories Grid */}
            <View style={styles.genreSection}>
              <Text style={styles.browseSectionHeading}>Browse all</Text>
              <View style={styles.genreGrid}>
                {SPOTIFY_BROWSE_CATEGORIES.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[
                      styles.spotifyBrowseTile,
                      { backgroundColor: g.color },
                      isDesktop ? styles.browseTileDesktop : isTablet ? styles.browseTileTablet : styles.browseTileMobile
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setQuery(g.query);
                      performSearch(g.query);
                    }}
                  >
                    <Text style={styles.browseCategoryTitle}>{g.name}</Text>
                    <View style={styles.browseCategoryIconBox}>
                      <Ionicons name={g.icon as any} size={32} color="rgba(255, 255, 255, 0.4)" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#121212'
  },
  backButton: {
    marginRight: 12,
    padding: 6
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242424',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
    maxWidth: 500,
    transition: 'background-color 0.2s ease'
  } as any,
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500'
  },
  clearInputBtn: {
    padding: 4
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 8
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#242424'
  },
  filterTabActive: {
    backgroundColor: '#ffffff'
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  filterTabTextActive: {
    color: '#000000'
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120
  },
  skeletonContainer: {
    marginTop: 20
  },
  loadingBox: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8
  },
  loadingText: {
    fontSize: 13,
    color: '#a7a7a7'
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    padding: 10,
    backgroundColor: '#181818',
    borderRadius: 8,
    gap: 12
  },
  skeletonCover: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#282828'
  },
  skeletonMeta: {
    flex: 1,
    gap: 8
  },
  skeletonLine1: {
    height: 14,
    width: '60%',
    backgroundColor: '#282828',
    borderRadius: 4
  },
  skeletonLine2: {
    height: 10,
    width: '40%',
    backgroundColor: '#222222',
    borderRadius: 4
  },
  resultsContainer: {
    marginTop: 8
  },
  topResultRow: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 24
  },
  topResultRowDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  topResultLeftCol: {
    flex: 4
  },
  topResultRightCol: {
    flex: 6
  },
  section: {
    marginBottom: 28
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
    letterSpacing: -0.3
  },
  topResultCard: {
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 20,
    position: 'relative',
    transition: 'background-color 0.2s ease'
  } as any,
  topResultImg: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: '#282828'
  },
  topResultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6
  },
  topResultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  topResultBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  topResultBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  topResultArtist: {
    fontSize: 14,
    color: '#a7a7a7'
  },
  topResultPlayCircle: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6
  },
  noResultsBox: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12
  },
  noResultsSubtitle: {
    fontSize: 13,
    color: '#a7a7a7',
    textAlign: 'center',
    marginTop: 6
  },
  initialContainer: {
    marginTop: 8
  },
  suggestionSection: {
    marginBottom: 24
  },
  recentSection: {
    marginBottom: 28
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  clearText: {
    fontSize: 13,
    color: '#1ed760',
    fontWeight: '700'
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tamilChip: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  tamilChipText: {
    fontSize: 13,
    color: '#f97316',
    fontWeight: '700'
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242424',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  recentChipText: {
    fontSize: 13,
    color: '#ffffff',
    marginLeft: 6
  },
  genreSection: {
    marginTop: 12
  },
  browseSectionHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.3
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  spotifyBrowseTile: {
    height: 120,
    borderRadius: 8,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    transition: 'transform 0.2s ease'
  } as any,
  browseTileDesktop: {
    width: 'calc(25% - 12px)' as any
  },
  browseTileTablet: {
    width: 'calc(33.33% - 11px)' as any
  },
  browseTileMobile: {
    width: 'calc(50% - 8px)' as any
  },
  browseCategoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2
  },
  browseCategoryIconBox: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    transform: [{ rotate: '25deg' }]
  }
});
