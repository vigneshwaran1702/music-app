import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../hooks/usePlayer';
import { usePlaylists } from '../hooks/usePlaylists';
import { FavoriteButton } from './FavoriteButton';
import { DownloadButton } from './DownloadButton';
import { formatDuration } from '../utils/formatDuration';
import { APP_CONFIG } from '../constants/config';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(width - 64, 320);

interface MusicPlayerProps {
  onClose?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ onClose }) => {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    playbackMode,
    queue,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    togglePlaybackMode,
    playTrack
  } = usePlayer();

  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists();

  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  if (!currentTrack) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="musical-notes-outline" size={64} color={APP_CONFIG.THEME.textMuted} />
        <Text style={styles.emptyTitle}>No Song Playing</Text>
        <Text style={styles.emptySubtitle}>Select a track from the feed or search to start listening.</Text>
      </View>
    );
  }

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  const handleSeekTouch = (e: any) => {
    const { locationX } = e.nativeEvent;
    const barWidth = width - 48;
    const ratio = Math.max(0, Math.min(1, locationX / barWidth));
    const targetSeconds = ratio * (duration || currentTrack.duration || 180);
    seekTo(targetSeconds);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (currentTrack) {
      await addSongToPlaylist(playlistId, currentTrack);
      setShowPlaylistModal(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (newPlaylistName.trim() && currentTrack) {
      const pl = await createPlaylist(newPlaylistName.trim());
      await addSongToPlaylist(pl.id, currentTrack);
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
      setShowPlaylistModal(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <Ionicons name="chevron-down" size={28} color={APP_CONFIG.THEME.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerSubtitle}>PLAYING FROM</Text>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {currentTrack.albumTitle || 'Trending Discovery'}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => setShowPlaylistModal(true)}>
          <Ionicons name="add-circle-outline" size={26} color={APP_CONFIG.THEME.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Main Content (Artwork OR Lyrics OR Queue) */}
      <ScrollView
        contentContainerStyle={styles.mainScroll}
        showsVerticalScrollIndicator={false}
      >
        {showLyrics ? (
          <View style={styles.lyricsContainer}>
            <Text style={styles.lyricsHeader}>Lyrics</Text>
            <Text style={styles.lyricsBody}>
              {currentTrack.lyrics ||
                "♪ [Instrumental / Royalty-Free Stream]\n\nFeel the melody pulse through the night.\nNo official lyrics registered for this track."}
            </Text>
          </View>
        ) : showQueue ? (
          <View style={styles.queueContainer}>
            <Text style={styles.queueHeader}>Up Next ({queue.length})</Text>
            {queue.map((item, idx) => {
              const isCurrentInQueue = item.id === currentTrack.id;
              return (
                <TouchableOpacity
                  key={`${item.id}_${idx}`}
                  style={[styles.queueItem, isCurrentInQueue && styles.queueItemActive]}
                  onPress={() => playTrack(item, queue)}
                >
                  <Image source={{ uri: item.coverUrl }} style={styles.queueThumb} />
                  <View style={styles.queueMeta}>
                    <Text numberOfLines={1} style={[styles.queueTitle, isCurrentInQueue && styles.queueTitleActive]}>
                      {item.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.queueArtist}>
                      {item.artistName}
                    </Text>
                  </View>
                  {isCurrentInQueue && (
                    <Ionicons name="volume-high" size={18} color={APP_CONFIG.THEME.accentPrimary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.artworkSection}>
            <View style={[styles.artworkWrapper, { width: ARTWORK_SIZE, height: ARTWORK_SIZE }]}>
              <Image source={{ uri: currentTrack.coverUrl }} style={styles.artwork} />
            </View>
          </View>
        )}

        {/* Track Title and Artist Row */}
        <View style={styles.trackInfoRow}>
          <View style={styles.trackTitleBox}>
            <Text numberOfLines={1} style={styles.trackTitle}>
              {currentTrack.title}
            </Text>
            <Text numberOfLines={1} style={styles.trackArtist}>
              {currentTrack.artistName}
            </Text>
          </View>
          <View style={styles.trackActionButtons}>
            <DownloadButton song={currentTrack} size={24} />
            <FavoriteButton song={currentTrack} size={26} />
          </View>
        </View>

        {/* Progress Bar & Timestamps */}
        <View style={styles.progressSection}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.progressBarTrack}
            onPress={handleSeekTouch}
          >
            <View style={[styles.progressBarFilled, { width: `${progressPercent}%` }]} />
            <View style={[styles.scrubberThumb, { left: `${Math.max(0, Math.min(98, progressPercent))}%` }]} />
          </TouchableOpacity>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(position)}</Text>
            <Text style={styles.timeText}>{formatDuration(duration || currentTrack.duration)}</Text>
          </View>
        </View>

        {/* Main Playback Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.auxControl}
            onPress={togglePlaybackMode}
          >
            <Ionicons
              name={
                playbackMode === 'shuffle'
                  ? 'shuffle'
                  : playbackMode === 'repeat-one'
                  ? 'repeat'
                  : playbackMode === 'repeat-all'
                  ? 'repeat'
                  : 'shuffle-outline'
              }
              size={22}
              color={playbackMode !== 'normal' ? APP_CONFIG.THEME.accentPrimary : APP_CONFIG.THEME.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={previousTrack}>
            <Ionicons name="play-skip-back" size={28} color={APP_CONFIG.THEME.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainPlayButton} onPress={togglePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={36}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={nextTrack}>
            <Ionicons name="play-skip-forward" size={28} color={APP_CONFIG.THEME.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.auxControl}
            onPress={() => {
              setShowLyrics((prev) => !prev);
              setShowQueue(false);
            }}
          >
            <Ionicons
              name="reader-outline"
              size={22}
              color={showLyrics ? APP_CONFIG.THEME.accentPrimary : APP_CONFIG.THEME.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Drawer Toggles */}
        <View style={styles.bottomToolBar}>
          <TouchableOpacity
            style={[styles.toolTab, showQueue && styles.toolTabActive]}
            onPress={() => {
              setShowQueue((prev) => !prev);
              setShowLyrics(false);
            }}
          >
            <Ionicons
              name="list"
              size={18}
              color={showQueue ? APP_CONFIG.THEME.accentPrimary : APP_CONFIG.THEME.textSecondary}
            />
            <Text style={[styles.toolTabText, showQueue && styles.toolTabTextActive]}>
              Queue ({queue.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolTab, showLyrics && styles.toolTabActive]}
            onPress={() => {
              setShowLyrics((prev) => !prev);
              setShowQueue(false);
            }}
          >
            <Ionicons
              name="mic-outline"
              size={18}
              color={showLyrics ? APP_CONFIG.THEME.accentPrimary : APP_CONFIG.THEME.textSecondary}
            />
            <Text style={[styles.toolTabText, showLyrics && styles.toolTabTextActive]}>
              Lyrics
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add To Playlist Modal */}
      <Modal visible={showPlaylistModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Playlist</Text>
              <TouchableOpacity onPress={() => setShowPlaylistModal(false)}>
                <Ionicons name="close" size={24} color={APP_CONFIG.THEME.textPrimary} />
              </TouchableOpacity>
            </View>

            {isCreatingPlaylist ? (
              <View style={styles.createBox}>
                <TextInput
                  style={styles.playlistInput}
                  placeholder="Playlist title..."
                  placeholderTextColor={APP_CONFIG.THEME.textMuted}
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  autoFocus
                />
                <View style={styles.createBtnRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setIsCreatingPlaylist(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateAndAdd}>
                    <Text style={styles.confirmBtnText}>Create & Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.newPlaylistRow}
                  onPress={() => setIsCreatingPlaylist(true)}
                >
                  <Ionicons name="add-circle" size={24} color={APP_CONFIG.THEME.accentPrimary} />
                  <Text style={styles.newPlaylistText}>Create New Playlist</Text>
                </TouchableOpacity>

                <ScrollView style={styles.playlistList}>
                  {playlists.length === 0 ? (
                    <Text style={styles.noPlaylistsText}>No custom playlists yet</Text>
                  ) : (
                    playlists.map((pl) => (
                      <TouchableOpacity
                        key={pl.id}
                        style={styles.playlistItem}
                        onPress={() => handleAddToPlaylist(pl.id)}
                      >
                        <Ionicons name="musical-note" size={20} color={APP_CONFIG.THEME.textSecondary} />
                        <View style={styles.playlistItemInfo}>
                          <Text style={styles.playlistItemTitle}>{pl.title}</Text>
                          <Text style={styles.playlistItemSubtitle}>{pl.songCount} songs</Text>
                        </View>
                        <Ionicons name="add" size={20} color={APP_CONFIG.THEME.accentPrimary} />
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.THEME.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8
  },
  headerButton: {
    padding: 6
  },
  headerTitleBox: {
    alignItems: 'center',
    maxWidth: '65%'
  },
  headerSubtitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textMuted
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 2
  },
  mainScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center'
  },
  artworkSection: {
    marginVertical: 24,
    alignItems: 'center'
  },
  artworkWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1b1e30',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10
  },
  artwork: {
    width: '100%',
    height: '100%'
  },
  lyricsContainer: {
    width: '100%',
    minHeight: 280,
    backgroundColor: '#141624',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#242840'
  },
  lyricsHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 12
  },
  lyricsBody: {
    fontSize: 15,
    lineHeight: 24,
    color: '#cbd5e1'
  },
  queueContainer: {
    width: '100%',
    maxHeight: 320,
    backgroundColor: '#141624',
    borderRadius: 20,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#242840'
  },
  queueHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 12
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4
  },
  queueItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)'
  },
  queueThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#202438'
  },
  queueMeta: {
    flex: 1,
    marginLeft: 10
  },
  queueTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary
  },
  queueTitleActive: {
    color: APP_CONFIG.THEME.accentPrimary
  },
  queueArtist: {
    fontSize: 11,
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 2
  },
  trackInfoRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  trackTitleBox: {
    flex: 1,
    marginRight: 16
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  trackArtist: {
    fontSize: 15,
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 4
  },
  trackActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  progressSection: {
    width: '100%',
    marginBottom: 24
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#22273d',
    borderRadius: 3,
    position: 'relative'
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    borderRadius: 3
  },
  scrubberThumb: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    marginLeft: -7
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  timeText: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 28
  },
  auxControl: {
    padding: 10
  },
  skipButton: {
    padding: 10
  },
  mainPlayButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: APP_CONFIG.THEME.accentPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8
  },
  bottomToolBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16
  },
  toolTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#161928',
    borderWidth: 1,
    borderColor: '#242a42'
  },
  toolTabActive: {
    borderColor: APP_CONFIG.THEME.accentPrimary
  },
  toolTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textSecondary,
    marginLeft: 6
  },
  toolTabTextActive: {
    color: APP_CONFIG.THEME.accentPrimary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginTop: 16
  },
  emptySubtitle: {
    fontSize: 14,
    color: APP_CONFIG.THEME.textSecondary,
    textAlign: 'center',
    marginTop: 8
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: '#151726',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderColor: '#272c44'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  newPlaylistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#22273d'
  },
  newPlaylistText: {
    fontSize: 15,
    fontWeight: '600',
    color: APP_CONFIG.THEME.accentPrimary,
    marginLeft: 12
  },
  playlistList: {
    marginTop: 10
  },
  noPlaylistsText: {
    fontSize: 14,
    color: APP_CONFIG.THEME.textMuted,
    textAlign: 'center',
    marginVertical: 20
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1d2133'
  },
  playlistItemInfo: {
    flex: 1,
    marginLeft: 12
  },
  playlistItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary
  },
  playlistItemSubtitle: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted,
    marginTop: 2
  },
  createBox: {
    paddingVertical: 12
  },
  playlistInput: {
    backgroundColor: '#1d2133',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 15
  },
  createBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  cancelBtnText: {
    color: APP_CONFIG.THEME.textSecondary,
    fontWeight: '600'
  },
  confirmBtn: {
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  confirmBtnText: {
    color: '#ffffff',
    fontWeight: '700'
  }
});
