import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../constants/config';
import { playlistsDb } from '../database/playlists';
import { Playlist } from '../types/playlist';

interface CreatePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (playlist: Playlist) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  visible,
  onClose,
  onCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const pl = await playlistsDb.createPlaylist(trimmed, description.trim());
      setTitle('');
      setDescription('');
      onCreated?.(pl);
      onClose();
    } catch (e) {
      console.warn('Error creating playlist:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="musical-notes" size={24} color={APP_CONFIG.THEME.accentPrimary} />
            </View>
            <Text style={styles.title}>Create Playlist</Text>
            <Text style={styles.subtitle}>Give your playlist a name and start adding tracks.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Playlist Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. My Tamil Favorites, Late Night Chill..."
              placeholderTextColor={APP_CONFIG.THEME.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add an optional description"
              placeholderTextColor={APP_CONFIG.THEME.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createBtn, !title.trim() && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={!title.trim() || submitting}
            >
              <Text style={styles.createText}>
                {submitting ? 'Creating...' : 'Create Playlist'}
              </Text>
            </TouchableOpacity>
          </View>
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
  dialog: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#141726',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#252a42',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary,
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: '#0c0e18',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#232840',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: APP_CONFIG.THEME.textPrimary,
    fontSize: 15
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1b1f33'
  },
  cancelText: {
    color: APP_CONFIG.THEME.textSecondary,
    fontWeight: '600',
    fontSize: 14
  },
  createBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: APP_CONFIG.THEME.accentPrimary
  },
  createBtnDisabled: {
    opacity: 0.4
  },
  createText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  }
});
