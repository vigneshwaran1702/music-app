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
import { usePlayer } from '../hooks/usePlayer';
import { APP_CONFIG } from '../constants/config';

type LibraryTab = 'playlists' | 'liked' | 'history' | 'downloads';

export default function LibraryScreen() {
  const router = useRouter();
  const { playTrack } = usePlayer();
  const [activeTab, setActiveTab] = useState<LibraryTab>('playlists');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
            tintColor={APP_CONFIG.THEME.accentPrimary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerPretitle}>COLLECTION</Text>
            <Text style={styles.headerTitle}>Your Library</Text>
          </View>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.createBtnText}>New Playlist</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Pills */}
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
                  size={16}
                  color={isActive ? '#ffffff' : APP_CONFIG.THEME.textSecondary}
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
                <Ionicons name="musical-notes-outline" size={48} color={APP_CONFIG.THEME.textMuted} />
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
                    style={styles.playlistTile}
                    onPress={() => router.push('/playlists')}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: pl.coverUrl }} style={styles.playlistImg} />
                    <Text numberOfLines={1} style={styles.playlistTileTitle}>
                      {pl.title}
                    </Text>
                    <Text style={styles.playlistTileMeta}>
                      {pl.songCount} {pl.songCount === 1 ? 'track' : 'tracks'}
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
              >
                <Ionicons name="play" size={18} color="#ffffff" />
                <Text style={styles.playCollectionText}>
                  Play All Liked Songs ({likedSongs.length})
                </Text>
              </TouchableOpacity>
            )}

            {likedSongs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="heart-outline" size={48} color={APP_CONFIG.THEME.textMuted} />
                <Text style={styles.emptyTitle}>No liked songs yet</Text>
                <Text style={styles.emptyDesc}>
                  Tap the heart icon on any track to save it here.
                </Text>
              </View>
            ) : (
              <View style={styles.songListWrap}>
                {likedSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    playlist={likedSongs}
                    variant="list"
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
              >
                <Ionicons name="play" size={18} color="#ffffff" />
                <Text style={styles.playCollectionText}>
                  Replay History ({recentSongs.length})
                </Text>
              </TouchableOpacity>
            )}

            {recentSongs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="time-outline" size={48} color={APP_CONFIG.THEME.textMuted} />
                <Text style={styles.emptyTitle}>No listening history</Text>
                <Text style={styles.emptyDesc}>
                  Songs you play will show up here automatically.
                </Text>
              </View>
            ) : (
              <View style={styles.songListWrap}>
                {recentSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    playlist={recentSongs}
                    variant="list"
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
                <Ionicons name="cloud-download-outline" size={48} color={APP_CONFIG.THEME.textMuted} />
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
                {downloads.map((item) => (
                  <SongCard
                    key={item.song.id}
                    song={item.song}
                    playlist={downloads.map((d) => d.song)}
                    variant="list"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16
  },
  headerPretitle: {
    fontSize: 11,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textMuted,
    letterSpacing: 1
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary,
    letterSpacing: -0.5
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6
  },
  createBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20
  },
  tabPill: {
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
  tabPillActive: {
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    borderColor: APP_CONFIG.THEME.accentPrimary
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textSecondary
  },
  tabLabelActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  tabCount: {
    fontSize: 11,
    color: APP_CONFIG.THEME.textMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10
  },
  tabCountActive: {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.25)'
  },
  section: {
    paddingHorizontal: 20
  },
  playlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  playlistTile: {
    width: '47%',
    backgroundColor: '#131625',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#20253b'
  },
  playlistImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#1a1e32',
    marginBottom: 10
  },
  playlistTileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 2
  },
  playlistTileMeta: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted
  },
  playCollectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16
  },
  playCollectionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  songListWrap: {},
  emptyCard: {
    backgroundColor: '#131625',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#20253b',
    padding: 36,
    alignItems: 'center',
    gap: 10
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginTop: 6
  },
  emptyDesc: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    textAlign: 'center',
    maxWidth: 300
  },
  emptyActionBtn: {
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8
  },
  emptyActionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  }
});
