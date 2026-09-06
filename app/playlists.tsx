import React, { useState } from 'react';
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
import { usePlaylists } from '../hooks/usePlaylists';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/SongCard';
import { Loading } from '../components/Loading';
import { Playlist } from '../types/playlist';
import { APP_CONFIG } from '../constants/config';

export default function PlaylistsScreen() {
  const { playlists, loading, createPlaylist, deletePlaylist } = usePlaylists();
  const { playTrack } = usePlayer();
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setActivePlaylist(null)}>
            <Ionicons name="arrow-back" size={24} color={APP_CONFIG.THEME.textPrimary} />
            <Text style={styles.backBtnText}>All Playlists</Text>
          </TouchableOpacity>

          <View style={styles.plHeader}>
            <Image source={{ uri: activePlaylist.coverUrl }} style={styles.plHeaderCover} />
            <Text style={styles.plHeaderTitle}>{activePlaylist.title}</Text>
            {activePlaylist.description ? (
              <Text style={styles.plHeaderDesc}>{activePlaylist.description}</Text>
            ) : null}
            <Text style={styles.plHeaderMeta}>{activePlaylist.tracks.length} Songs</Text>

            {activePlaylist.tracks.length > 0 && (
              <TouchableOpacity
                style={styles.playAllBtn}
                onPress={() => playTrack(activePlaylist.tracks[0], activePlaylist.tracks)}
              >
                <Ionicons name="play" size={18} color="#ffffff" />
                <Text style={styles.playAllText}>Play Playlist</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tracksWrap}>
            {activePlaylist.tracks.length === 0 ? (
              <Text style={styles.noTracks}>No songs added to this playlist yet.</Text>
            ) : (
              activePlaylist.tracks.map((s) => (
                <SongCard key={s.id} song={s} playlist={activePlaylist.tracks} variant="list" />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.headerTitle}>Your Playlists</Text>
            <Text style={styles.headerSubtitle}>Create custom music mixes and playlists.</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <Loading message="Loading playlists..." />
        ) : playlists.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="musical-notes-outline" size={56} color={APP_CONFIG.THEME.textMuted} />
            <Text style={styles.emptyTitle}>No Playlists Yet</Text>
            <Text style={styles.emptySub}>Tap the + button to create your first custom playlist.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {playlists.map((pl) => (
              <TouchableOpacity
                key={pl.id}
                style={styles.playlistCard}
                onPress={() => setActivePlaylist(pl)}
              >
                <Image source={{ uri: pl.coverUrl }} style={styles.cardCover} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{pl.title}</Text>
                  <Text style={styles.cardMeta}>{pl.tracks.length} Songs</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    deletePlaylist(pl.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={APP_CONFIG.THEME.textMuted} />
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
              placeholderTextColor={APP_CONFIG.THEME.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            <TextInput
              style={[styles.input, { height: 70 }]}
              placeholder="Description (optional)"
              placeholderTextColor={APP_CONFIG.THEME.textMuted}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_CONFIG.THEME.background
  },
  content: {
    padding: 20,
    paddingBottom: 110
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary
  },
  headerSubtitle: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 2
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginTop: 14
  },
  emptySub: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textMuted,
    textAlign: 'center',
    marginTop: 6
  },
  list: {
    gap: 12
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.THEME.cardBackground,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_CONFIG.THEME.border
  },
  cardCover: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1b1e30'
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  cardMeta: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textMuted,
    marginTop: 4
  },
  deleteBtn: {
    padding: 8
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24
  },
  modalCard: {
    backgroundColor: '#151726',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#292f4c'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 16
  },
  input: {
    backgroundColor: '#1d2133',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    marginBottom: 12,
    fontSize: 15
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
    color: APP_CONFIG.THEME.textSecondary,
    fontWeight: '600'
  },
  createBtn: {
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  createText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  backBtnText: {
    color: APP_CONFIG.THEME.textPrimary,
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 6
  },
  plHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  plHeaderCover: {
    width: 140,
    height: 140,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#1c1f30'
  },
  plHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary
  },
  plHeaderDesc: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  },
  plHeaderMeta: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted,
    marginTop: 4
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14
  },
  playAllText: {
    color: '#ffffff',
    fontWeight: '700',
    marginLeft: 6
  },
  tracksWrap: {
    marginTop: 8
  },
  noTracks: {
    fontSize: 14,
    color: APP_CONFIG.THEME.textMuted,
    textAlign: 'center',
    marginTop: 20
  }
});
