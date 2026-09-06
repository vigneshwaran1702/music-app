import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MusicPlayer } from '../components/MusicPlayer';
import { APP_CONFIG } from '../constants/config';

export default function PlayerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <MusicPlayer onClose={() => router.back()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_CONFIG.THEME.background
  }
});
