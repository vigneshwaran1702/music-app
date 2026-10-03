import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlaylists } from '../hooks/usePlaylists';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/SongCard';
import { Loading } from '../components/Loading';
import { SpotifyImportModal } from '../components/SpotifyImportModal';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useResponsive } from '../hooks/useResponsive';
import { Playlist } from '../types/playlist';
import { getPlaylistCover } from '../constants/artistImages';

export default function PlaylistsScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const params = useLocalSearchParams<{ id?: string; playlistId?: string }>();
  const { playlists, loading, createPlaylist, deletePlaylist, refresh } = usePlaylists();
  const { playTrack } = usePlayer();
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    const targetId = params.playlistId || params.id;
    if (targetId) {
      router.replace(`/playlist/${targetId}` as any);
    }
  }, [params.id, params.playlistId]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createPlaylist(title.trim(), desc.trim());
    setTitle('');
    setDesc('');
    setModalVisible(false);
  };

  if (activePlaylist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, isMobile && { paddingBottom: 170 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => setActivePlaylist(null)}>
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
            <Text style={styles.backBtnText}>All Playlists</Text>
          </TouchableOpacity>

          {/* Spotify Playlist Hero Header */}
          <LinearGradient
            colors={['#1e3a5f', '#121212']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.plHero,
              isMobile && { flexDirection: 'column', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 16 }
            ]}
          >
            <Image
              source={{ uri: getPlaylistCover(activePlaylist) }}
              style={[styles.plHeaderCover, isMobile && { width: 140, height: 140 }]}
            />
            <View style={[styles.plMetaCol, isMobile && { alignItems: 'center' }]}>
              <Text style={styles.plTypeLabel}>PLAYLIST</Text>
              <Text style={[styles.plHeaderTitle, isMobile && { fontSize: 24, textAlign: 'center' }]}>
                {activePlaylist.title}
              </Text>
              {activePlaylist.description ? (
                <Text style={[styles.plHeaderDesc, isMobile && { textAlign: 'center' }]}>{activePlaylist.description}</Text>
              ) : null}
              <Text style={[styles.plHeaderMeta, isMobile && { textAlign: 'center' }]}>
                Created by You • {activePlaylist.tracks.length} songs
              </Text>
            </View>
          </LinearGradient>

          {/* Action Bar */}
          {activePlaylist.tracks.length > 0 && (
            <View style={styles.plActionBar}>
              <TouchableOpacity
                style={styles.bigGreenPlayBtn}
                onPress={() => playTrack(activePlaylist.tracks[0], activePlaylist.tracks)}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={26} color="#000000" />
              </TouchableOpacity>
            </View>
          )}

          {/* Tracklist */}
          <View style={styles.tracksWrap}>
            {activePlaylist.tracks.length === 0 ? (
              <Text style={styles.noTracks}>No songs added to this playlist yet.</Text>
            ) : (
              activePlaylist.tracks.map((s, idx) => (
                <SongCard
                  key={s.id}
                  song={s}
                  playlist={activePlaylist.tracks}
                  variant="list"
                  index={idx}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const [filter, setFilter] = useState<'all' | 'languages' | 'artists' | 'curated' | 'custom'>('all');

  const isLanguagePl = (pl: Playlist) =>
    pl.id.startsWith('pl_lang_') ||
    pl.title.includes('🇮🇳') ||
    pl.title.includes('🇺🇸') ||
    pl.title.includes('🇰🇷') ||
    pl.title.includes('🇪🇸') ||
    pl.title.includes('🇯🇵');

  const isArtistPl = (pl: Playlist) =>
    !isLanguagePl(pl) &&
    (pl.id.startsWith('pl_artist_') ||
      [
        'pl_anirudh_hits',
        'pl_rahman_essentials',
        'pl_yuvan_hits',
        'pl_harris_hits',
        'pl_sid_sriram',
        'pl_arijit_hits',
        'pl_taylor_hits'
      ].includes(pl.id) ||
      pl.title.toLowerCase().startsWith('best of ') ||
      pl.title.toLowerCase().includes('rockstar anthems') ||
      pl.title.toLowerCase().includes('masterpieces') ||
      pl.title.toLowerCase().includes('vocal magic'));

  const languagePlaylistsCount = playlists.filter(isLanguagePl).length;
  const artistPlaylistsCount = playlists.filter(isArtistPl).length;

  const filteredPlaylists = playlists.filter((pl) => {
    if (filter === 'languages') return isLanguagePl(pl);
    if (filter === 'artists') return isArtistPl(pl);
    if (filter === 'curated') return !pl.isCustom && !isArtistPl(pl) && !isLanguagePl(pl);
    if (filter === 'custom') return pl.isCustom && !isArtistPl(pl) && !isLanguagePl(pl);
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, isMobile && { paddingBottom: 170 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topRow, isMobile && { paddingHorizontal: 16, paddingTop: 14, marginBottom: 14, flexWrap: 'wrap', gap: 12 }]}>
          <View>
            <Text style={[styles.headerTitle, isMobile && { fontSize: 24 }]}>Your Playlists</Text>
            <Text style={styles.headerSubtitle}>Separated language playlists, curated mixes & artist hits.</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: '#1db954', width: 'auto', paddingHorizontal: 12, borderRadius: 20, flexDirection: 'row', gap: 6 }]}
              onPress={() => setShowSpotifyModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="cloud-download-outline" size={17} color="#000000" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#000000' }}>{isMobile ? 'Import' : 'Import Playlist'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={[styles.filterPillsRow, isMobile && { paddingHorizontal: 16, gap: 6 }]}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterPillText, filter === 'all' && styles.filterPillTextActive]}>
              All ({playlists.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'languages' && styles.filterPillActive]}
            onPress={() => setFilter('languages')}
          >
            <Text style={[styles.filterPillText, filter === 'languages' && styles.filterPillTextActive]}>
              Languages 🌐 ({languagePlaylistsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'artists' && styles.filterPillActive]}
            onPress={() => setFilter('artists')}
          >
            <Text style={[styles.filterPillText, filter === 'artists' && styles.filterPillTextActive]}>
              Artists 🌟 ({artistPlaylistsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'curated' && styles.filterPillActive]}
            onPress={() => setFilter('curated')}
          >
            <Text style={[styles.filterPillText, filter === 'curated' && styles.filterPillTextActive]}>
              Curated Mixes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'custom' && styles.filterPillActive]}
            onPress={() => setFilter('custom')}
          >
            <Text style={[styles.filterPillText, filter === 'custom' && styles.filterPillTextActive]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Artist Playlist CTA Banner */}
        <TouchableOpacity
          style={[styles.artistBannerCTA, isMobile && { marginHorizontal: 16 }]}
          onPress={() => router.push('/artists')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#1e3a5f', '#142033']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.artistBannerContent}
          >
            <Ionicons name="sparkles" size={24} color="#38bdf8" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.artistBannerTitle}>Want more Artist Playlists?</Text>
              <Text style={styles.artistBannerSubtitle}>
                Browse top artists and tap "Save Best 20" to generate instant playlists.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a7a7a7" />
          </LinearGradient>
        </TouchableOpacity>

        {loading ? (
          <Loading message="Loading playlists..." />
        ) : filteredPlaylists.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="musical-notes-outline" size={56} color="#a7a7a7" />
            <Text style={styles.emptyTitle}>No Playlists Found</Text>
            <Text style={styles.emptySub}>
              {filter === 'artists'
                ? 'Visit any Artist profile and tap "Save Best 20 Playlist" to create one!'
                : 'Tap the + button to create your first custom playlist.'}
            </Text>
          </View>
        ) : (
          <View style={[styles.list, isMobile && { paddingHorizontal: 16 }]}>
            {filteredPlaylists.map((pl) => (
              <TouchableOpacity
                key={pl.id}
                style={styles.playlistCard}
                onPress={() => router.push(`/playlist/${pl.id}` as any)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: getPlaylistCover(pl) }} style={styles.cardCover} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{pl.title}</Text>
                  <Text style={styles.cardMeta}>
                    {isArtistPl(pl) ? 'Artist Playlist' : 'Playlist'} • {pl.tracks.length} songs
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    deletePlaylist(pl.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#a7a7a7" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Playlist name"
              placeholderTextColor="#71717a"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            <TextInput
              style={[styles.input, { height: 70 }]}
              placeholder="Description (optional)"
              placeholderTextColor="#71717a"
              value={desc}
              onChangeText={setDesc}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Spotify Import Modal */}
      <SpotifyImportModal
        visible={showSpotifyModal}
        onClose={() => setShowSpotifyModal(false)}
        onImportComplete={() => refresh()}
      />
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#a7a7a7',
    marginTop: 2
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap'
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#242424',
    borderWidth: 1,
    borderColor: '#333333'
  },
  filterPillActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a7a7a7'
  },
  filterPillTextActive: {
    color: '#000000'
  },
  artistBannerCTA: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)'
  },
  artistBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  artistBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2
  },
  artistBannerSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 14
  },
  emptySub: {
    fontSize: 14,
    color: '#a7a7a7',
    textAlign: 'center',
    marginTop: 6
  },
  list: {
    paddingHorizontal: 24,
    gap: 8
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    padding: 12,
    borderRadius: 8
  },
  cardCover: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: '#282828'
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff'
  },
  cardMeta: {
    fontSize: 12,
    color: '#a7a7a7',
    marginTop: 4
  },
  deleteBtn: {
    padding: 8
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  plHero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 20
  },
  plHeaderCover: {
    width: 160,
    height: 160,
    borderRadius: 6,
    backgroundColor: '#282828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12
  },
  plMetaCol: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  plTypeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  plHeaderTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 6
  },
  plHeaderDesc: {
    fontSize: 13,
    color: '#a7a7a7',
    marginBottom: 6
  },
  plHeaderMeta: {
    fontSize: 13,
    color: '#a7a7a7'
  },
  plActionBar: {
    paddingHorizontal: 24,
    paddingVertical: 16
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
  tracksWrap: {
    paddingHorizontal: 24
  },
  noTracks: {
    fontSize: 14,
    color: '#a7a7a7',
    textAlign: 'center',
    marginTop: 32
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 24
  },
  modalCard: {
    backgroundColor: '#282828',
    borderRadius: 12,
    padding: 24,
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16
  },
  input: {
    backgroundColor: '#3e3e3e',
    borderRadius: 6,
    padding: 12,
    color: '#ffffff',
    marginBottom: 14,
    fontSize: 14
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  cancelText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  createBtn: {
    backgroundColor: '#1ed760',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20
  },
  createText: {
    color: '#000000',
    fontWeight: '700'
  }
});
