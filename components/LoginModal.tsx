import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../constants/config';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onShuffled?: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
];

type PlatformChoice = 'all' | 'youtube' | 'instagram' | 'spotify' | 'google';

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose, onShuffled }) => {
  const { user, isLoggedIn, login, logout, triggerShuffle } = useAuth();
  const [name, setName] = useState(user?.name && !user.isGuest ? user.name : '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformChoice>(
    (user?.favoritePlatform as PlatformChoice) || 'all'
  );

  const handleLoginSubmit = async () => {
    const finalName = name.trim() || 'Music Lover';
    await login(finalName, selectedAvatar, selectedPlatform);
    onShuffled?.();
    onClose();
  };

  const handleQuickLogin = async (presetName: string, avatarIdx: number, platform: PlatformChoice) => {
    await login(presetName, AVATAR_OPTIONS[avatarIdx % AVATAR_OPTIONS.length], platform);
    onShuffled?.();
    onClose();
  };

  const handleReshuffleOnly = () => {
    triggerShuffle();
    onShuffled?.();
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    setName('');
    onShuffled?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="sparkles" size={20} color="#1ed760" />
              </View>
              <View>
                <Text style={styles.modalTitle}>
                  {isLoggedIn ? 'Your Profile & Feed' : 'Login & Reshuffle'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Every login shuffles trending tracks across YouTube, Instagram, Spotify & Google!
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* If currently logged in, show current status */}
            {isLoggedIn && user && (
              <LinearGradient
                colors={['#1e293b', '#0f172a']}
                style={styles.currentProfileBanner}
              >
                <Image source={{ uri: user.avatar }} style={styles.bannerAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerName}>{user.name}</Text>
                  <Text style={styles.bannerSub}>
                    Logged in • Shuffled across YouTube, IG, Spotify & Google
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.bannerReshuffleBtn}
                  onPress={handleReshuffleOnly}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shuffle" size={18} color="#000000" />
                  <Text style={styles.bannerReshuffleBtnText}>Reshuffle</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}

            {/* Choose Avatar */}
            <Text style={styles.inputLabel}>Choose Your Avatar</Text>
            <View style={styles.avatarRow}>
              {AVATAR_OPTIONS.map((uri, idx) => {
                const isSelected = selectedAvatar === uri;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.avatarChoiceWrapper, isSelected && styles.avatarSelected]}
                    onPress={() => setSelectedAvatar(uri)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri }} style={styles.avatarChoiceImg} />
                    {isSelected && (
                      <View style={styles.avatarCheckBadge}>
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Name Input */}
            <Text style={styles.inputLabel}>Your Name / Username</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color="#a1a1aa" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter name (e.g. Alex, Priya)"
                placeholderTextColor="#666666"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Preferred Trending Platform */}
            <Text style={styles.inputLabel}>Your Favorite Trendsetter Source</Text>
            <View style={styles.platformPillsGrid}>
              {[
                { id: 'all', label: 'All 4 Platforms', icon: 'globe-outline', color: '#1ed760' },
                { id: 'youtube', label: 'YouTube Hits', icon: 'logo-youtube', color: '#ff0000' },
                { id: 'instagram', label: 'Instagram Reels', icon: 'logo-instagram', color: '#e1306c' },
                { id: 'spotify', label: 'Spotify Top 50', icon: 'musical-notes', color: '#1ed760' },
                { id: 'google', label: 'Google Trends', icon: 'search', color: '#3b82f6' }
              ].map((p) => {
                const isSelected = selectedPlatform === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.platformPill,
                      isSelected && { backgroundColor: `${p.color}25`, borderColor: p.color }
                    ]}
                    onPress={() => setSelectedPlatform(p.id as PlatformChoice)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={p.icon as any}
                      size={16}
                      color={isSelected ? p.color : '#a1a1aa'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.platformPillText,
                        isSelected && { color: '#ffffff', fontWeight: '700' }
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Demo Profiles */}
            <Text style={styles.inputLabel}>Quick One-Tap Sign In</Text>
            <View style={styles.quickPresetsRow}>
              <TouchableOpacity
                style={styles.quickPresetBtn}
                onPress={() => handleQuickLogin('Alex (Spotify Addict)', 0, 'spotify')}
                activeOpacity={0.8}
              >
                <Text style={styles.quickPresetText}>🟢 Alex (Spotify Top 50)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPresetBtn}
                onPress={() => handleQuickLogin('Priya (Reels Viral)', 2, 'instagram')}
                activeOpacity={0.8}
              >
                <Text style={styles.quickPresetText}>🟣 Priya (Instagram Reels)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPresetBtn}
                onPress={() => handleQuickLogin('Vikram (YouTube Mass)', 1, 'youtube')}
                activeOpacity={0.8}
              >
                <Text style={styles.quickPresetText}>🔴 Vikram (YouTube Trending)</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsCol}>
              <TouchableOpacity
                style={styles.primaryLoginBtn}
                onPress={handleLoginSubmit}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#1ed760', '#16a34a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryLoginBtnGradient}
                >
                  <Ionicons name="shuffle" size={20} color="#000000" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryLoginBtnText}>
                    {isLoggedIn ? 'Update & Shuffle Feed' : 'Log In & Shuffle Feed'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {isLoggedIn && (
                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 6 }} />
                  <Text style={styles.logoutBtnText}>Log Out / Switch to Guest</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: '#18181b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 215, 96, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
    lineHeight: 16
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  currentProfileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 18
  },
  bannerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#1ed760'
  },
  bannerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff'
  },
  bannerSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  bannerReshuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1ed760',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8
  },
  bannerReshuffleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 4
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d4d4d8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  avatarChoiceWrapper: {
    position: 'relative',
    borderRadius: 28,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  avatarSelected: {
    borderColor: '#1ed760'
  },
  avatarChoiceImg: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1ed760',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#18181b'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 18
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    height: '100%'
  },
  platformPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18
  },
  platformPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  platformPillText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500'
  },
  quickPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  quickPresetBtn: {
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  quickPresetText: {
    fontSize: 12,
    color: '#e4e4e7',
    fontWeight: '500'
  },
  actionButtonsCol: {
    gap: 10,
    paddingBottom: 16
  },
  primaryLoginBtn: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  primaryLoginBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20
  },
  primaryLoginBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444'
  }
});
