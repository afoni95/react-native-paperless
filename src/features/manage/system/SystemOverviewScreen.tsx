import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ManageStackParamList } from '@/navigation/types';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageCard } from '@/components/ManageCard';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { useOfflineQueueStore } from '@/store/offlineQueueStore';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'SystemOverview'>;

export const SystemOverviewScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { can } = usePermissionContext();
  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;
  const pendingCount = useOfflineQueueStore((s) => s.pendingCount());

  const offlineStyle = { color: theme.colors.error, fontWeight: '700' as const };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <ManageCard
          icon="cloud-sync"
          title={t('offline.pendingSync')}
          subtitle={
            pendingCount > 0
              ? t('offline.pendingSyncSubtitle', { count: pendingCount })
              : t('offline.noItems')
          }
          subtitleStyle={
            pendingCount > 0 ? { color: 'orange', fontWeight: '700' as const } : undefined
          }
          onPress={() => navigation.navigate('PendingSync')}
        />
        {can('view', 'paperlesstask') ? (
          <ManageCard
            icon="clipboard-list"
            title={t('manage.tasks')}
            subtitle={isOffline ? t('common.offlineMode') : undefined}
            subtitleStyle={isOffline ? offlineStyle : undefined}
            onPress={() => !isOffline && navigation.navigate('TasksList')}
          />
        ) : null}
        {can('view', 'logentry') ? (
          <ManageCard
            icon="file-document-outline"
            title={t('manage.logs')}
            subtitle={isOffline ? t('common.offlineMode') : undefined}
            subtitleStyle={isOffline ? offlineStyle : undefined}
            onPress={() => !isOffline && navigation.navigate('LogsView')}
          />
        ) : null}
        {can('delete', 'document') ? (
          <ManageCard
            icon="trash-can"
            title={t('manage.trashBin')}
            subtitle={isOffline ? t('common.offlineMode') : undefined}
            subtitleStyle={isOffline ? offlineStyle : undefined}
            onPress={() => !isOffline && navigation.navigate('TrashBin')}
          />
        ) : null}
        <ManageCard
          icon="cog"
          title={t('manage.settings')}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 8,
  },
});
