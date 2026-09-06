import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../types/music';
import { useDownloads } from '../hooks/useDownloads';
import { APP_CONFIG } from '../constants/config';

interface DownloadButtonProps {
  song: Song;
  size?: number;
  color?: string;
  activeColor?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  song,
  size = 20,
  color = APP_CONFIG.THEME.textSecondary,
  activeColor = APP_CONFIG.THEME.accentCyan
}) => {
  const { isDownloaded, downloadSong, removeDownload, downloadingIds } = useDownloads();
  const downloaded = isDownloaded(song.id);
  const isDownloading = downloadingIds[song.id] !== undefined;

  const handlePress = async (e: any) => {
    e?.stopPropagation?.();
    if (isDownloading) return;
    if (downloaded) {
      await removeDownload(song.id);
    } else {
      await downloadSong(song);
    }
  };

  if (isDownloading) {
    return (
      <TouchableOpacity style={styles.button} disabled>
        <ActivityIndicator size="small" color={activeColor} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={handlePress}>
      <Ionicons
        name={downloaded ? 'cloud-done' : 'cloud-download-outline'}
        size={size}
        color={downloaded ? activeColor : color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
