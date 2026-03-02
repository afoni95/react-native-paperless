import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { hasHardwareAsync, isEnrolledAsync, authenticateAsync } from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

export const BiometricLockScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { unlockBiometric, logout } = useAuthStore();
  const [error, setError] = useState('');

  const authenticate = useCallback(async () => {
    setError('');
    try {
      const hasHardware = await hasHardwareAsync();
      const isEnrolled = await isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        unlockBiometric(); // Skip biometric if not available or set up
        return;
      }

      const result = await authenticateAsync({
        promptMessage: t('auth.biometricPrompt'),
        cancelLabel: t('common.cancel'),
        fallbackLabel: t('auth.biometricFallback'),
        disableDeviceFallback: false,
      });

      if (result.success) {
        unlockBiometric();
      } else {
        setError(t('auth.biometricFailed'));
      }
    } catch {
      setError(t('auth.biometricFailed'));
    }
  }, [unlockBiometric, t]);

  // Prompt biometric on mount
  useEffect(() => {
    authenticate();
  }, [authenticate]);

  // Re-prompt when app comes to foreground (e.g. after user left and came back)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        authenticate();
      }
    });
    return () => subscription.remove();
  }, [authenticate]);

  const handleLogout = async () => {
    await logout();
    useAuthStore.setState({ biometricLocked: false });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MaterialCommunityIcons
        name="shield-lock-outline"
        size={72}
        color={theme.colors.primary}
        style={styles.icon}
      />
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        {t('auth.biometricTitle')}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {t('auth.biometricSubtitle')}
      </Text>

      {error ? (
        <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      ) : null}

      <Button mode="contained" onPress={authenticate} style={styles.button} icon="fingerprint">
        {t('auth.biometricRetry')}
      </Button>

      <Button
        mode="text"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor={theme.colors.error}
      >
        {t('auth.logout')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  error: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
  },
  logoutButton: {
    marginTop: 8,
  },
});
