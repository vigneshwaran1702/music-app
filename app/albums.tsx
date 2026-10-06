import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { albumApi } from '../services/albumApi';
import { Album } from '../types/album';
import { AlbumCard } from '../components/AlbumCard';
import { Loading } from '../components/Loading';
import { useResponsive } from '../hooks/useResponsive';
import { usePlayer } from '../hooks/usePlayer';

type AlbumFilter =
  | 'all'
  | 'tamil'
  | 'love'
  | 'breakup'
  | 'sad'
  | 'happy'
  | 'melody'
  | 'kuthu'
  | 'vibe'
  | 'night'
  | 'morning'
  | 'drive'
  | 'soundtrack';

interface FilterChip {
  id: AlbumFilter;
  label: string;
  emoji: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { id: 'all', label: 'All Albums', emoji: '💿' },
  { id: 'tamil', label: 'Tamil Moods (தமிழ்)', emoji: '🔥' },
  { id: 'love', label: 'Love (காதல்)', emoji: '❤️' },
  { id: 'breakup', label: 'Breakup (பிரிவு)', emoji: '💔' },
  { id: 'sad', label: 'Sad (சோகம்)', emoji: '🌧️' },
  { id: 'happy', label: 'Happy (மகிழ்ச்சி)', emoji: '🎉' },
  { id: 'melody', label: 'Melody (மெலடி)', emoji: '🎶' },
  { id: 'kuthu', label: 'Kuthu (குத்து)', emoji: '🥁' },
  { id: 'vibe', label: 'Vibe (வைப்)', emoji: '⚡' },
  { id: 'night', label: 'Night Vibe (இரவு)', emoji: '🌙' },
  { id: 'morning', label: 'Morning Vibe (காலை)', emoji: '🌅' },
  { id: 'drive', label: 'Long Drive (பயணம்)', emoji: '🚗' },
  { id: 'soundtrack', label: 'Movie OSTs', emoji: '🎬' }
];

export default function AlbumsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const { isMobile } = useResponsive();
  const { playTrack } = usePlayer();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<AlbumFilter>(
    (params.filter as AlbumFilter) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const list = await albumApi.getAllAlbums();
      setAlbums(list);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (params.filter && FILTER_CHIPS.some((f) => f.id === params.filter)) {
      setActiveFilter(params.filter as AlbumFilter);
    }
  }, [params.filter]);

  const filteredAlbums = useMemo(() => {
    let result = albums;

    // Filter by mood/category
    if (activeFilter === 'tamil') {
      result = result.filter(
        (a) =>
          a.id.startsWith('album_tamil_') ||
          (a.tamilTitle && a.tamilTitle.length > 0) ||
          (a.genre && a.genre.toLowerCase().includes('tamil'))
      );
    } else if (activeFilter === 'love') {
      result = result.filter(
        (a) =>
          a.mood === 'love' ||
          (a.title && a.title.toLowerCase().includes('love')) ||
          (a.genre && a.genre.toLowerCase().includes('romance'))
      );
    } else if (activeFilter === 'breakup') {
      result = result.filter(
        (a) =>
          a.mood === 'breakup' ||
          (a.title && a.title.toLowerCase().includes('breakup')) ||
          (a.genre && a.genre.toLowerCase().includes('breakup'))
      );
    } else if (activeFilter === 'sad') {
      result = result.filter(
        (a) =>
          a.mood === 'sad' ||
          (a.title && a.title.toLowerCase().includes('sad')) ||
          (a.genre && a.genre.toLowerCase().includes('melancholy'))
      );
    } else if (activeFilter === 'happy') {
      result = result.filter(
        (a) =>
          a.mood === 'happy' ||
          (a.title && a.title.toLowerCase().includes('happy')) ||
          (a.genre && a.genre.toLowerCase().includes('feel good'))
      );
    } else if (activeFilter === 'melody') {
      result = result.filter(
        (a) =>
          a.mood === 'melody' ||
          (a.title && a.title.toLowerCase().includes('melody')) ||
          (a.genre && a.genre.toLowerCase().includes('melody'))
      );
    } else if (activeFilter === 'kuthu') {
      result = result.filter(
        (a) =>
          a.mood === 'kuthu' ||
          (a.title && a.title.toLowerCase().includes('kuthu')) ||
          (a.genre && a.genre.toLowerCase().includes('kuthu'))
      );
    } else if (activeFilter === 'vibe') {
      result = result.filter(
        (a) =>
          a.mood === 'vibe' ||
          (a.title && a.title.toLowerCase().includes('vibe')) ||
          (a.genre && a.genre.toLowerCase().includes('vibe'))
      );
    } else if (activeFilter === 'night') {
      result = result.filter(
        (a) =>
          a.mood === 'night' ||
          (a.title && a.title.toLowerCase().includes('night')) ||
          (a.genre && a.genre.toLowerCase().includes('chill'))
      );
    } else if (activeFilter === 'morning') {
      result = result.filter(
        (a) =>
          a.mood === 'morning' ||
          (a.title && a.title.toLowerCase().includes('morning')) ||
          (a.genre && a.genre.toLowerCase().includes('morning'))
      );
    } else if (activeFilter === 'drive') {
      result = result.filter(
        (a) =>
          a.mood === 'drive' ||
          (a.title && a.title.toLowerCase().includes('drive')) ||
          (a.genre && a.genre.toLowerCase().includes('travel'))
      );
    } else if (activeFilter === 'soundtrack') {
      result = result.filter(
        (a) =>
          !a.id.startsWith('album_tamil_') ||
          (a.genre && a.genre.toLowerCase().includes('soundtrack')) ||
          (a.title && a.title.toLowerCase().includes('soundtrack'))
      );
    }

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.tamilTitle && a.tamilTitle.toLowerCase().includes(q)) ||
          a.artistName.toLowerCase().includes(q) ||
          (a.genre && a.genre.toLowerCase().includes(q))
      );
    }

    return result;
  }, [albums, activeFilter, searchQuery]);

  const featuredTamilAlbum = albums.find((a) => a.id === 'album_tamil_love') || albums[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, isMobile && { paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Albums & Mood EPs</Text>
            <Text style={styles.headerSubtitle}>
              காதல், பிரிவு, சோகம், மகிழ்ச்சி, மெலடி, குத்து & வைப் ஆல்பங்கள்
            </Text>
          </View>
        </View>

        {/* Featured Banner for Tamil Mood Albums */}
        {featuredTamilAlbum && (
          <LinearGradient
            colors={['#881337', '#4c0519', '#18181b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bannerCard, isMobile && { flexDirection: 'column', alignItems: 'flex-start' }]}
          >
            <Image source={{ uri: featuredTamilAlbum.coverUrl }} style={styles.bannerCover} />
            <View style={styles.bannerInfo}>
              <View style={styles.bannerTagRow}>
                <View style={styles.specialBadge}>
                  <Text style={styles.specialBadgeText}>தமிழ் ஸ்பெஷல் • FEATURED</Text>
                </View>
                <Text style={styles.bannerCategoryText}>MOOD ALBUM</Text>
              </View>
              <Text style={styles.bannerTitle}>Tamil Love Hits • காதல் கீதங்கள்</Text>
              <Text style={styles.bannerDesc} numberOfLines={2}>
                Soul-stirring romantic melodies, timeless love duets & acoustic classics from AR Rahman, Harris & Anirudh.
              </Text>
              <View style={styles.bannerButtonsRow}>
                <TouchableOpacity
                  style={styles.bannerPlayBtn}
                  onPress={() => router.push(`/album/${featuredTamilAlbum.id}` as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="play" size={18} color="#000000" />
                  <Text style={styles.bannerPlayText}>Listen Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bannerSecondaryBtn}
                  onPress={() => setActiveFilter('tamil')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.bannerSecondaryText}>Browse Tamil Moods</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#a7a7a7" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search albums by title, mood, or artist..."
            placeholderTextColor="#71717a"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#a7a7a7" />
            </TouchableOpacity>
          )}
        </View>

        {/* Mood & Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(chip.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipEmoji}>{chip.emoji}</Text>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Albums Grid */}
        {loading ? (
          <Loading message="Loading curated albums..." />
        ) : filteredAlbums.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="disc-outline" size={48} color="#71717a" />
            <Text style={styles.emptyTitle}>No albums found</Text>
            <Text style={styles.emptyDesc}>Try selecting another mood or clearing the search.</Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetBtnText}>View All Albums</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} size={156} />
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
    backgroundColor: '#121212'
  },
  content: {
    padding: 24,
    paddingBottom: 140
  },
  headerRow: {
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.6,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a1a1aa'
  },
  bannerCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16
  },
  bannerCover: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#27272a'
  },
  bannerInfo: {
    flex: 1
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  specialBadge: {
    backgroundColor: '#f43f5e',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  specialBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  bannerCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fb7185',
    letterSpacing: 0.8
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4
  },
  bannerDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
    marginBottom: 12
  },
  bannerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  bannerPlayBtn: {
    backgroundColor: '#1ed760',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  bannerPlayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000'
  },
  bannerSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  bannerSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2e2e2e'
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff'
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 4
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#222222',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  chipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  },
  chipEmoji: {
    fontSize: 13
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e4e4e7'
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '700'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4
  },
  emptyDesc: {
    fontSize: 13,
    color: '#a1a1aa',
    marginBottom: 18,
    textAlign: 'center'
  },
  resetBtn: {
    backgroundColor: '#1ed760',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000'
  }
});
