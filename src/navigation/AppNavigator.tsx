import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { LoadingScreen } from '@/components';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { navigationLightTheme, navigationDarkTheme } from '@/theme';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { theme: themeMode } = useSettingsStore();
  const systemScheme = useColorScheme();

  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemScheme === 'dark');

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={isDark ? navigationDarkTheme : navigationLightTheme}>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
