import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spotifyApi, SpotifyUserProfile } from '../api/spotify';
import { playlistsDb } from '../database/playlists';
import { Song } from '../types/music';

interface SpotifyImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export const SpotifyImportModal: React.FC<SpotifyImportModalProps> = ({
  visible,
  onClose,
  onImportComplete
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [profile, setProfile] = useState<SpotifyUserProfile | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<string>('');
  const [playlistUrl, setPlaylistUrl] = useState('');

  useEffect(() => {
    if (visible) {
      checkExistingSession();
    }
  }, [visible]);

  const checkExistingSession = async () => {
    setLoading(true);
    const existingToken = await spotifyApi.getAccessToken();
    if (existingToken) {
      setTokenInput(existingToken);
      const userProf = await spotifyApi.getProfile();
      if (userProf) {
        setProfile(userProf);
        const pls = await spotifyApi.getUserPlaylists();
        setUserPlaylists(pls);
      }
    }
    setLoading(false);
  };

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) return;
    setLoading(true);
    await spotifyApi.setAccessToken(tokenInput.trim());
    const userProf = await spotifyApi.getProfile();
    if (userProf) {
      setProfile(userProf);
      const pls = await spotifyApi.getUserPlaylists();
      setUserPlaylists(pls);
    } else {
      Alert.alert('Invalid Token', 'Could not fetch Spotify profile. Please check your token.');
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    await spotifyApi.clearAccessToken();
    setProfile(null);
    setUserPlaylists([]);
    setTokenInput('');
  };

  const handleImportPlaylist = async (spotifyPlaylistId: string, customName?: string) => {
    setImportingId(spotifyPlaylistId);
    setImportProgress('Fetching playlist from Spotify...');

    try {
      const details = await spotifyApi.getPlaylistDetails(spotifyPlaylistId);
      if (!details || !details.tracks.length) {
        Alert.alert('Import Failed', 'Could not load tracks for this Spotify playlist.');
        setImportingId(null);
        setImportProgress('');
        return;
      }

      setImportProgress(`Matching ${details.tracks.length} tracks with 320kbps streams...`);
      const resolvedSongs: Song[] = [];

      for (let i = 0; i < details.tracks.length; i++) {
        const tr = details.tracks[i];
        setImportProgress(`Matching track ${i + 1}/${details.tracks.length}: ${tr.name}...`);
        const matched = await spotifyApi.resolvePlayableTrack(tr);
        if (matched) {
          resolvedSongs.push(matched);
        }
      }

      const newPl = await playlistsDb.createPlaylist(
        customName || details.name,
        `Imported from Spotify (${resolvedSongs.length} playable tracks)`
      );

      for (const song of resolvedSongs) {
        await playlistsDb.addSongToPlaylist(newPl.id, song);
      }

      Alert.alert(
        'Import Complete!',
        `Successfully imported "${details.name}" with ${resolvedSongs.length} streaming tracks.`
      );

      if (onImportComplete) onImportComplete();
      onClose();
    } catch (err) {
      console.warn('Import error:', err);
      Alert.alert('Error', 'An error occurred during import.');
    } finally {
      setImportingId(null);
      setImportProgress('');
    }
  };

  const handleImportByUrl = () => {
    if (!playlistUrl.trim()) return;
    // Extract Spotify playlist ID from URL
    const match = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
    const id = match ? match[1] : playlistUrl.trim();
    handleImportPlaylist(id);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient colors={['#1db954', '#121212']} style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.titleWithIcon}>
                <Ionicons name="musical-notes" size={24} color="#ffffff" />
                <Text style={styles.headerTitle}>Spotify Connect</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSubtitle}>
              Connect your Spotify account or import playlists with full 320kbps playback.
            </Text>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Connected Profile or Token Input */}
            {profile ? (
              <View style={styles.profileCard}>
                <Image
                  source={{
                    uri:
                      profile.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                  }}
                  style={styles.profileAvatar}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.display_name}</Text>
                  <Text style={styles.profileMeta}>
                    {profile.followers?.total || 0} Followers • Connected
                  </Text>
                </View>
                <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectBtn}>
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tokenSection}>
                <Text style={styles.sectionLabel}>Spotify Access Token</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.tokenInput}
                    value={tokenInput}
                    onChangeText={setTokenInput}
                    placeholder="Paste your Spotify OAuth access token..."
                    placeholderTextColor="#71717a"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveToken}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={styles.saveBtnText}>Connect</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quick URL Import */}
            <View style={styles.urlSection}>
              <Text style={styles.sectionLabel}>Import by Playlist Link</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.tokenInput}
                  value={playlistUrl}
                  onChangeText={setPlaylistUrl}
                  placeholder="https://open.spotify.com/playlist/..."
                  placeholderTextColor="#71717a"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.saveBtn, !tokenInput && styles.disabledBtn]}
                  onPress={handleImportByUrl}
                  disabled={Boolean(importingId)}
                >
                  <Text style={styles.saveBtnText}>Import</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Import Progress Bar */}
            {importingId && (
              <View style={styles.progressBox}>
                <ActivityIndicator size="small" color="#1db954" style={{ marginBottom: 8 }} />
                <Text style={styles.progressText}>{importProgress}</Text>
              </View>
            )}

            {/* User Playlists List */}
            {userPlaylists.length > 0 && (
              <View style={styles.playlistsListSection}>
                <Text style={styles.sectionLabel}>Your Spotify Playlists ({userPlaylists.length})</Text>
                {userPlaylists.map((pl) => (
                  <View key={pl.id} style={styles.playlistRow}>
                    <Image
                      source={{
                        uri:
                          pl.images?.[0]?.url ||
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
                      }}
                      style={styles.playlistThumb}
                    />
                    <View style={styles.playlistMeta}>
                      <Text numberOfLines={1} style={styles.playlistTitle}>
                        {pl.name}
                      </Text>
                      <Text style={styles.playlistTrackCount}>
                        {pl.tracks?.total || 0} tracks
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.importRowBtn}
                      onPress={() => handleImportPlaylist(pl.id, pl.name)}
                      disabled={Boolean(importingId)}
                    >
                      <Ionicons name="download-outline" size={16} color="#000000" />
                      <Text style={styles.importRowText}>Import</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '85%',
    backgroundColor: '#181818',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#282828'
  },
  header: {
    padding: 22,
    paddingBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff'
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18
  },
  closeBtn: {
    padding: 4
  },
  content: {
    padding: 20
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242424',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20
  },
  profileAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2
  },
  profileMeta: {
    fontSize: 12,
    color: '#1db954',
    fontWeight: '600'
  },
  disconnectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#333333'
  },
  disconnectText: {
    fontSize: 12,
    color: '#f87171',
    fontWeight: '600'
  },
  tokenSection: {
    marginBottom: 20
  },
  urlSection: {
    marginBottom: 20
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a7a7a7',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10
  },
  tokenInput: {
    flex: 1,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14
  },
  saveBtn: {
    backgroundColor: '#1db954',
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000'
  },
  disabledBtn: {
    opacity: 0.5
  },
  progressBox: {
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1db954',
    alignItems: 'center',
    marginBottom: 20
  },
  progressText: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center'
  },
  playlistsListSection: {
    marginTop: 10,
    paddingBottom: 20
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202020',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },
  playlistThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: 12
  },
  playlistMeta: {
    flex: 1
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3
  },
  playlistTrackCount: {
    fontSize: 12,
    color: '#a7a7a7'
  },
  importRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1db954',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4
  },
  importRowText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000'
  }
});
