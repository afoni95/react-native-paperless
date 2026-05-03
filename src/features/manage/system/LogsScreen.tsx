import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Text } from 'react-native-paper';
import { useLogs, useLog } from '@/reactQuery';
import { useOfflineNavigationTitle } from '@/hooks/useOfflineNavigationTitle';

export const LogsScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  useOfflineNavigationTitle(t('manage.logs'));

  const { data: availableLogs, isLoading: logsLoading } = useLogs();

  useEffect(() => {
    if (availableLogs && availableLogs.length > 0 && !selectedLog) {
      const preferredLog = availableLogs.includes('paperless') ? 'paperless' : availableLogs[0];
      setSelectedLog(preferredLog);
    }
  }, [availableLogs, selectedLog]);

  const {
    data: logs,
    isLoading: logLoading,
    isError,
    error,
  } = useLog(selectedLog || '', 500, !!selectedLog);

  const loading = logsLoading || logLoading;

  if (loading) return <ActivityIndicator size="large" />;
  if (isError) return <Text>{error instanceof Error ? error.message : t('common.error')}</Text>;

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}>
      <FlatList
        data={logs || []}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <Text>{item}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default LogsScreen;
