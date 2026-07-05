import React, { useEffect, useState } from 'react';
import { useColorScheme, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, Banner, Text } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

import { useTranslation } from 'react-i18next';
import { AppNavigator } from '@/navigation/AppNavigator';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { lightTheme, darkTheme } from '@/theme';
import i18n from '@/i18n';
import { WidgetSnapshotBootstrap } from '@/widgets/WidgetSnapshotBootstrap';
import { initializeWidgetSync, cleanupWidgetSync } from '@/services/backgroundSync';
import { useWidgetStore } from '@/widgets/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 2,
    },
  },
});

// Error boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={boundaryStyles.container}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#b00020"
            style={{ marginBottom: 16 }}
          />
          <Text style={boundaryStyles.text}>{i18n.t('common.somethingWentWrong')}</Text>
          <Text style={boundaryStyles.retry} onPress={() => this.setState({ hasError: false })}>
            {i18n.t('common.retry')}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const boundaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  text: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  retry: { fontSize: 16, color: '#17541f' },
});

export default function App() {
  const { t } = useTranslation();
  const systemScheme = useColorScheme();
  const { restoreSession, isAuthenticated, isLoading, biometricLocked } = useAuthStore();
  const { theme: themeMode, loadSettings } = useSettingsStore();
  const [isOffline, setIsOffline] = useState(false);

  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemScheme === 'dark');
  const paperTheme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    restoreSession();
    loadSettings();
  }, [restoreSession, loadSettings]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      setIsOffline(!connected);
      const { status, setStatus } = useNetworkStore.getState();
      if (!connected && status === NetworkStatus.Online) {
        setStatus(NetworkStatus.Disconnected);
      } else if (connected && status === NetworkStatus.Disconnected) {
        setStatus(NetworkStatus.Online);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const canRunWidgetSync = isAuthenticated && !isLoading && !biometricLocked;
    if (!canRunWidgetSync) {
      cleanupWidgetSync();
      return;
    }

    const service = initializeWidgetSync({ queryClient });

    const unsubscribeStore = useWidgetStore.subscribe((state, prevState) => {
      const prevConfig = prevState.syncConfig;
      const nextConfig = state.syncConfig;

      if (
        prevConfig.enabled !== nextConfig.enabled ||
        prevConfig.intervalMinutes !== nextConfig.intervalMinutes ||
        prevConfig.wifiOnly !== nextConfig.wifiOnly
      ) {
        service.updateConfig(nextConfig);
      }
    });

    return () => {
      unsubscribeStore();
      cleanupWidgetSync();
    };
  }, [isAuthenticated, isLoading, biometricLocked]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={paperTheme}>
            {isAuthenticated && !isLoading && !biometricLocked ? <WidgetSnapshotBootstrap /> : null}
            <Banner
              visible={isOffline}
              icon="wifi-off"
              actions={[]}
              style={{ backgroundColor: paperTheme.colors.errorContainer }}
            >
              <View>
                <Text>{t('common.offline')}</Text>
                <Text>{t('common.offlineHint')}</Text>
              </View>
            </Banner>
            <AppNavigator />
            <StatusBar hidden />
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
