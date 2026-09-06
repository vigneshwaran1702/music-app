import { Song } from '../types/music';
import { dbStorage } from './storage';

export interface DownloadedRecord {
  song: Song;
  downloadedAt: string;
  fileSize: number; // bytes
  localUri: string;
}

export const downloadsDb = {
  async getDownloads(): Promise<DownloadedRecord[]> {
    return await dbStorage.getItem<DownloadedRecord[]>(dbStorage.KEYS.DOWNLOADS, []);
  },

  async isDownloaded(songId: string): Promise<boolean> {
    const list = await this.getDownloads();
    return list.some((d) => d.song.id === songId);
  },

  async saveDownload(record: DownloadedRecord): Promise<void> {
    const list = await this.getDownloads();
    const filtered = list.filter((d) => d.song.id !== record.song.id);
    const updated = [record, ...filtered];
    await dbStorage.setItem(dbStorage.KEYS.DOWNLOADS, updated);
  },

  async removeDownload(songId: string): Promise<DownloadedRecord | null> {
    const list = await this.getDownloads();
    const target = list.find((d) => d.song.id === songId) || null;
    const filtered = list.filter((d) => d.song.id !== songId);
    await dbStorage.setItem(dbStorage.KEYS.DOWNLOADS, filtered);
    return target;
  },

  async getTotalDownloadSize(): Promise<number> {
    const list = await this.getDownloads();
    return list.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  }
};
