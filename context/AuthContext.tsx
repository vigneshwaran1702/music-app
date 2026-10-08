import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dbStorage } from '../database/storage';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  favoritePlatform: 'youtube' | 'instagram' | 'spotify' | 'google' | 'all';
  isGuest: boolean;
  loginTime: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  shuffleCounter: number;
  login: (name: string, avatar?: string, favoritePlatform?: 'youtube' | 'instagram' | 'spotify' | 'google' | 'all') => Promise<void>;
  logout: () => Promise<void>;
  triggerShuffle: () => void;
}

const USER_SESSION_KEY = '@aura_music_user_session';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shuffleCounter, setShuffleCounter] = useState<number>(1);

  // Load existing session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = await dbStorage.getItem<UserProfile | null>(USER_SESSION_KEY, null);
        if (stored) {
          setUser(stored);
        } else {
          // Default guest user
          const guestUser: UserProfile = {
            id: 'guest_user',
            name: 'Music Lover',
            avatar: DEFAULT_AVATARS[0],
            favoritePlatform: 'all',
            isGuest: true,
            loginTime: Date.now()
          };
          setUser(guestUser);
        }
      } catch (e) {
        console.warn('[AuthContext] Session init error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const triggerShuffle = useCallback(() => {
    setShuffleCounter((prev) => prev + 1);
  }, []);

  const login = useCallback(
    async (
      name: string,
      avatar?: string,
      favoritePlatform: 'youtube' | 'instagram' | 'spotify' | 'google' | 'all' = 'all'
    ) => {
      const chosenAvatar =
        avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: name.trim() || 'Music Lover',
        avatar: chosenAvatar,
        favoritePlatform,
        isGuest: false,
        loginTime: Date.now()
      };

      await dbStorage.setItem(USER_SESSION_KEY, newUser);
      setUser(newUser);
      // Automatically reshuffle home songs every time login occurs!
      triggerShuffle();
    },
    [triggerShuffle]
  );

  const logout = useCallback(async () => {
    await dbStorage.removeItem(USER_SESSION_KEY);
    const guestUser: UserProfile = {
      id: 'guest_user',
      name: 'Guest Listener',
      avatar: DEFAULT_AVATARS[0],
      favoritePlatform: 'all',
      isGuest: true,
      loginTime: Date.now()
    };
    setUser(guestUser);
    // Shuffle home feed on logout as well
    triggerShuffle();
  }, [triggerShuffle]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user && !user.isGuest),
        isLoading,
        shuffleCounter,
        login,
        logout,
        triggerShuffle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
