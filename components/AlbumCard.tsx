import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Album } from '../types/album';
import { APP_CONFIG } from '../constants/config';

interface AlbumCardProps {
  album: Album;
  size?: number;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, size = 135 }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/album/${album.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, { width: size }]}
      onPress={handlePress}
    >
      <View style={[styles.coverWrapper, { width: size, height: size }]}>
        <Image source={{ uri: album.coverUrl }} style={styles.cover} />
      </View>
      <Text numberOfLines={1} style={styles.title}>
        {album.title}
      </Text>
      <Text numberOfLines={1} style={styles.artist}>
        {album.artistName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 14,
    borderRadius: 12
  },
  coverWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1b1e30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4
  },
  cover: {
    width: '100%',
    height: '100%'
  },
  title: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary
  },
  artist: {
    marginTop: 2,
    fontSize: 12,
    color: APP_CONFIG.THEME.textSecondary
  }
});
