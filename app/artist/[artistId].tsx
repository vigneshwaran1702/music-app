import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { artistApi } from '../../services/artistApi';
import { Artist } from '../../types/artist';
import { getArtistImage } from '../../constants/artistImages';
import { SongCard } from '../../components/SongCard';
import { Loading } from '../../components/Loading';
import { usePlayer } from '../../hooks/usePlayer';
import { useResponsive } from '../../hooks/useResponsive';
import { playlistsDb } from '../../database/playlists';

export default function ArtistDetailScreen() {
  const { artistId } = useLocalSearchParams<{ artistId: string }>();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'top20' | 'all'>('top20');
  const [savedTop20, setSavedTop20] = useState(false);
  const [savedAll, setSavedAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedPlaylistId, setSavedPlaylistId] = useState<string | null>(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    async function load() {
      if (!artistId) return;
      setLoading(true);
      const data = await artistApi.getArtistById(artistId);
      setArtist(data);

      if (data) {
        const isTop20 = await playlistsDb.isArtistPlaylistSaved(data.id, 'top20');
        const isAll = await playlistsDb.isArtistPlaylistSaved(data.id, 'all');
        setSavedTop20(isTop20);
        setSavedAll(isAll);
      }
      setLoading(false);
    }
    load();
  }, [artistId]);

  const handleSavePlaylist = async (mode: 'top20' | 'all') => {
    if (!artist || !artist.topTracks || artist.topTracks.length === 0) return;

    try {
      const saved = await playlistsDb.saveArtistPlaylist(artist, artist.topTracks, mode);
      if (mode === 'top20') {
        setSavedTop20(true);
      } else {
        setSavedAll(true);
      }
      setSavedPlaylistId(saved.id);
      setToastMessage(`Saved "${saved.title}" (${saved.songCount} songs) to your Playlists!`);

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } catch (err) {
      console.warn('Failed to save artist playlist', err);
      Alert.alert('Error', 'Could not save playlist. Please try again.');
    }
  };

  const handlePlaySelection = (tracks: any[]) => {
    if (tracks && tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loading message="Loading artist profile..." />
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="person-outline" size={56} color="#a7a7a7" style={{ marginBottom: 16 }} />
          <Text style={styles.notFoundText}>Artist not found</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#1ed760', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, marginTop: 16 }}
            onPress={() => router.push('/artists')}
          >
            <Text style={{ color: '#000000', fontWeight: '700', fontSize: 14 }}>Browse Artists</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allTracks = artist.topTracks || [];
  const top20Tracks = allTracks.slice(0, 20);
  const displayedTracks = activeTab === 'top20' ? top20Tracks : allTracks;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <View style={styles.toastBox}>
          <Ionicons name="checkmark-circle" size={20} color="#1ed760" />
          <Text style={styles.toastText} numberOfLines={1}>{toastMessage}</Text>
          {savedPlaylistId && (
            <TouchableOpacity
              style={styles.toastBtn}
              onPress={() => {
                setToastMessage(null);
                router.push(`/playlist/${savedPlaylistId}` as any);
              }}
            >
              <Text style={styles.toastBtnText}>View</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, isMobile && { paddingBottom: 170 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back navigation */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>

        {/* Spotify Artist Hero Header */}
        <LinearGradient
          colors={['#27272a', '#18181b', '#121212']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.heroBox,
            isMobile && { flexDirection: 'column', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 16 }
          ]}
        >
          <Image
            source={{ uri: getArtistImage(artist.name, artist.imageUrl) }}
            style={[styles.heroImage, isMobile && { width: 140, height: 140, borderRadius: 70 }]}
          />

          <View style={[styles.heroMeta, isMobile && { alignItems: 'center' }]}>
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={18} color="#38bdf8" />
              <Text style={styles.verifiedText}>Verified Artist</Text>
            </View>

            <Text style={[styles.heroName, isMobile && { fontSize: 28, textAlign: 'center' }]}>{artist.name}</Text>

            {artist.monthlyListeners ? (
              <Text style={[styles.listenersText, isMobile && { textAlign: 'center' }]}>
                {artist.monthlyListeners.toLocaleString()} monthly listeners
              </Text>
            ) : null}

            {artist.genres && (
              <View style={[styles.genrePills, isMobile && { justifyContent: 'center' }]}>
                {artist.genres.map((g, i) => (
                  <View key={i} style={styles.genrePill}>
                    <Text style={styles.genrePillText}>{g}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Actions Bar */}
        {allTracks.length > 0 && (
          <View style={[styles.actionsBar, isMobile && { paddingHorizontal: 16, flexWrap: 'wrap', gap: 12 }]}>
            <TouchableOpacity
              style={styles.bigGreenPlayBtn}
              onPress={() => handlePlaySelection(displayedTracks)}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={26} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.savePlaylistActionBtn, savedTop20 && styles.savePlaylistActionBtnActive]}
              onPress={() => handleSavePlaylist('top20')}
              activeOpacity={0.8}
            >
              <Ionicons
                name={savedTop20 ? 'checkmark-circle' : 'add-circle-outline'}
                size={18}
                color={savedTop20 ? '#1ed760' : '#ffffff'}
              />
              <Text style={[styles.savePlaylistActionText, savedTop20 && { color: '#1ed760' }]}>
                {savedTop20 ? 'Best 20 Saved' : 'Save Best 20'}
              </Text>
            </TouchableOpacity>

            {allTracks.length > 20 && (
              <TouchableOpacity
                style={[styles.savePlaylistActionBtn, savedAll && styles.savePlaylistActionBtnActive]}
                onPress={() => handleSavePlaylist('all')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={savedAll ? 'checkmark-circle' : 'albums-outline'}
                  size={18}
                  color={savedAll ? '#1ed760' : '#ffffff'}
                />
                <Text style={[styles.savePlaylistActionText, savedAll && { color: '#1ed760' }]}>
                  {savedAll ? 'All Saved' : `Save All (${allTracks.length})`}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.followBtn} activeOpacity={0.8}>
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Artist Playlist Showcase Card */}
        {allTracks.length > 0 && (
          <View style={[styles.showcaseSection, isMobile && { paddingHorizontal: 16 }]}>
            <LinearGradient
              colors={['#1e3a5f', '#152538', '#141416']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.showcaseCard}
            >
              <Image
                source={{ uri: getArtistImage(artist.name, artist.imageUrl) }}
                style={styles.showcaseCover}
              />

              <View style={styles.showcaseContent}>
                <View style={styles.showcaseBadgeRow}>
                  <Ionicons name="sparkles" size={13} color="#38bdf8" />
                  <Text style={styles.showcaseBadgeText}>ARTIST PLAYLIST</Text>
                </View>

                <Text style={styles.showcaseTitle}>Best of {artist.name}</Text>
                <Text style={styles.showcaseSubtitle} numberOfLines={2}>
                  The top {top20Tracks.length} essential chartbusters and career-defining hits by {artist.name}.
                </Text>

                <View style={styles.showcaseButtonsRow}>
                  <TouchableOpacity
                    style={styles.showcasePlayBtn}
                    onPress={() => handlePlaySelection(top20Tracks)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="play" size={16} color="#000000" />
                    <Text style={styles.showcasePlayBtnText}>Play Best 20</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.showcaseSaveBtn, savedTop20 && styles.showcaseSaveBtnActive]}
                    onPress={() => handleSavePlaylist('top20')}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={savedTop20 ? 'checkmark' : 'add'}
                      size={16}
                      color={savedTop20 ? '#1ed760' : '#ffffff'}
                    />
                    <Text style={[styles.showcaseSaveBtnText, savedTop20 && { color: '#1ed760' }]}>
                      {savedTop20 ? 'In Library' : 'Save to Library'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Popular Songs Header & Tab Switcher */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tracks</Text>

            {/* Switcher: Top 20 vs All Songs */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[styles.tabPill, activeTab === 'top20' && styles.tabPillActive]}
                onPress={() => setActiveTab('top20')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabPillText, activeTab === 'top20' && styles.tabPillTextActive]}>
                  Best 20 ({top20Tracks.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
                onPress={() => setActiveTab('all')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabPillText, activeTab === 'all' && styles.tabPillTextActive]}>
                  All Songs ({allTracks.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {displayedTracks.length > 0 ? (
            displayedTracks.map((s, idx) => (
              <SongCard
                key={`${s.id}_${idx}`}
                song={s}
                playlist={displayedTracks}
                variant="list"
                index={idx}
              />
            ))
          ) : (
            <Text style={styles.noSongsText}>No tracks listed yet.</Text>
          )}
        </View>

        {/* About Bio */}
        {artist.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{artist.bio}</Text>
            </View>
          </View>
        ) : null}
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
    paddingBottom: 120
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8
  },
  heroBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 24
  },
  heroImage: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#282828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14
  },
  heroMeta: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  verifiedText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600'
  },
  heroName: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 8
  },
  listenersText: {
    fontSize: 14,
    color: '#a7a7a7',
    marginBottom: 10
  },
  genrePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  genrePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  genrePillText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600'
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 20
  },
  bigGreenPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
  followBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20
  },
  followBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
    letterSpacing: -0.3
  },
  bioCard: {
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 20
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#a7a7a7'
  },
  noSongsText: {
    fontSize: 14,
    color: '#a7a7a7'
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notFoundText: {
    fontSize: 16,
    color: '#a7a7a7'
  },
  toastBox: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10
  },
  toastText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600'
  },
  toastBtn: {
    backgroundColor: '#1ed760',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14
  },
  toastBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700'
  },
  savePlaylistActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  savePlaylistActionBtnActive: {
    borderColor: '#1ed760',
    backgroundColor: 'rgba(30, 215, 96, 0.12)'
  },
  savePlaylistActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600'
  },
  showcaseSection: {
    paddingHorizontal: 24,
    marginBottom: 24
  },
  showcaseCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8
  },
  showcaseCover: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#282828'
  },
  showcaseContent: {
    flex: 1,
    justifyContent: 'center'
  },
  showcaseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4
  },
  showcaseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.8
  },
  showcaseTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4
  },
  showcaseSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 17,
    marginBottom: 10
  },
  showcaseButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  showcasePlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1ed760',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6
  },
  showcasePlayBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700'
  },
  showcaseSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5
  },
  showcaseSaveBtnActive: {
    borderColor: '#1ed760',
    backgroundColor: 'rgba(30, 215, 96, 0.15)'
  },
  showcaseSaveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 10
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#2e2e2e'
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  tabPillActive: {
    backgroundColor: '#333333'
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888'
  },
  tabPillTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  }
});
