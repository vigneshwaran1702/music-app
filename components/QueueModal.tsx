import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../hooks/usePlayer';
import { APP_CONFIG } from '../constants/config';
import { formatDuration } from '../utils/formatDuration';

export const QueueModal: React.FC = () => {
  const {
    isQueueOpen,
    toggleQueue,
    currentTrack,
    queue,
    playTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue
  } = usePlayer();

  if (!isQueueOpen) return null;

  const currentIdx = currentTrack ? queue.findIndex((s) => s.id === currentTrack.id) : -1;
  const upNext = currentIdx >= 0 ? queue.slice(currentIdx + 1) : queue;

  return (
    <Modal
      visible={isQueueOpen}
      transparent
      animationType="fade"
      onRequestClose={toggleQueue}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="list" size={22} color={APP_CONFIG.THEME.accentPrimary} />
              <Text style={styles.title}>Play Queue</Text>
              <Text style={styles.countBadge}>({queue.length})</Text>
            </View>

            <View style={styles.headerActions}>
              {queue.length > 1 && (
                <TouchableOpacity style={styles.clearBtn} onPress={clearQueue}>
                  <Text style={styles.clearText}>Clear Queue</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={toggleQueue}>
                <Ionicons name="close" size={22} color={APP_CONFIG.THEME.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Now Playing */}
            {currentTrack && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>NOW PLAYING</Text>
                <View style={styles.nowPlayingCard}>
                  <Image source={{ uri: currentTrack.coverUrl }} style={styles.trackImg} />
                  <View style={styles.trackMeta}>
                    <Text numberOfLines={1} style={styles.trackTitleActive}>
                      {currentTrack.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.trackArtist}>
                      {currentTrack.artistName}
                    </Text>
                  </View>
                  <View style={styles.equalizerPill}>
                    <Ionicons name="volume-high" size={16} color={APP_CONFIG.THEME.accentPrimary} />
                  </View>
                </View>
              </View>
            )}

            {/* Next Up */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>NEXT UP ({upNext.length})</Text>

              {upNext.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="musical-notes-outline" size={32} color={APP_CONFIG.THEME.textMuted} />
                  <Text style={styles.emptyText}>No upcoming songs in queue.</Text>
                  <Text style={styles.emptySubtext}>Add songs by tapping the options menu on any track.</Text>
                </View>
              ) : (
                upNext.map((song, i) => {
                  const absoluteIndex = currentIdx + 1 + i;
                  return (
                    <View key={`${song.id}_${i}`} style={styles.queueRow}>
                      <TouchableOpacity
                        style={styles.queueRowMain}
                        onPress={() => playTrack(song, queue)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.queueIndex}>{i + 1}</Text>
                        <Image source={{ uri: song.coverUrl }} style={styles.smallCover} />
                        <View style={styles.trackMeta}>
                          <Text numberOfLines={1} style={styles.trackTitle}>
                            {song.title}
                          </Text>
                          <Text numberOfLines={1} style={styles.trackArtist}>
                            {song.artistName}
                          </Text>
                        </View>
                        <Text style={styles.durationText}>
                          {formatDuration(song.duration)}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.rowControls}>
                        {i > 0 && (
                          <TouchableOpacity
                            style={styles.reorderBtn}
                            onPress={() => reorderQueue(absoluteIndex, absoluteIndex - 1)}
                          >
                            <Ionicons name="chevron-up" size={16} color={APP_CONFIG.THEME.textMuted} />
                          </TouchableOpacity>
                        )}
                        {i < upNext.length - 1 && (
                          <TouchableOpacity
                            style={styles.reorderBtn}
                            onPress={() => reorderQueue(absoluteIndex, absoluteIndex + 1)}
                          >
                            <Ionicons name="chevron-down" size={16} color={APP_CONFIG.THEME.textMuted} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => removeFromQueue(absoluteIndex)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '80%',
    backgroundColor: '#121422',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242a42',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1d2238'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  countBadge: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textMuted
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)'
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444'
  },
  closeBtn: {
    padding: 4
  },
  scroll: {
    padding: 20
  },
  section: {
    marginBottom: 20
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10
  },
  nowPlayingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 14,
    padding: 12,
    gap: 12
  },
  trackImg: {
    width: 48,
    height: 48,
    borderRadius: 8
  },
  trackMeta: {
    flex: 1
  },
  trackTitleActive: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_CONFIG.THEME.accentPrimary
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary
  },
  trackArtist: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 2
  },
  equalizerPill: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)'
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#16192a'
  },
  queueRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  queueIndex: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted,
    width: 18,
    textAlign: 'center'
  },
  smallCover: {
    width: 38,
    height: 38,
    borderRadius: 6
  },
  durationText: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted,
    marginRight: 6
  },
  rowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  reorderBtn: {
    padding: 4
  },
  removeBtn: {
    padding: 6
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary
  },
  emptySubtext: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted,
    textAlign: 'center'
  }
});
