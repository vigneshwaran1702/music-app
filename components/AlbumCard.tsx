import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Album } from '../types/album';

interface AlbumCardProps {
  album: Album;
  size?: number;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, size = 146 }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    router.push(`/album/${album.id}` as any);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.container,
        { width: size + 24 },
        isHovered && styles.containerHovered
      ]}
      onPress={handlePress}
      // @ts-ignore
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <View style={[styles.coverWrapper, { width: size, height: size }]}>
        <Image source={{ uri: album.coverUrl }} style={styles.cover} />
        <View style={[styles.floatingPlayBtn, isHovered && styles.floatingPlayBtnVisible]}>
          <Ionicons name="play" size={20} color="#000000" />
        </View>
      </View>
      <Text numberOfLines={1} style={styles.title}>
        {album.title}
      </Text>
      <Text numberOfLines={1} style={styles.artist}>
        {album.releaseDate ? `${album.releaseDate.slice(0, 4)} • ` : ''}{album.artistName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 12,
    marginRight: 16,
    transition: 'all 0.25s cubic-bezier(0.3, 0, 0, 1)'
  } as any,
  containerHovered: {
    backgroundColor: '#242424',
    transform: [{ translateY: -4 }]
  },
  coverWrapper: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#282828',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4
  },
  cover: {
    width: '100%',
    height: '100%'
  },
  floatingPlayBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    opacity: 0,
    transform: [{ translateY: 6 }],
    transition: 'all 0.25s ease'
  } as any,
  floatingPlayBtnVisible: {
    opacity: 1,
    transform: [{ translateY: 0 }]
  },
  title: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  artist: {
    marginTop: 4,
    fontSize: 12,
    color: '#a7a7a7'
  }
});
