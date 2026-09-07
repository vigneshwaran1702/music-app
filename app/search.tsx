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
import { LinearGradient } from 'expo-linear-gradient';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';
import { AlbumCard } from '../components/AlbumCard';
import { musicApi } from '../services/musicApi';
import { historyDb } from '../database/history';
import { usePlayer } from '../hooks/usePlayer';
import { GENRES } from '../constants/genres';
import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';
import { APP_CONFIG } from '../constants/config';

type FilterType = 'all' | 'songs' | 'artists' | 'albums';

export default function SearchScreen() {
  const router = useRouter();
  const { playTrack } = usePlayer();
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
  const topArtist = results.artists[0];
  const hasResults =
    results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={APP_CONFIG.THEME.textPrimary} />
        </TouchableOpacity>

        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color={APP_CONFIG.THEME.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={() => performSearch(query)}
            placeholder="Search songs, artists, albums, or தமிழ்..."
            placeholderTextColor={APP_CONFIG.THEME.textMuted}
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
              <Ionicons name="close-circle" size={18} color={APP_CONFIG.THEME.textMuted} />
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
          /* Shimmer / Skeleton Loader */
          <View style={styles.skeletonContainer}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={APP_CONFIG.THEME.accentPrimary} />
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
                <Ionicons name="search-outline" size={48} color={APP_CONFIG.THEME.textMuted} />
                <Text style={styles.noResultsTitle}>No results found for "{query}"</Text>
                <Text style={styles.noResultsSubtitle}>
                  Check your spelling or try searching for another song, composer, or Tamil keyword.
                </Text>
              </View>
            ) : (
              <>
                {/* Top Result Card (Spotify style) */}
                {filterType === 'all' && topSong && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Top Result</Text>
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
                        <Ionicons name="play" size={24} color="#ffffff" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Songs Section */}
                {(filterType === 'all' || filterType === 'songs') && results.songs.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Songs ({results.songs.length})</Text>
                    {results.songs.map((s) => (
                      <SongCard key={s.id} song={s} playlist={results.songs} variant="list" />
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
          /* Initial Discover View: Tamil Quick Suggestions & Recent Searches & Browse Genres */
          <View style={styles.initialContainer}>
            {/* Tamil Unicode & Trending Suggestions */}
            <View style={styles.suggestionSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.titleWithIcon}>
                  <Ionicons name="flame" size={18} color={APP_CONFIG.THEME.accentTamil} />
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
                      <Ionicons name="time-outline" size={14} color={APP_CONFIG.THEME.textMuted} />
                      <Text style={styles.recentChipText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Browse Categories / Genres */}
            <View style={styles.genreSection}>
              <Text style={styles.sectionTitle}>Browse All Categories</Text>
              <View style={styles.genreGrid}>
                {GENRES.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.genreCard, { borderColor: g.color }]}
                    onPress={() => {
                      setQuery(g.name);
                      performSearch(g.name);
                    }}
                  >
                    <Ionicons name={g.icon as any} size={24} color={g.color} />
                    <Text style={styles.genreName}>{g.name}</Text>
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
    backgroundColor: APP_CONFIG.THEME.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  backButton: {
    marginRight: 10,
    padding: 6
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141727',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#22273e',
    paddingHorizontal: 14,
    height: 44
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: APP_CONFIG.THEME.textPrimary,
    fontSize: 14
  },
  clearInputBtn: {
    padding: 4
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#141727',
    borderWidth: 1,
    borderColor: '#22273e'
  },
  filterTabActive: {
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    borderColor: APP_CONFIG.THEME.accentPrimary
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textSecondary
  },
  filterTabTextActive: {
    color: '#ffffff'
  },
  scrollContent: {
    paddingHorizontal: 16,
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
    color: APP_CONFIG.THEME.textMuted
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    padding: 10,
    backgroundColor: '#131625',
    borderRadius: 12,
    gap: 12
  },
  skeletonCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1e2338'
  },
  skeletonMeta: {
    flex: 1,
    gap: 8
  },
  skeletonLine1: {
    height: 14,
    width: '60%',
    backgroundColor: '#1e2338',
    borderRadius: 4
  },
  skeletonLine2: {
    height: 10,
    width: '40%',
    backgroundColor: '#1a1e32',
    borderRadius: 4
  },
  resultsContainer: {
    marginTop: 8
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 12
  },
  topResultCard: {
    backgroundColor: '#141727',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#22273e',
    padding: 20,
    position: 'relative',
    marginBottom: 16
  },
  topResultImg: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginBottom: 14
  },
  topResultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 4
  },
  topResultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  topResultBadge: {
    backgroundColor: '#20253c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  topResultBadgeText: {
    color: APP_CONFIG.THEME.textSecondary,
    fontSize: 10,
    fontWeight: '800'
  },
  topResultArtist: {
    fontSize: 14,
    color: APP_CONFIG.THEME.textSecondary
  },
  topResultPlayCircle: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: APP_CONFIG.THEME.accentPrimary,
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
    fontSize: 16,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginTop: 12
  },
  noResultsSubtitle: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    textAlign: 'center',
    marginTop: 6
  },
  initialContainer: {
    marginTop: 8
  },
  suggestionSection: {
    marginBottom: 20
  },
  recentSection: {
    marginBottom: 24
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
    fontSize: 12,
    color: APP_CONFIG.THEME.accentPrimary,
    fontWeight: '600'
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tamilChip: {
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16
  },
  tamilChipText: {
    fontSize: 13,
    color: APP_CONFIG.THEME.accentTamil,
    fontWeight: '600'
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141727',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#22273e'
  },
  recentChipText: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    marginLeft: 6
  },
  genreSection: {
    marginTop: 8
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  genreCard: {
    width: '48%',
    height: 70,
    backgroundColor: '#141727',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10
  },
  genreName: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary,
    flex: 1
  }
});
