import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from '@/store/authStore';
import { LoadingScreen } from '@/components';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { BiometricLockScreen } from '@/features/auth/BiometricLockScreen';
import { useAppTheme } from '@/theme';
import { PermissionProvider } from '@/hooks/PermissionProvider';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, biometricLocked, user } = useAuthStore();
  const appTheme = useAppTheme();

  if (isLoading) return <LoadingScreen />;

  if (biometricLocked) return <BiometricLockScreen />;

  return (
    <NavigationContainer theme={appTheme.navigation}>
      <PermissionProvider user={user}>
        {isAuthenticated ? <MainTabs /> : <AuthStack />}
      </PermissionProvider>
    </NavigationContainer>
  );
};
