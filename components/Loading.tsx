import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { APP_CONFIG } from '../constants/config';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading music...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={APP_CONFIG.THEME.accentPrimary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: APP_CONFIG.THEME.textSecondary,
    fontWeight: '500'
  }
});
