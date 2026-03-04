
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getLog, listLogs } from '../../api/logs';
import { useTranslation } from 'react-i18next';

export const LogsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listLogs()
      .then(async (availableLogs) => {
        const preferredLog = availableLogs.includes('paperless')
          ? 'paperless'
          : availableLogs[0];

        if (!preferredLog) {
          setLogs([]);
          setLoading(false);
          return;
        }

        const lines = await getLog(preferredLog, 500);
        setLogs(lines || []);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : t('common.error');
        setError(message);
        setLoading(false);
      });
  }, [t]);

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text>{error}</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={logs}
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
