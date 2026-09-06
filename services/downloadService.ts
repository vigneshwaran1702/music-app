import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Song } from '../types/music';
import { downloadsDb, DownloadedRecord } from '../database/downloads';

export const downloadService = {
  async downloadTrack(song: Song, onProgress?: (progress: number) => void): Promise<DownloadedRecord | null> {
    try {
      if (Platform.OS === 'web') {
        // Web mock caching / local storage representation
        const record: DownloadedRecord = {
          song: { ...song, isDownloaded: true, localPath: song.audioUrl },
          downloadedAt: new Date().toISOString(),
          fileSize: 1024 * 1024 * 3.5, // ~3.5MB estimated
          localUri: song.audioUrl
        };
        await downloadsDb.saveDownload(record);
        if (onProgress) onProgress(1.0);
        return record;
      }

      // Native iOS / Android File System
      const dir = `${FileSystem.documentDirectory}tracks/`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      const fileUri = `${dir}${song.id}.mp3`;
      const downloadResumable = FileSystem.createDownloadResumable(
        song.audioUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) onProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result || !result.uri) throw new Error('Download failed');

      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      const record: DownloadedRecord = {
        song: {
          ...song,
          isDownloaded: true,
          localPath: result.uri
        },
        downloadedAt: new Date().toISOString(),
        fileSize: (fileInfo as any).size || 3500000,
        localUri: result.uri
      };

      await downloadsDb.saveDownload(record);
      return record;
    } catch (error) {
      console.error('[DownloadService] Failed to download song:', error);
      return null;
    }
  },

  async deleteDownloadedTrack(songId: string): Promise<boolean> {
    try {
      const removed = await downloadsDb.removeDownload(songId);
      if (removed && Platform.OS !== 'web' && removed.localUri) {
        const fileInfo = await FileSystem.getInfoAsync(removed.localUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(removed.localUri, { idempotent: true });
        }
      }
      return true;
    } catch (error) {
      console.error('[DownloadService] Failed to delete downloaded track:', error);
      return false;
    }
  },

  async isSongDownloaded(songId: string): Promise<boolean> {
    return await downloadsDb.isDownloaded(songId);
  }
};
