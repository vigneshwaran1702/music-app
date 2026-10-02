import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song, PlaybackMode } from '../types/music';
import { historyDb } from '../database/history';
import { shuffleArray } from '../utils/filterMusic';
import { jioSaavnApi } from '../client-api/jiosaavn';
import { CURATED_FEATURED_SONGS } from '../client-api/sources';

interface PlayerContextType {
  currentTrack: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  volume: number;
  playbackMode: PlaybackMode;
  isRightPanelOpen: boolean;
  isQueueOpen: boolean;
  isLyricsOpen: boolean;
  playTrack: (track: Song, newQueue?: Song[]) => Promise<void>;
  playNext: (track: Song) => void;
  togglePlayPause: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  forward: (seconds?: number) => Promise<void>;
  backward: (seconds?: number) => Promise<void>;
  setVolumeLevel: (level: number) => Promise<void>;
  togglePlaybackMode: () => void;
  addToQueue: (track: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  toggleRightPanel: () => void;
  toggleQueue: () => void;
  toggleLyrics: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1.0);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('normal');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const currentTrackRef = useRef<Song | null>(null);
  currentTrackRef.current = currentTrack;

  // Initialize audio mode
  useEffect(() => {
    async function configureAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true
        });
      } catch (e) {
        console.warn('Audio mode config error:', e);
      }
    }
    configureAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Web keyboard controls
  useEffect(() => {
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable
        ) {
          return;
        }

        if (e.code === 'Space') {
          e.preventDefault();
          togglePlayPause();
        } else if (e.code === 'ArrowRight' && e.shiftKey) {
          e.preventDefault();
          nextTrack();
        } else if (e.code === 'ArrowLeft' && e.shiftKey) {
          e.preventDefault();
          previousTrack();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          seekTo(position + 5);
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          seekTo(Math.max(0, position - 5));
        } else if (e.code === 'ArrowUp') {
          e.preventDefault();
          setVolumeLevel(Math.min(1, volume + 0.05));
        } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          setVolumeLevel(Math.max(0, volume - 0.05));
        } else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          setVolumeLevel(volume > 0 ? 0 : 0.8);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [position, volume, isPlaying, currentTrack]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.warn(`[Player] Playback error: ${status.error}`);
        setIsBuffering(false);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setIsBuffering(status.isBuffering);

    if (!isSeekingRef.current && status.positionMillis !== undefined) {
      setPosition(status.positionMillis / 1000);
    }
    if (status.durationMillis !== undefined && status.durationMillis > 0) {
      setDuration(status.durationMillis / 1000);
    }

    // Auto-advance when track finishes
    if (status.didJustFinish && !status.isLooping) {
      handleTrackEnd(status);
    }
  };

  const handleTrackEnd = async (status?: any) => {
    if (playbackMode === 'repeat-one') {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
      return;
    }

    const curPos = (status?.positionMillis ?? position * 1000) / 1000;
    const curDur = (status?.durationMillis ?? duration * 1000) / 1000;

    // A track has only truly finished if current position is within 4 seconds of duration
    // OR has reached at least 95% of the total track length.
    // If it stopped earlier, it was a network stall, buffer pause, or preview clip!
    const isActuallyAtEnd = curDur > 10 && (curPos >= curDur - 4 || curPos >= curDur * 0.95);

    if (!isActuallyAtEnd) {
      console.warn(
        `[Player] Premature pause/stall detected at ${curPos.toFixed(1)}s / ${curDur.toFixed(1)}s. Preventing unexpected skip!`
      );

      // Attempt seamless resume if playback was active
      if (soundRef.current && isPlaying) {
        try {
          await soundRef.current.playAsync();
          return;
        } catch {
          // If resume fails, continue with recovery
        }
      }

      // If audio finished too early (< 35s) while song duration was supposed to be > 60s,
      // it was an unexpected cut. Seamlessly resolve full song!
      const cur = currentTrackRef.current;
      if (cur && (cur.duration || 0) > 60) {
        const full = await resolveFullSong(cur, true);
        if (full && full.audioUrl !== cur.audioUrl) {
          console.log('[Player] Preview finished, continuing with resolved full track...');
          await playTrack(full);
          return;
        }
      }
      return;
    }

    // Only advance when the song actually played to the end!
    nextTrack();
  };

  /**
   * Helper: Resolve full-length 320kbps audio whenever a track
   * has a preview clip, broken URL, or missing stream.
   */
  const resolveFullSong = async (track: Song, force = false): Promise<Song> => {
    const isPreview =
      force ||
      !track.audioUrl ||
      track.audioUrl.includes('apple.com') ||
      track.audioUrl.includes('AudioPreview') ||
      track.audioUrl.includes('mzstatic') ||
      track.audioUrl.includes('youtube.com/watch') ||
      track.id.startsWith('itunes_') ||
      (track.duration !== undefined && track.duration <= 35);

    if (!isPreview) {
      return track;
    }

    const cleanTitle = (track.title || '')
      .replace(/\(From.*?\)/gi, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(feat.*?\)/gi, '')
      .replace(/\(Tamil.*?\)/gi, '')
      .trim();

    const normTrackTitle = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Step 1: Check curated full-length library (instant match)
    if (normTrackTitle) {
      const foundCurated = CURATED_FEATURED_SONGS.find((s) => {
        const sNorm = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return sNorm.includes(normTrackTitle) || normTrackTitle.includes(sNorm);
      });
      if (foundCurated && foundCurated.audioUrl) {
        return {
          ...track,
          audioUrl: foundCurated.audioUrl,
          duration: foundCurated.duration || track.duration,
          coverUrl: track.coverUrl || foundCurated.coverUrl,
          bitrate: 320
        };
      }
    }

    // Step 2: Search JioSaavn for full 320kbps track
    try {
      const cleanArtist = (track.artistName || '')
        .split(/[,&]/)[0]
        .replace(/Music|Official|Channel/gi, '')
        .trim();

      const searchQuery = `${cleanTitle} ${cleanArtist}`.trim();
      const timeoutPromise = new Promise<Song[]>((res) => setTimeout(() => res([]), 5000));
      const saavnPromise = jioSaavnApi.searchSongs(searchQuery, 3);
      let matches = await Promise.race([saavnPromise, timeoutPromise]);

      if (!matches || matches.length === 0) {
        matches = await Promise.race([jioSaavnApi.searchSongs(cleanTitle, 3), timeoutPromise]);
      }

      if (matches && matches.length > 0 && matches[0].audioUrl) {
        return {
          ...track,
          audioUrl: matches[0].audioUrl,
          duration: matches[0].duration || track.duration,
          coverUrl: track.coverUrl || matches[0].coverUrl,
          bitrate: 320
        };
      }
    } catch (e) {
      console.warn('[Player] Full song resolution error:', e);
    }

    // Step 3: Reliable fallback: find matching curated song by language or genre
    const langFallback =
      CURATED_FEATURED_SONGS.find((s) => s.language === track.language && s.audioUrl) ||
      CURATED_FEATURED_SONGS[0];

    return {
      ...track,
      audioUrl: langFallback.audioUrl,
      duration: langFallback.duration || 210,
      coverUrl: track.coverUrl || langFallback.coverUrl,
      bitrate: 320
    };
  };

  /**
   * Safe Audio Loader with fallback bitrates
   */
  const loadAndPlaySound = async (uri: string): Promise<Audio.Sound | null> => {
    const urlsToTry = [uri];

    // If 320kbps URL, fallback to 160kbps and 96kbps if 320 is unavailable
    if (uri.includes('_320.mp4')) {
      urlsToTry.push(uri.replace('_320.mp4', '_160.mp4'));
      urlsToTry.push(uri.replace('_320.mp4', '_96.mp4'));
    } else if (uri.includes('_160.mp4')) {
      urlsToTry.push(uri.replace('_160.mp4', '_96.mp4'));
    }

    for (const testUri of urlsToTry) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: testUri },
          {
            shouldPlay: true,
            volume: volume,
            isLooping: playbackMode === 'repeat-one'
          },
          onPlaybackStatusUpdate
        );
        return sound;
      } catch (err) {
        console.warn(`[Player] Failed to load ${testUri}, trying fallback...`, err);
      }
    }

    return null;
  };

  const playTrack = async (track: Song, newQueue?: Song[]) => {
    try {
      if (newQueue && newQueue.length > 0) {
        setOriginalQueue(newQueue);
        if (playbackMode === 'shuffle') {
          const shuffled = shuffleArray(newQueue.filter((s) => s.id !== track.id));
          setQueue([track, ...shuffled]);
        } else {
          setQueue(newQueue);
        }
      } else if (!queue.some((s) => s.id === track.id)) {
        setQueue((prev) => [track, ...prev]);
      }

      setCurrentTrack(track);
      setPosition(0);
      setDuration(track.duration || 0);
      setIsBuffering(true);

      // Save to history
      historyDb.addToHistory(track);

      // Unload previous sound cleanly
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {
          // ignore
        }
        soundRef.current = null;
      }

      // Guarantee full-length audio stream
      const resolvedTrack = await resolveFullSong(track);
      setCurrentTrack(resolvedTrack);
      setDuration(resolvedTrack.duration || 210);

      let audioUri = resolvedTrack.localPath || resolvedTrack.audioUrl;

      // Fallback to verified curated track if still empty
      if (!audioUri) {
        const fallback = CURATED_FEATURED_SONGS[0];
        audioUri = fallback.audioUrl;
      }

      const sound = await loadAndPlaySound(audioUri);

      if (!sound) {
        // Last resort fallback: try matching curated song so user never experiences silence
        console.warn('[Player] All stream variants failed, falling back to curated backup track...');
        const backupTrack =
          CURATED_FEATURED_SONGS.find((s) => s.language === resolvedTrack.language && s.audioUrl) ||
          CURATED_FEATURED_SONGS[0];
        const backupSound = await loadAndPlaySound(backupTrack.audioUrl);
        if (backupSound) {
          soundRef.current = backupSound;
          setCurrentTrack(backupTrack);
          setIsPlaying(true);
          setIsBuffering(false);
          return;
        }

        setIsBuffering(false);
        setIsPlaying(false);
        return;
      }

      soundRef.current = sound;
      setIsPlaying(true);
      setIsBuffering(false);
    } catch (error) {
      console.error('[Player] Error starting playback:', error);
      setIsBuffering(false);
      setIsPlaying(false);
    }
  };

  const playNext = (track: Song) => {
    if (!currentTrack) {
      playTrack(track);
      return;
    }
    const currentIndex = queue.findIndex((s) => s.id === currentTrack.id);
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, track);
    setQueue(newQueue);
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) {
      if (currentTrack) {
        await playTrack(currentTrack);
      }
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      } else {
        // If sound was unloaded or not ready, re-initialize playback
        if (currentTrack) {
          await playTrack(currentTrack);
        }
      }
    } catch (error) {
      console.warn('[Player] togglePlayPause error, attempting restart:', error);
      if (currentTrack) {
        await playTrack(currentTrack);
      }
    }
  };

  const nextTrack = async () => {
    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex((s) => s.id === currentTrack.id);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (playbackMode === 'repeat-all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextSong = queue[nextIndex];
    if (nextSong) {
      await playTrack(nextSong);
    }
  };

  const previousTrack = async () => {
    if (position > 3 && soundRef.current) {
      await seekTo(0);
      return;
    }

    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex((s) => s.id === currentTrack.id);
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevSong = queue[prevIndex];
    if (prevSong) {
      await playTrack(prevSong);
    }
  };

  const seekTo = async (seconds: number) => {
    if (!soundRef.current) {
      setPosition(seconds);
      return;
    }
    try {
      isSeekingRef.current = true;
      const totalDur = duration || (currentTrack?.duration || 300);
      const targetSec = Math.max(0, Math.min(totalDur, seconds));
      setPosition(targetSec);
      await soundRef.current.setPositionAsync(Math.floor(targetSec * 1000));
    } catch (error) {
      console.warn('[Player] seek error:', error);
    } finally {
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 350);
    }
  };

  const forward = async (seconds = 10) => {
    const totalDur = duration || (currentTrack?.duration || 300);
    const target = Math.min(totalDur, position + seconds);
    await seekTo(target);
  };

  const backward = async (seconds = 10) => {
    const target = Math.max(0, position - seconds);
    await seekTo(target);
  };

  const setVolumeLevel = async (level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setVolume(clamped);
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(clamped);
    }
  };

  const togglePlaybackMode = () => {
    const modes: PlaybackMode[] = ['normal', 'repeat-all', 'repeat-one', 'shuffle'];
    const nextMode = modes[(modes.indexOf(playbackMode) + 1) % modes.length];
    setPlaybackMode(nextMode);

    if (nextMode === 'repeat-one' && soundRef.current) {
      soundRef.current.setIsLoopingAsync(true);
    } else if (soundRef.current) {
      soundRef.current.setIsLoopingAsync(false);
    }

    if (nextMode === 'shuffle' && currentTrack) {
      const rest = originalQueue.filter((s) => s.id !== currentTrack.id);
      setQueue([currentTrack, ...shuffleArray(rest)]);
    } else if (nextMode === 'normal' || nextMode === 'repeat-all') {
      setQueue(originalQueue.length > 0 ? originalQueue : queue);
    }
  };

  const addToQueue = (track: Song) => {
    setQueue((prev) => [...prev, track]);
    setOriginalQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    setOriginalQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= queue.length || toIndex >= queue.length) return;
    const copy = [...queue];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    setQueue(copy);
  };

  const clearQueue = () => {
    setQueue(currentTrack ? [currentTrack] : []);
    setOriginalQueue(currentTrack ? [currentTrack] : []);
  };

  const toggleRightPanel = () => setIsRightPanelOpen((prev) => !prev);
  const toggleQueue = () => setIsQueueOpen((prev) => !prev);
  const toggleLyrics = () => setIsLyricsOpen((prev) => !prev);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        isBuffering,
        position,
        duration,
        volume,
        playbackMode,
        isRightPanelOpen,
        isQueueOpen,
        isLyricsOpen,
        playTrack,
        playNext,
        togglePlayPause,
        nextTrack,
        previousTrack,
        seekTo,
        forward,
        backward,
        setVolumeLevel,
        togglePlaybackMode,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        toggleRightPanel,
        toggleQueue,
        toggleLyrics
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};
