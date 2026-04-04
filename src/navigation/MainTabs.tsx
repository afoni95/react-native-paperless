import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Button, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { UploadScreen } from '@/features/documents/UploadScreen';
import { DocumentsStack } from './DocumentsStack';
import { ManageStack } from './ManageStack';
import { MainTabsParamList } from './types';
import { DashboardStack } from './DashboardStack';
import { usePermissionContext } from '@/hooks/PermissionProvider';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { can } = usePermissionContext();

  const showDocumentsTab = can('view', 'document');
  const showUploadTab = can('add', 'document');

  const screens = useMemo(() => {
    const arr: React.ReactElement[] = [
      <Tab.Screen
        key="DashboardTab"
        name="DashboardTab"
        component={DashboardStack}
        options={{
          title: t('dashboard.title'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />,
    ];

    if (showDocumentsTab)
      arr.push(
        <Tab.Screen
          key="DocumentsTab"
          name="DocumentsTab"
          component={DocumentsStack}
          options={{
            title: t('documents.pluralEntity'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="file-document-multiple" color={color} size={size} />
            ),
          }}
        />,
      );

    if (showUploadTab)
      arr.push(
        <Tab.Screen
          key="UploadTab"
          name="UploadTab"
          component={UploadScreen}
          options={({ navigation }) => ({
            title: t('upload.title'),
            tabBarStyle: { display: showUploadTab ? 'none' : 'none' },
            headerShown: true,
            headerLeft: ({ tintColor }) => (
              <Button disabled={!navigation.canGoBack()} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons size={32} color={tintColor} name="arrow-left" />{' '}
              </Button>
            ),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="upload" color={color} size={size + 8} />
            ),
          })}
        />,
      );

    arr.push(
      <Tab.Screen
        key="ManageTab"
        name="ManageTab"
        component={ManageStack}
        options={{
          title: t('manage.title'),
          popToTopOnBlur: true,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="application-cog" color={color} size={size} />
          ),
        }}
      />,
    );

    return arr;
  }, [showDocumentsTab, showUploadTab, t]);

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
      {screens}
    </Tab.Navigator>
  );
};
