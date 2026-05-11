import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AnalyticsHomeScreen } from '@/features/analytics/AnalyticsHomeScreen';
import { AnalyticsWidgetEditorScreen } from '@/features/analytics/AnalyticsWidgetEditorScreen';
import type { AnalyticsStackParamList } from './types';

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

export const AnalyticsStack: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AnalyticsHome"
        component={AnalyticsHomeScreen}
        options={{ title: t('analytics.title') }}
      />
      <Stack.Screen
        name="AnalyticsWidgetEditor"
        component={AnalyticsWidgetEditorScreen}
        options={{ title: t('analytics.editor.title') }}
      />
    </Stack.Navigator>
  );
};
