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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { playlistsDb } from '../database/playlists';
import { favoritesDb } from '../database/favorites';
import { historyDb } from '../database/history';
import { downloadsDb, DownloadedRecord } from '../database/downloads';
import { Playlist } from '../types/playlist';
import { Song } from '../types/music';
import { SongCard } from '../components/SongCard';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import { SpotifyImportModal } from '../components/SpotifyImportModal';
import { usePlayer } from '../hooks/usePlayer';
import { useResponsive } from '../hooks/useResponsive';

type LibraryTab = 'playlists' | 'liked' | 'history' | 'downloads';

export default function LibraryScreen() {
  const router = useRouter();
  const { playTrack } = usePlayer();
  const { isDesktop, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState<LibraryTab>('playlists');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [downloads, setDownloads] = useState<DownloadedRecord[]>([]);

  useEffect(() => {
    loadLibraryData();
  }, [activeTab]);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const [pls, faves, hist, dls] = await Promise.all([
        playlistsDb.getPlaylists(),
        favoritesDb.getFavorites(),
        historyDb.getListeningHistory(),
        downloadsDb.getDownloads()
      ]);
      setPlaylists(pls);
      setLikedSongs(faves);
      setRecentSongs(hist);
      setDownloads(dls);
    } catch (e) {
      console.warn('Library load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: LibraryTab; label: string; icon: string; count: number }[] = [
    { id: 'playlists', label: 'Playlists', icon: 'musical-notes', count: playlists.length },
    { id: 'liked', label: 'Liked Songs', icon: 'heart', count: likedSongs.length },
    { id: 'history', label: 'Recently Played', icon: 'time', count: recentSongs.length },
    { id: 'downloads', label: 'Downloads', icon: 'cloud-download', count: downloads.length }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadLibraryData}
            tintColor="#1ed760"
          />
        }
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Your Library</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: '#1db954' }]}
              onPress={() => setShowSpotifyModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="musical-notes" size={18} color="#000000" />
              <Text style={styles.createBtnText}>Spotify Connect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#000000" />
              <Text style={styles.createBtnText}>New Playlist</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Filter Pills */}
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={15}
                  color={isActive ? '#000000' : '#ffffff'}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                  {tab.count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        {activeTab === 'playlists' && (
          <View style={styles.section}>
            {playlists.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="musical-notes-outline" size={48} color="#a7a7a7" />
                <Text style={styles.emptyTitle}>Create your first playlist</Text>
                <Text style={styles.emptyDesc}>
                  It's easy, we'll help you organize your favorite tracks.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Text style={styles.emptyActionText}>Create Playlist</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.playlistGrid}>
                {playlists.map((pl) => (
                  <TouchableOpacity
                    key={pl.id}
                    style={[
                      styles.playlistTile,
                      isDesktop ? styles.playlistTileDesktop : isTablet ? styles.playlistTileTablet : styles.playlistTileMobile
                    ]}
                    onPress={() => router.push('/playlists')}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: pl.coverUrl }} style={styles.playlistImg} />
                    <Text numberOfLines={1} style={styles.playlistTileTitle}>
                      {pl.title}
                    </Text>
                    <Text style={styles.playlistTileMeta}>
                      Playlist • {pl.songCount || pl.tracks?.length || 0} songs
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'liked' && (
          <View style={styles.section}>
            {likedSongs.length > 0 && (
              <TouchableOpacity
                style={styles.playCollectionBtn}
                onPress={() => playTrack(likedSongs[0], likedSongs)}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={18} color="#000000" />
                <Text style={styles.playCollectionText}>
                  Play All Liked Songs ({likedSongs.length})
                </Text>
              </TouchableOpacity>
            )}

            {likedSongs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="heart-outline" size={48} color="#a7a7a7" />
                <Text style={styles.emptyTitle}>No liked songs yet</Text>
                <Text style={styles.emptyDesc}>
                  Tap the heart icon on any track to save it here.
                </Text>
              </View>
            ) : (
              <View style={styles.songListWrap}>
                {likedSongs.map((song, idx) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    playlist={likedSongs}
                    variant="list"
                    index={idx}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.section}>
            {recentSongs.length > 0 && (
              <TouchableOpacity
                style={styles.playCollectionBtn}
                onPress={() => playTrack(recentSongs[0], recentSongs)}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={18} color="#000000" />
                <Text style={styles.playCollectionText}>
                  Replay History ({recentSongs.length})
                </Text>
              </TouchableOpacity>
            )}

            {recentSongs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="time-outline" size={48} color="#a7a7a7" />
                <Text style={styles.emptyTitle}>No listening history</Text>
                <Text style={styles.emptyDesc}>
                  Songs you play will show up here automatically.
                </Text>
              </View>
            ) : (
              <View style={styles.songListWrap}>
                {recentSongs.map((song, idx) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    playlist={recentSongs}
                    variant="list"
                    index={idx}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'downloads' && (
          <View style={styles.section}>
            {downloads.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="cloud-download-outline" size={48} color="#a7a7a7" />
                <Text style={styles.emptyTitle}>No downloaded tracks</Text>
                <Text style={styles.emptyDesc}>
                  Download songs for uninterrupted offline playback.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => router.push('/downloads')}
                >
                  <Text style={styles.emptyActionText}>Manage Downloads</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.songListWrap}>
                {downloads.map((item, idx) => (
                  <SongCard
                    key={item.song.id}
                    song={item.song}
                    playlist={downloads.map((d) => d.song)}
                    variant="list"
                    index={idx}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => loadLibraryData()}
      />

      {/* Spotify Import Modal */}
      <SpotifyImportModal
        visible={showSpotifyModal}
        onClose={() => setShowSpotifyModal(false)}
        onImportComplete={() => loadLibraryData()}
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
    paddingBottom: 120
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1ed760',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6
  },
  createBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 20
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6
  },
  tabPillActive: {
    backgroundColor: '#ffffff'
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff'
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '700'
  },
  tabCount: {
    fontSize: 11,
    color: '#a7a7a7',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10
  },
  tabCountActive: {
    color: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.12)'
  },
  section: {
    paddingHorizontal: 24
  },
  playlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  playlistTile: {
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 12,
    transition: 'background-color 0.2s ease'
  } as any,
  playlistTileDesktop: {
    width: 'calc(20% - 13px)' as any
  },
  playlistTileTablet: {
    width: 'calc(33.33% - 11px)' as any
  },
  playlistTileMobile: {
    width: 'calc(50% - 8px)' as any
  },
  playlistImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 6,
    backgroundColor: '#282828',
    marginBottom: 10
  },
  playlistTileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4
  },
  playlistTileMeta: {
    fontSize: 12,
    color: '#a7a7a7'
  },
  playCollectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1ed760',
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginBottom: 16
  },
  playCollectionText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14
  },
  songListWrap: {},
  emptyCard: {
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 36,
    alignItems: 'center',
    gap: 10
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 6
  },
  emptyDesc: {
    fontSize: 13,
    color: '#a7a7a7',
    textAlign: 'center',
    maxWidth: 300
  },
  emptyActionBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8
  },
  emptyActionText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13
  }
});
