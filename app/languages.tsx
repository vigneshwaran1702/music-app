import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageCard } from '../components/LanguageCard';
import { LANGUAGES } from '../constants/languages';
import { APP_CONFIG } from '../constants/config';

export default function LanguagesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Explore Global Music</Text>
        <Text style={styles.headerSubtitle}>
          Choose your favorite language to stream local hits, indie sounds, and top trending tracks.
        </Text>

        <View style={styles.grid}>
          {LANGUAGES.map((lang) => (
            <LanguageCard key={lang.id} language={lang} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_CONFIG.THEME.background
  },
  content: {
    padding: 20,
    paddingBottom: 110
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_CONFIG.THEME.textPrimary,
    marginBottom: 6
  },
  headerSubtitle: {
    fontSize: 14,
    color: APP_CONFIG.THEME.textSecondary,
    lineHeight: 20,
    marginBottom: 20
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
});
