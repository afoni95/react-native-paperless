import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { LoadingScreen } from '@/components';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { BiometricLockScreen } from '@/features/auth/BiometricLockScreen';
import { navigationLightTheme, navigationDarkTheme } from '@/theme';
import { PermissionProvider } from '@/hooks/PermissionProvider';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, biometricLocked, user } = useAuthStore();
  const { theme: themeMode } = useSettingsStore();
  const systemScheme = useColorScheme();

  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemScheme === 'dark');

  if (isLoading) return <LoadingScreen />;

  if (biometricLocked) return <BiometricLockScreen />;

  return (
    <NavigationContainer theme={isDark ? navigationDarkTheme : navigationLightTheme}>
      <PermissionProvider user={user}>{isAuthenticated ? <MainTabs /> : <AuthStack />}</PermissionProvider>
    </NavigationContainer>
  );
};
