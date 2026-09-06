import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LanguageOption } from '../constants/languages';

interface LanguageCardProps {
  language: LanguageOption;
  variant?: 'card' | 'pill';
  isSelected?: boolean;
  onPress?: () => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  variant = 'card',
  isSelected = false,
  onPress
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push(`/language/${language.code}`);
  };

  if (variant === 'pill') {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={[styles.pillContainer, isSelected && styles.pillSelected]}
        onPress={handlePress}
      >
        <Text style={styles.pillFlag}>{language.flag}</Text>
        <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
          {language.name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.cardContainer} onPress={handlePress}>
      <LinearGradient
        colors={language.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <Text style={styles.cardFlag}>{language.flag}</Text>
        <Text style={styles.cardName}>{language.name}</Text>
        <Text style={styles.cardNativeName}>{language.nativeName}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '47%',
    height: 100,
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  gradientCard: {
    flex: 1,
    padding: 14,
    justifyContent: 'center'
  },
  cardFlag: {
    fontSize: 22,
    marginBottom: 4
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff'
  },
  cardNativeName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#161928',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#242a42'
  },
  pillSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#818cf8'
  },
  pillFlag: {
    fontSize: 15,
    marginRight: 6
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8'
  },
  pillTextSelected: {
    color: '#ffffff'
  }
});
