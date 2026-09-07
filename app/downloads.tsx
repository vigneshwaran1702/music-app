import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDownloads } from '../hooks/useDownloads';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/SongCard';
import { Loading } from '../components/Loading';

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
            <Ionicons name="cloud-done" size={28} color="#1ed760" />
            <View style={styles.storageMeta}>
              <Text style={styles.storageTitle}>Downloaded Music</Text>
              <Text style={styles.storageSubtitle}>
                {downloads.length} offline tracks • {formattedMB} MB saved
              </Text>
            </View>
          </View>

          {songs.length > 0 && (
            <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll} activeOpacity={0.85}>
              <Ionicons name="play" size={16} color="#000000" />
              <Text style={styles.playAllText}>Play Offline</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <Loading message="Checking offline tracks..." />
        ) : downloads.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cloud-offline-outline" size={64} color="#a7a7a7" />
            <Text style={styles.emptyTitle}>No Downloaded Songs</Text>
            <Text style={styles.emptySub}>
              Download songs for seamless offline listening without internet or mobile data.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.listHeader}>Offline Tracks ({downloads.length})</Text>
            {downloads.map((item, idx) => (
              <View key={item.song.id} style={styles.downloadRow}>
                <View style={styles.songWrapper}>
                  <SongCard
                    song={item.song}
                    playlist={songs}
                    variant="list"
                    showActions={false}
                    index={idx}
                  />
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeDownload(item.song.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#a7a7a7" />
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
    backgroundColor: '#121212'
  },
  content: {
    padding: 24,
    paddingBottom: 120
  },
  storageCard: {
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  storageMeta: {
    marginLeft: 14
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff'
  },
  storageSubtitle: {
    fontSize: 13,
    color: '#a7a7a7',
    marginTop: 2
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1ed760',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20
  },
  playAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 4
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 64
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 14
  },
  emptySub: {
    fontSize: 13,
    color: '#a7a7a7',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 340
  },
  list: {
    marginTop: 4
  },
  listHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
    letterSpacing: -0.3
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  songWrapper: {
    flex: 1
  },
  deleteBtn: {
    padding: 10,
    marginLeft: 4
  }
});
