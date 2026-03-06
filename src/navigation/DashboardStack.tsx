import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { GlobalSearchResultsScreen } from '@/features/documents/GlobalSearchResultsScreen';
import { DashboardStackParamList } from './types';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardStack: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: t('dashboard.title') }}
      />
      <Stack.Screen
        name="GlobalSearchResults"
        component={GlobalSearchResultsScreen}
        options={{ title: t('search.results') }}
      />
    </Stack.Navigator>
  );
};
