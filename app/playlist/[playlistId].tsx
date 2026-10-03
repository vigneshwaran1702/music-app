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
import { playlistsDb } from '../../database/playlists';
import { Playlist } from '../../types/playlist';
import { SongCard } from '../../components/SongCard';
import { Loading } from '../../components/Loading';
import { usePlayer } from '../../hooks/usePlayer';
import { useResponsive } from '../../hooks/useResponsive';
import { getPlaylistCover, isValidImage, DEFAULT_PLAYLIST_COVER } from '../../constants/artistImages';
import { musicApi } from '../../services/musicApi';

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPopulating, setIsPopulating] = useState(false);
  const { playTrack } = usePlayer();

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const loadPlaylist = async () => {
    if (!playlistId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let pl = await playlistsDb.getPlaylistById(playlistId);

    // Auto-fetch songs by playlist title if tracks are empty or few
    if (pl && (!pl.tracks || pl.tracks.length === 0)) {
      try {
        setIsPopulating(true);
        const fetched = await musicApi.getSongsForPlaylistName(pl.title, 35);
        if (fetched.length > 0) {
          pl = {
            ...pl,
            tracks: fetched,
            songCount: fetched.length,
            coverUrl: isValidImage(pl.coverUrl) && pl.coverUrl !== DEFAULT_PLAYLIST_COVER
              ? pl.coverUrl
              : (fetched[0]?.coverUrl || DEFAULT_PLAYLIST_COVER)
          };
          await playlistsDb.updatePlaylistTracks(pl.id, fetched);
        }
      } catch (err) {
        console.warn('Auto-fill error:', err);
      } finally {
        setIsPopulating(false);
      }
    }

    setPlaylist(pl);
    setLoading(false);
  };

  const handleAutoFillSongs = async () => {
    if (!playlist) return;
    setIsPopulating(true);
    try {
      const fetched = await musicApi.getSongsForPlaylistName(playlist.title, 40);
      if (fetched.length > 0) {
        const updated = {
          ...playlist,
          tracks: fetched,
          songCount: fetched.length,
          coverUrl: isValidImage(playlist.coverUrl) && playlist.coverUrl !== DEFAULT_PLAYLIST_COVER
            ? playlist.coverUrl
            : (fetched[0]?.coverUrl || DEFAULT_PLAYLIST_COVER)
        };
        await playlistsDb.updatePlaylistTracks(playlist.id, fetched);
        setPlaylist(updated);
      }
    } catch (e) {
      console.warn('Failed to auto fill songs', e);
    } finally {
      setIsPopulating(false);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;
    const updated = await playlistsDb.removeSongFromPlaylist(playlist.id, songId);
    if (updated) {
      setPlaylist({ ...updated });
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    Alert.alert('Delete Playlist', `Are you sure you want to delete "${playlist.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await playlistsDb.deletePlaylist(playlist.id);
          router.replace('/playlists');
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loading message="Loading playlist..." />
      </SafeAreaView>
    );
  }

  if (!playlist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="musical-notes-outline" size={64} color="#a7a7a7" style={{ marginBottom: 16 }} />
          <Text style={styles.notFoundTitle}>Playlist Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            The playlist you are looking for does not exist or may have been deleted.
          </Text>
          <TouchableOpacity
            style={styles.returnBtn}
            onPress={() => router.push('/playlists')}
            activeOpacity={0.8}
          >
            <Text style={styles.returnBtnText}>View All Playlists</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const coverUri = getPlaylistCover(playlist);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, isMobile && { paddingBottom: 170 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back navigation */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        {/* Hero Header */}
        <LinearGradient
          colors={['#1e3a5f', '#142033', '#121212']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.heroBox,
            isMobile && { flexDirection: 'column', alignItems: 'center', padding: 16, gap: 16 }
          ]}
        >
          <Image source={{ uri: coverUri }} style={[styles.heroImage, isMobile && { width: 150, height: 150 }]} />

          <View style={[styles.heroMeta, isMobile && { alignItems: 'center', minWidth: '100%' }]}>
            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>PLAYLIST</Text>
              </View>
              {playlist.isCustom ? (
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>CUSTOM</Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.heroTitle, isMobile && { fontSize: 24, textAlign: 'center' }]}>{playlist.title}</Text>

            {playlist.description ? (
              <Text style={[styles.heroDescription, isMobile && { textAlign: 'center' }]}>{playlist.description}</Text>
            ) : null}

            <Text style={[styles.heroMetaText, isMobile && { textAlign: 'center' }]}>
              {playlist.isCustom ? 'Created by You' : 'Curated Mix'} • {playlist.tracks.length} songs
            </Text>
          </View>
        </LinearGradient>

        {/* Action Controls Bar */}
        <View style={[styles.actionsBar, isMobile && { paddingHorizontal: 16, flexWrap: 'wrap', gap: 12 }]}>
          {playlist.tracks.length > 0 && (
            <TouchableOpacity
              style={styles.bigGreenPlayBtn}
              onPress={handlePlayAll}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={26} color="#000000" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.autoFillBtn}
            onPress={handleAutoFillSongs}
            activeOpacity={0.8}
            disabled={isPopulating}
          >
            <Ionicons name={isPopulating ? 'hourglass-outline' : 'sparkles'} size={16} color="#38bdf8" />
            <Text style={styles.autoFillBtnText}>
              {isPopulating ? 'Loading songs...' : 'Find Songs by Name'}
            </Text>
          </TouchableOpacity>

          {playlist.isCustom && (
            <TouchableOpacity
              style={styles.deleteActionBtn}
              onPress={handleDeletePlaylist}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#a7a7a7" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tracklist Section */}
        <View style={[styles.section, isMobile && { paddingHorizontal: 16 }]}>
          <Text style={styles.sectionTitle}>Tracks ({playlist.tracks.length})</Text>

          {playlist.tracks.length === 0 ? (
            <View style={styles.emptyTracksBox}>
              <Ionicons name="sparkles-outline" size={48} color="#38bdf8" />
              <Text style={styles.emptyTracksTitle}>Loading songs for "{playlist.title}"...</Text>
              <Text style={styles.emptyTracksSubtitle}>
                Finding songs matching your playlist title from our music library.
              </Text>
              <TouchableOpacity
                style={styles.findTracksBtn}
                onPress={handleAutoFillSongs}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color="#000000" style={{ marginRight: 6 }} />
                <Text style={styles.findTracksText}>Load Songs Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            playlist.tracks.map((song, idx) => (
              <View key={song.id} style={styles.trackRowWrapper}>
                <View style={{ flex: 1 }}>
                  <SongCard
                    song={song}
                    playlist={playlist.tracks}
                    variant="list"
                    index={idx}
                  />
                </View>
                {playlist.isCustom && (
                  <TouchableOpacity
                    style={styles.removeSongBtn}
                    onPress={() => handleRemoveSong(song.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={18} color="#71717a" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  heroBox: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'flex-end',
    gap: 24,
    flexWrap: 'wrap'
  },
  heroImage: {
    width: 190,
    height: 190,
    borderRadius: 8,
    backgroundColor: '#282828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8
  },
  heroMeta: {
    flex: 1,
    minWidth: 260
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  customBadge: {
    backgroundColor: 'rgba(30, 215, 96, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4
  },
  customBadgeText: {
    color: '#1ed760',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  heroDescription: {
    fontSize: 14,
    color: '#a7a7a7',
    lineHeight: 20,
    marginBottom: 10
  },
  heroMetaText: {
    fontSize: 13,
    color: '#d1d5db',
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
    shadowColor: '#1ed760',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6
  },
  deleteActionBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#1f1f1f'
  },
  autoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)'
  },
  autoFillBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700'
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16
  },
  trackRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  removeSongBtn: {
    padding: 8,
    marginLeft: 4
  },
  emptyTracksBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#181818',
    borderRadius: 12,
    marginTop: 12
  },
  emptyTracksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 6
  },
  emptyTracksSubtitle: {
    fontSize: 13,
    color: '#a7a7a7',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 18,
    marginBottom: 20
  },
  findTracksBtn: {
    backgroundColor: '#1ed760',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24
  },
  findTracksText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000'
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: '#a7a7a7',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 380,
    lineHeight: 20
  },
  returnBtn: {
    backgroundColor: '#1ed760',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000'
  }
});
