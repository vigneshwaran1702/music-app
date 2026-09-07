import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song, PlaybackMode, PlaybackStatus } from '../types/music';
import { historyDb } from '../database/history';
import { shuffleArray } from '../utils/filterMusic';

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
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Web keyboard controls
  useEffect(() => {
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if user is typing in an input
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
        console.warn(`[Player] Error playing audio: ${status.error}`);
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
      handleTrackEnd();
    }
  };

  const handleTrackEnd = async () => {
    if (playbackMode === 'repeat-one') {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
      return;
    }
    nextTrack();
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

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const audioUri = track.localPath || track.audioUrl;
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        {
          shouldPlay: true,
          volume: volume,
          isLooping: playbackMode === 'repeat-one'
        },
        onPlaybackStatusUpdate
      );

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
      }
    } catch (error) {
      console.warn('[Player] togglePlayPause error:', error);
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
    if (!soundRef.current) return;
    try {
      isSeekingRef.current = true;
      setPosition(seconds);
      await soundRef.current.setPositionAsync(Math.floor(seconds * 1000));
    } catch (error) {
      console.warn('[Player] seek error:', error);
    } finally {
      isSeekingRef.current = false;
    }
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
