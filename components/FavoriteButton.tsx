import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../types/music';
import { useFavorites } from '../hooks/useFavorites';
import { APP_CONFIG } from '../constants/config';

interface FavoriteButtonProps {
  song: Song;
  size?: number;
  color?: string;
  activeColor?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  song,
  size = 22,
  color = APP_CONFIG.THEME.textSecondary,
  activeColor = '#ef4444'
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(song.id);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.button}
      onPress={(e) => {
        e.stopPropagation?.();
        toggleFavorite(song);
      }}
    >
      <Ionicons
        name={active ? 'heart' : 'heart-outline'}
        size={size}
        color={active ? activeColor : color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
