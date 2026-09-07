import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { APP_CONFIG } from '../constants/config';
import { playlistsDb } from '../database/playlists';
import { Playlist } from '../types/playlist';
import { CreatePlaylistModal } from './CreatePlaylistModal';

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, [pathname]);

  const loadPlaylists = async () => {
    try {
      const list = await playlistsDb.getPlaylists();
      setPlaylists(list);
    } catch (e) {
      console.warn('Error loading sidebar playlists:', e);
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
    },
    { label: 'Your Library', icon: 'library', iconOutline: 'library-outline', route: '/library' }
  ];

  const subNavItems = [
    { label: 'Liked Songs', icon: 'heart', route: '/favorites', color: '#ec4899' },
    { label: 'Downloads', icon: 'cloud-download', route: '/downloads', color: '#06b6d4' },
    { label: 'All Playlists', icon: 'musical-notes', route: '/playlists', color: '#8b5cf6' }
  ];

  const handleNav = (route: string) => {
    router.push(route as any);
    onNavigate?.();
  };

  return (
    <View style={styles.container}>
      {/* Brand Header */}
      <TouchableOpacity
        style={styles.brandRow}
        activeOpacity={0.8}
        onPress={() => handleNav('/')}
      >
        <View style={styles.brandLogo}>
          <Ionicons name="disc" size={24} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.brandName}>{APP_CONFIG.APP_NAME}</Text>
          <Text style={styles.brandTagline}>Premium Streaming</Text>
        </View>
      </TouchableOpacity>

      {/* Main Navigation */}
      <View style={styles.section}>
        {navItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleNav(item.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? item.icon : item.iconOutline) as any}
                size={20}
                color={isActive ? APP_CONFIG.THEME.accentPrimary : APP_CONFIG.THEME.textSecondary}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {item.badge && (
                <View style={styles.tamilBadge}>
                  <Text style={styles.tamilBadgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Library Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COLLECTIONS</Text>
        {subNavItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.subNavItem, isActive && styles.navItemActive]}
              onPress={() => handleNav(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.subIconSquare, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={14} color="#ffffff" />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Custom Playlists Section */}
      <View style={styles.playlistSectionHeader}>
        <Text style={styles.sectionTitle}>YOUR PLAYLISTS</Text>
        <TouchableOpacity
          style={styles.createPlaylistIconBtn}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={18} color={APP_CONFIG.THEME.textPrimary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createPlaylistCard}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add-circle" size={20} color={APP_CONFIG.THEME.accentPrimary} />
        <Text style={styles.createPlaylistText}>New Playlist</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.playlistScroll}
        showsVerticalScrollIndicator={false}
      >
        {playlists.length === 0 ? (
          <Text style={styles.emptyPlaylistText}>No playlists created yet.</Text>
        ) : (
          playlists.map((pl) => (
            <TouchableOpacity
              key={pl.id}
              style={styles.playlistItem}
              onPress={() => handleNav(`/playlists`)}
            >
              <Ionicons name="musical-note" size={14} color={APP_CONFIG.THEME.textMuted} />
              <Text numberOfLines={1} style={styles.playlistItemText}>
                {pl.title}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => loadPlaylists()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: APP_CONFIG.THEME.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: APP_CONFIG.THEME.border,
    paddingVertical: 20,
    paddingHorizontal: 14,
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 24,
    gap: 12
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: APP_CONFIG.THEME.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary,
    letterSpacing: -0.3
  },
  brandTagline: {
    fontSize: 11,
    color: APP_CONFIG.THEME.textMuted
  },
  section: {
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textMuted,
    paddingHorizontal: 12,
    marginBottom: 8,
    letterSpacing: 0.8
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    gap: 12
  },
  navItemActive: {
    backgroundColor: APP_CONFIG.THEME.activeBg
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textSecondary,
    flex: 1
  },
  navLabelActive: {
    color: APP_CONFIG.THEME.textPrimary,
    fontWeight: '700'
  },
  tamilBadge: {
    backgroundColor: APP_CONFIG.THEME.accentTamil,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  tamilBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  subNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
    gap: 12
  },
  subIconSquare: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: APP_CONFIG.THEME.border,
    marginVertical: 12,
    marginHorizontal: 8
  },
  playlistSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  createPlaylistIconBtn: {
    padding: 4
  },
  createPlaylistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    gap: 8,
    marginBottom: 8
  },
  createPlaylistText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.accentPrimary
  },
  playlistScroll: {
    flex: 1
  },
  emptyPlaylistText: {
    fontSize: 12,
    color: APP_CONFIG.THEME.textMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontStyle: 'italic'
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 10
  },
  playlistItemText: {
    fontSize: 13,
    color: APP_CONFIG.THEME.textSecondary
  }
});
