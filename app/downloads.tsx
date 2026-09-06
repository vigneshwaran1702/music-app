import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDownloads } from '../hooks/useDownloads';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/SongCard';
import { Loading } from '../components/Loading';
import { APP_CONFIG } from '../constants/config';

export default function DownloadsScreen() {
  const { downloads, loading, totalSize, removeDownload } = useDownloads();
  const { playTrack } = usePlayer();

  const formattedMB = (totalSize / (1024 * 1024)).toFixed(1);
  const songs = downloads.map((d) => d.song);

  const handlePlayAll = () => {
    if (!songs.length) return;
    playTrack(songs[0], songs);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Storage Card */}
        <View style={styles.storageCard}>
          <View style={styles.storageInfo}>
            <Ionicons name="hardware-chip-outline" size={28} color={APP_CONFIG.THEME.accentCyan} />
            <View style={styles.storageMeta}>
              <Text style={styles.storageTitle}>Offline Storage</Text>
              <Text style={styles.storageSubtitle}>
                {downloads.length} tracks downloaded ({formattedMB} MB)
              </Text>
            </View>
          </View>

          {songs.length > 0 && (
            <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
              <Ionicons name="play" size={16} color="#ffffff" />
              <Text style={styles.playAllText}>Play Offline</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <Loading message="Checking offline tracks..." />
        ) : downloads.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cloud-offline-outline" size={64} color={APP_CONFIG.THEME.textMuted} />
            <Text style={styles.emptyTitle}>No Downloaded Songs</Text>
            <Text style={styles.emptySub}>
              Download songs for seamless offline listening without internet or mobile data.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.listHeader}>Downloaded Songs</Text>
            {downloads.map((item) => (
              <View key={item.song.id} style={styles.downloadRow}>
                <View style={styles.songWrapper}>
                  <SongCard song={item.song} playlist={songs} variant="list" showActions={false} />
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeDownload(item.song.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
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
    backgroundColor: APP_CONFIG.THEME.background
  },
  content: {
    padding: 20,
    paddingBottom: 110
  },
  storageCard: {
    backgroundColor: APP_CONFIG.THEME.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: APP_CONFIG.THEME.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  storageMeta: {
    marginLeft: 12
  },
  storageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary
  },
  storageSubtitle: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textSecondary,
    marginTop: 2
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.THEME.accentCyan,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  playAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 4
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 64
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginTop: 14
  },
  emptySub: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: '80%'
  },
  list: {
    marginTop: 4
  },
  listHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 12
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  songWrapper: {
    flex: 1
  },
  deleteBtn: {
    padding: 10,
    marginLeft: 4
  }
});
