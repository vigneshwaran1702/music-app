import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { APP_CONFIG } from '../constants/config';
import { playlistsDb } from '../database/playlists';
import { favoritesDb } from '../database/favorites';
import { Playlist } from '../types/playlist';
import { CreatePlaylistModal } from './CreatePlaylistModal';

interface SidebarProps {
  onNavigate?: () => void;
}

type LibraryFilter = 'all' | 'playlists' | 'artists';

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedCount, setLikedCount] = useState<number>(0);
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadSidebarData();
  }, [pathname]);

  const loadSidebarData = async () => {
    try {
      const [pls, favs] = await Promise.all([
        playlistsDb.getPlaylists(),
        favoritesDb.getFavorites()
      ]);
      setPlaylists(pls);
      setLikedCount(favs.length);
    } catch (e) {
      console.warn('Error loading sidebar data:', e);
    }
  };

  const navItems = [
    { label: 'Home', icon: 'home', iconOutline: 'home-outline', route: '/' },
    { label: 'Search', icon: 'search', iconOutline: 'search-outline', route: '/search' },
    {
      label: 'Tamil Music',
      icon: 'flame',
      iconOutline: 'flame-outline',
      route: '/tamil',
      badge: 'தமிழ்'
    }
  ];

  const handleNav = (route: string) => {
    router.push(route as any);
    onNavigate?.();
  };

  return (
    <View style={styles.container}>
      {/* Top Nav Block (Spotify style Island 1) */}
      <View style={styles.topNavCard}>
        <TouchableOpacity
          style={styles.brandRow}
          activeOpacity={0.8}
          onPress={() => handleNav('/')}
        >
          <View style={styles.brandIconBox}>
            <Ionicons name="disc" size={22} color="#ffffff" />
          </View>
          <Text style={styles.brandName}>{APP_CONFIG.APP_NAME}</Text>
        </TouchableOpacity>

        {navItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={styles.navRow}
              onPress={() => handleNav(item.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? item.icon : item.iconOutline) as any}
                size={24}
                color={isActive ? '#ffffff' : APP_CONFIG.THEME.textSecondary}
              />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.label}
              </Text>
              {item.badge && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Library Block (Spotify style Island 2) */}
      <View style={styles.libraryCard}>
        {/* Library Header */}
        <View style={styles.libraryHeader}>
          <TouchableOpacity
            style={styles.libraryTitleBtn}
            onPress={() => handleNav('/library')}
          >
            <Ionicons
              name="library"
              size={22}
              color={pathname === '/library' ? '#ffffff' : APP_CONFIG.THEME.textSecondary}
            />
            <Text style={[styles.libraryTitleText, pathname === '/library' && styles.navTextActive]}>
              Your Library
            </Text>
          </TouchableOpacity>

          <View style={styles.libraryHeaderActions}>
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color={APP_CONFIG.THEME.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => handleNav('/library')}
            >
              <Ionicons name="arrow-forward" size={18} color={APP_CONFIG.THEME.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Library Filter Pills */}
        <View style={styles.libraryPillsRow}>
          <TouchableOpacity
            style={[styles.libPill, filter === 'playlists' && styles.libPillActive]}
            onPress={() => setFilter(filter === 'playlists' ? 'all' : 'playlists')}
          >
            <Text style={[styles.libPillText, filter === 'playlists' && styles.libPillTextActive]}>
              Playlists
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.libPill, filter === 'artists' && styles.libPillActive]}
            onPress={() => handleNav('/artists')}
          >
            <Text style={styles.libPillText}>Artists</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.libPill}
            onPress={() => handleNav('/albums')}
          >
            <Text style={styles.libPillText}>Albums</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Library List */}
        <ScrollView style={styles.libraryListScroll} showsVerticalScrollIndicator={false}>
          {/* Liked Songs Pinned Item */}
          <TouchableOpacity
            style={[styles.playlistRowItem, pathname === '/favorites' && styles.playlistRowActive]}
            onPress={() => handleNav('/favorites')}
            activeOpacity={0.7}
          >
            <View style={styles.likedGradientThumb}>
              <Ionicons name="heart" size={18} color="#ffffff" />
            </View>
            <View style={styles.playlistMeta}>
              <Text
                numberOfLines={1}
                style={[styles.playlistTitle, pathname === '/favorites' && styles.playlistTitleActive]}
              >
                Liked Songs
              </Text>
              <Text style={styles.playlistSubtitle}>
                📌 Playlist • {likedCount} songs
              </Text>
            </View>
          </TouchableOpacity>

          {/* Downloads Pinned Item */}
          <TouchableOpacity
            style={[styles.playlistRowItem, pathname === '/downloads' && styles.playlistRowActive]}
            onPress={() => handleNav('/downloads')}
            activeOpacity={0.7}
          >
            <View style={styles.downloadThumb}>
              <Ionicons name="arrow-down" size={16} color="#1ed760" />
            </View>
            <View style={styles.playlistMeta}>
              <Text
                numberOfLines={1}
                style={[styles.playlistTitle, pathname === '/downloads' && styles.playlistTitleActive]}
              >
                Downloaded
              </Text>
              <Text style={styles.playlistSubtitle}>Offline tracks</Text>
            </View>
          </TouchableOpacity>

          {/* User Playlists */}
          {playlists.map((pl) => (
            <TouchableOpacity
              key={pl.id}
              style={styles.playlistRowItem}
              onPress={() => handleNav('/playlists')}
              activeOpacity={0.7}
            >
              <Image source={{ uri: pl.coverUrl }} style={styles.playlistCover} />
              <View style={styles.playlistMeta}>
                <Text numberOfLines={1} style={styles.playlistTitle}>
                  {pl.title}
                </Text>
                <Text style={styles.playlistSubtitle}>
                  Playlist • {pl.songCount || pl.tracks?.length || 0} songs
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {playlists.length === 0 && (
            <TouchableOpacity
              style={styles.createPromptBox}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createPromptTitle}>Create your first playlist</Text>
              <Text style={styles.createPromptSub}>It's easy, we'll help you</Text>
              <View style={styles.createPromptPill}>
                <Text style={styles.createPromptPillText}>Create playlist</Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => loadSidebarData()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#000000',
    padding: 8,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  topNavCard: {
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 16
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4
  },
  navText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a7a7a7'
  },
  navTextActive: {
    color: '#ffffff'
  },
  badgePill: {
    backgroundColor: APP_CONFIG.THEME.accentTamil,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto'
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800'
  },
  libraryCard: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    display: 'flex',
    flexDirection: 'column'
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 12
  },
  libraryTitleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  libraryTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#a7a7a7'
  },
  libraryHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  iconCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  libraryPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 12
  },
  libPill: {
    backgroundColor: '#232323',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  libPillActive: {
    backgroundColor: '#ffffff'
  },
  libPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff'
  },
  libPillTextActive: {
    color: '#000000',
    fontWeight: '700'
  },
  libraryListScroll: {
    flex: 1
  },
  playlistRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 12
  },
  playlistRowActive: {
    backgroundColor: '#232323'
  },
  likedGradientThumb: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#450af5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  downloadThumb: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#1e382b',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playlistCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#282828'
  },
  playlistMeta: {
    flex: 1
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 3
  },
  playlistTitleActive: {
    color: APP_CONFIG.THEME.accentPrimary
  },
  playlistSubtitle: {
    fontSize: 12,
    color: '#a7a7a7'
  },
  createPromptBox: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
    gap: 6
  },
  createPromptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  createPromptSub: {
    fontSize: 12,
    color: '#a7a7a7',
    marginBottom: 8
  },
  createPromptPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  createPromptPillText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700'
  }
});
