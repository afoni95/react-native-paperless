import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useAllTasks } from '@/reactQuery';

export const ProcessingIndicator: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { data: allServerTasks } = useAllTasks(true, { refetchInterval: 3000 });

  const processingTasks = (allServerTasks || []).filter(
    (task) => task.status === 'PENDING' || task.status === 'STARTED',
  );

  if (processingTasks.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <ActivityIndicator size={12} color={theme.colors.tertiary} />
      <Text
        variant="labelSmall"
        style={{ color: theme.colors.tertiary, fontSize: 12, fontWeight: '700' }}
      >
        {t('documents.processingCount', { count: processingTasks.length })}
      </Text>
    </View>
  );
};
