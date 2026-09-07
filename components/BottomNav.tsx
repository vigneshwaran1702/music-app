import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { APP_CONFIG } from '../constants/config';

export const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on full screen player
  if (pathname === '/player') return null;

  const tabs = [
    { label: 'Home', icon: 'home', iconOutline: 'home-outline', route: '/' },
    { label: 'Search', icon: 'search', iconOutline: 'search-outline', route: '/search' },
    {
      label: 'Tamil',
      icon: 'flame',
      iconOutline: 'flame-outline',
      route: '/tamil',
      highlight: true
    },
    { label: 'Library', icon: 'library', iconOutline: 'library-outline', route: '/library' }
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tabItem}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={(isActive ? tab.icon : tab.iconOutline) as any}
                size={22}
                color={
                  isActive
                    ? tab.highlight
                      ? APP_CONFIG.THEME.accentTamil
                      : APP_CONFIG.THEME.accentPrimary
                    : APP_CONFIG.THEME.textMuted
                }
              />
              {tab.highlight && (
                <View style={styles.dot} />
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
                isActive && tab.highlight && { color: APP_CONFIG.THEME.accentTamil }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: APP_CONFIG.THEME.playerBg,
    borderTopWidth: 1,
    borderTopColor: APP_CONFIG.THEME.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  iconWrapper: {
    position: 'relative'
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: APP_CONFIG.THEME.accentTamil
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textMuted,
    marginTop: 4
  },
  tabLabelActive: {
    color: APP_CONFIG.THEME.textPrimary,
    fontWeight: '700'
  }
});
