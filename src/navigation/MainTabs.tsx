import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { UploadScreen } from '@/features/documents/UploadScreen';
import { DocumentsStack } from './DocumentsStack';
import { ManageStack } from './ManageStack';
import { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: t('dashboard.title'),
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DocumentsTab"
        component={DocumentsStack}
        options={{
          title: t('documents.title'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-multiple" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="UploadTab"
        component={UploadScreen}
        options={{
          title: t('upload.title'),
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="upload" color={color} size={size + 8} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageTab"
        component={ManageStack}
        options={{
          title: t('manage.title'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="application-cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
