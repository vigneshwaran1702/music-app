import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SearchBar } from '../components/SearchBar';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';
import { AlbumCard } from '../components/AlbumCard';
import { Loading } from '../components/Loading';
import { musicApi } from '../services/musicApi';
import { historyDb } from '../database/history';
import { GENRES } from '../constants/genres';
import { Song } from '../types/music';
import { Artist } from '../types/artist';
import { Album } from '../types/album';
import { APP_CONFIG } from '../constants/config';

type FilterType = 'all' | 'songs' | 'artists' | 'albums';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [results, setResults] = useState<{
    songs: Song[];
    artists: Artist[];
    albums: Album[];
  }>({ songs: [], artists: [], albums: [] });

  useEffect(() => {
    historyDb.getRecentSearches().then(setRecentSearches);
  }, []);

  const performSearch = async (text: string) => {
    if (!text.trim()) {
      setResults({ songs: [], artists: [], albums: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await musicApi.searchAll(text);
      setResults(data);
      historyDb.addRecentSearch(text).then(() => {
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
    }
  };

  const handleClearHistory = async () => {
    await historyDb.clearRecentSearches();
    setRecentSearches([]);
  };

  const hasResults =
    results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={APP_CONFIG.THEME.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={query}
            onChangeText={handleQueryChange}
            onSubmit={() => performSearch(query)}
            placeholder="Search songs, artists, genres..."
            autoFocus
          />
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
          <Loading message="Searching catalogs..." />
        ) : query.trim().length > 0 ? (
          /* Search Results */
          <View style={styles.resultsContainer}>
            {!hasResults ? (
              <View style={styles.noResultsBox}>
                <Ionicons name="search-outline" size={48} color={APP_CONFIG.THEME.textMuted} />
                <Text style={styles.noResultsTitle}>No results found for "{query}"</Text>
                <Text style={styles.noResultsSubtitle}>
                  Try checking the spelling or searching for a different artist or genre.
                </Text>
              </View>
            ) : (
              <>
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
          /* Initial Discover View: Recent Searches & Genres Grid */
          <View style={styles.initialContainer}>
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentChipsWrap}>
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
              <Text style={styles.sectionTitle}>Browse Genres</Text>
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
    paddingVertical: 10
  },
  backButton: {
    marginRight: 10,
    padding: 6
  },
  searchBarWrapper: {
    flex: 1
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
    backgroundColor: '#161928',
    borderWidth: 1,
    borderColor: '#242a42'
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
  recentSection: {
    marginBottom: 24
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  clearText: {
    fontSize: 12,
    color: APP_CONFIG.THEME.accentPrimary,
    fontWeight: '600'
  },
  recentChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161928',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23293e'
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
    backgroundColor: '#151724',
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
