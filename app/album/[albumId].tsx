import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { albumApi } from '../../services/albumApi';
import { Album } from '../../types/album';
import { SongCard } from '../../components/SongCard';
import { Loading } from '../../components/Loading';
import { usePlayer } from '../../hooks/usePlayer';
import { useResponsive } from '../../hooks/useResponsive';

export default function AlbumDetailScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    async function load() {
      if (!albumId) return;
      setLoading(true);
      const data = await albumApi.getAlbumById(albumId);
      setAlbum(data);
      setLoading(false);
    }
    load();
  }, [albumId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loading message="Loading album tracks..." />
      </SafeAreaView>
    );
  }

  if (!album) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="disc-outline" size={56} color="#a7a7a7" style={{ marginBottom: 16 }} />
          <Text style={styles.notFoundText}>Album not found</Text>
          <Text style={{ color: '#a7a7a7', fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            The album could not be loaded or may no longer be available.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#1ed760', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 }}
            onPress={() => router.push('/albums')}
          >
            <Text style={{ color: '#000000', fontWeight: '700', fontSize: 14 }}>Browse Albums</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, isMobile && { paddingBottom: 170 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back navigation */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>

        {/* Album Hero Header */}
        <LinearGradient
          colors={
            album.gradient
              ? [album.gradient[0], album.gradient[1], '#121212']
              : ['#1e3a5f', '#142033', '#121212']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.heroHeader,
            isMobile && { flexDirection: 'column', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 16 }
          ]}
        >
          <Image source={{ uri: album.coverUrl }} style={[styles.cover, isMobile && { width: 150, height: 150 }]} />

          <View style={[styles.metaCol, isMobile && { alignItems: 'center' }]}>
            <View style={[styles.typeBadgeRow, isMobile && { justifyContent: 'center' }]}>
              <Text style={styles.typeLabel}>ALBUM</Text>
              {album.badge && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{album.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.title, isMobile && { fontSize: 24, textAlign: 'center' }]}>{album.title}</Text>
            {album.tamilTitle && album.tamilTitle !== album.title && (
              <Text style={[styles.tamilHeaderSubtitle, isMobile && { textAlign: 'center' }]}>
                {album.tamilTitle}
              </Text>
            )}
            {album.description ? (
              <Text style={[styles.albumDesc, isMobile && { textAlign: 'center' }]} numberOfLines={3}>
                {album.description}
              </Text>
            ) : null}
            <View style={styles.artistMetaRow}>
              <Text style={styles.artist}>{album.artistName}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaYear}>{album.releaseDate ? album.releaseDate.slice(0, 4) : '2024'}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaCount}>{album.tracks?.length || 0} songs</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Action Controls */}
        {album.tracks && album.tracks.length > 0 && (
          <View style={[styles.actionsBar, isMobile && { paddingHorizontal: 16 }]}>
            <TouchableOpacity
              style={styles.bigGreenPlayBtn}
              onPress={() => playTrack(album.tracks![0], album.tracks)}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={26} color="#000000" />
            </TouchableOpacity>
          </View>
        )}

        {/* Tracklist */}
        <View style={[styles.tracklistSection, isMobile && { paddingHorizontal: 16 }]}>
          {album.tracks && album.tracks.length > 0 ? (
            album.tracks.map((s, idx) => (
              <SongCard
                key={s.id}
                song={s}
                playlist={album.tracks}
                variant="list"
                index={idx}
              />
            ))
          ) : (
            <Text style={styles.noTracksText}>No tracks found in this album.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212'
  },
  content: {
    paddingBottom: 120
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 24
  },
  cover: {
    width: 170,
    height: 170,
    borderRadius: 6,
    backgroundColor: '#282828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14
  },
  metaCol: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.8
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff'
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.8,
    marginBottom: 4
  },
  tamilHeaderSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1ed760',
    marginBottom: 8
  },
  albumDesc: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 18,
    marginBottom: 10
  },
  artistMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  artist: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  dot: {
    fontSize: 14,
    color: '#a7a7a7'
  },
  metaYear: {
    fontSize: 14,
    color: '#a7a7a7'
  },
  metaCount: {
    fontSize: 14,
    color: '#a7a7a7'
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18
  },
  bigGreenPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
  tracklistSection: {
    paddingHorizontal: 24
  },
  noTracksText: {
    fontSize: 14,
    color: '#a7a7a7',
    textAlign: 'center',
    marginTop: 24
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notFoundText: {
    fontSize: 16,
    color: '#a7a7a7'
  }
});
