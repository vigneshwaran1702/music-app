import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Artist } from '../types/artist';
import { APP_CONFIG } from '../constants/config';

interface ArtistCardProps {
  artist: Artist;
  size?: number;
  showBio?: boolean;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, size = 110, showBio = false }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/artist/${artist.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, { width: size + 20 }]}
      onPress={handlePress}
    >
      <View style={[styles.avatarWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image source={{ uri: artist.imageUrl }} style={styles.avatar} />
      </View>
      <Text numberOfLines={1} style={styles.name}>
        {artist.name}
      </Text>
      {showBio && artist.genres && (
        <Text numberOfLines={1} style={styles.subtitle}>
          {artist.genres.slice(0, 2).join(' • ')}
        </Text>
      )}
      {!showBio && (
        <Text numberOfLines={1} style={styles.subtitle}>
          Artist
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 14,
    paddingVertical: 6
  },
  avatarWrapper: {
    overflow: 'hidden',
    backgroundColor: '#1e2238',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  name: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: APP_CONFIG.THEME.textPrimary,
    textAlign: 'center'
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    color: APP_CONFIG.THEME.textMuted,
    textAlign: 'center'
  }
});
