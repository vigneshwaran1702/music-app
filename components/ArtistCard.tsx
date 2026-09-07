import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Artist } from '../types/artist';

interface ArtistCardProps {
  artist: Artist;
  size?: number;
  showBio?: boolean;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, size = 140, showBio = false }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    router.push(`/artist/${artist.id}` as any);
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
      <View style={[styles.avatarWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image source={{ uri: artist.imageUrl }} style={styles.avatar} />
        <View style={[styles.floatingPlayBtn, isHovered && styles.floatingPlayBtnVisible]}>
          <Ionicons name="play" size={20} color="#000000" />
        </View>
      </View>
      <Text numberOfLines={1} style={styles.name}>
        {artist.name}
      </Text>
      <Text numberOfLines={1} style={styles.subtitle}>
        {showBio && artist.genres ? artist.genres.slice(0, 2).join(' • ') : 'Artist'}
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
    alignItems: 'center',
    transition: 'all 0.25s cubic-bezier(0.3, 0, 0, 1)'
  } as any,
  containerHovered: {
    backgroundColor: '#242424',
    transform: [{ translateY: -4 }]
  },
  avatarWrapper: {
    overflow: 'hidden',
    backgroundColor: '#282828',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  floatingPlayBtn: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
  name: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    width: '100%'
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#a7a7a7',
    textAlign: 'center'
  }
});
