import { useState, useEffect, useCallback } from 'react';
import { downloadsDb, DownloadedRecord } from '../database/downloads';
import { downloadService } from '../services/downloadService';
import { Song } from '../types/music';

export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadedRecord[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [totalSize, setTotalSize] = useState<number>(0);

  const loadDownloads = useCallback(async () => {
    setLoading(true);
    const list = await downloadsDb.getDownloads();
    const size = await downloadsDb.getTotalDownloadSize();
    setDownloads(list);
    setTotalSize(size);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const downloadSong = async (song: Song) => {
    setDownloadingIds((prev) => ({ ...prev, [song.id]: 0.05 }));
    const result = await downloadService.downloadTrack(song, (progress) => {
      setDownloadingIds((prev) => ({ ...prev, [song.id]: progress }));
    });
    setDownloadingIds((prev) => {
      const copy = { ...prev };
      delete copy[song.id];
      return copy;
    });
    await loadDownloads();
    return !!result;
  };

  const removeDownload = async (songId: string) => {
    const success = await downloadService.deleteDownloadedTrack(songId);
    await loadDownloads();
    return success;
  };

  const isDownloaded = (songId: string) => {
    return downloads.some((d) => d.song.id === songId);
  };

  return {
    downloads,
    downloadingIds,
    loading,
    totalSize,
    downloadSong,
    removeDownload,
    isDownloaded,
    refresh: loadDownloads
  };
}
