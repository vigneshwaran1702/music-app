import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Song } from '../types/music';
import { SongCard } from './SongCard';
import { APP_CONFIG } from '../constants/config';

interface MusicListProps {
  songs: Song[];
  title?: string;
  emptyMessage?: string;
  showActions?: boolean;
}

export const MusicList: React.FC<MusicListProps> = ({
  songs,
  title,
  emptyMessage = 'No songs found in this category.',
  showActions = true
}) => {
  if (!songs || songs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongCard song={item} playlist={songs} showActions={showActions} />
        )}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 12
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 14,
    color: APP_CONFIG.THEME.textMuted
  }
});
