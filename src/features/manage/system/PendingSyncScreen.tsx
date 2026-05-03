import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { List, useTheme, Chip, Text, Button, Snackbar, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { useOfflineQueueStore, OfflineQueueItem, OfflineItemType } from '@/store/offlineQueueStore';
import { syncAll } from '@/services/syncService';
import { EmptyState } from '@/components';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';
import { tagQueryKeys, correspondentQueryKeys, documentTypeQueryKeys, documentQueryKeys } from '@/reactQuery';

type EmbeddedEntry = {
  kind: 'embedded';
  id: string;
  type: OfflineItemType;
  name: string;
};

type ListEntry = { kind: 'item'; item: OfflineQueueItem } | EmbeddedEntry;

function typeIcon(type: OfflineItemType): string {
  switch (type) {
    case 'document':
      return 'file-document';
    case 'tag':
      return 'tag';
    case 'correspondent':
      return 'account-box';
    case 'documentType':
      return 'file-multiple';
  }
}

export const PendingSyncScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { items, clearFailed } = useOfflineQueueStore();
  const [syncing, setSyncing] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const { status } = useNetworkStore();
  const queryClient = useQueryClient();

  const listData = useMemo((): ListEntry[] => {
    const entries: ListEntry[] = [];
    for (const item of items) {
      entries.push({ kind: 'item', item });
      if (item.type === 'document') {
        for (const name of item.data.tagNames ?? []) {
          entries.push({ kind: 'embedded', id: `${item.id}-tag-${name}`, type: 'tag', name });
        }
        if (item.data.correspondentName) {
          entries.push({
            kind: 'embedded',
            id: `${item.id}-corr`,
            type: 'correspondent',
            name: item.data.correspondentName,
          });
        }
        if (item.data.documentTypeName) {
          entries.push({
            kind: 'embedded',
            id: `${item.id}-dt`,
            type: 'documentType',
            name: item.data.documentTypeName,
          });
        }
      }
    }
    return entries;
  }, [items]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncAll();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tagQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: correspondentQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: documentTypeQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: documentQueryKeys.all() }),
      ]);
      const remaining = items.filter((i) => i.status === 'failed').length;
      if (remaining > 0) {
        setSnackbar(t('offline.syncPartial', { count: remaining }));
      } else {
        setSnackbar(t('offline.syncSuccess'));
      }
    } catch {
      setSnackbar(t('offline.syncFailed'));
    } finally {
      setSyncing(false);
    }
  };

  const renderItem = ({ item: entry }: { item: ListEntry }) => {
    if (entry.kind === 'embedded') {
      return (
        <View>
          <List.Item
            title={entry.name}
            description={t('offline.embeddedInDocument')}
            left={(props) => (
              <List.Icon
                {...props}
                icon={typeIcon(entry.type)}
                color={theme.colors.onSurfaceVariant}
              />
            )}
            right={() => (
              <Chip
                style={{
                  backgroundColor: theme.colors.onSurfaceVariant + '22',
                  alignSelf: 'center',
                }}
                textStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}
                compact
              >
                {t('offline.statusPending')}
              </Chip>
            )}
            titleStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          <Divider />
        </View>
      );
    }

    const { item } = entry;
    const label = item.data.title || item.data.name || '';
    const statusColor =
      item.status === 'failed'
        ? theme.colors.error
        : item.status === 'syncing'
          ? theme.colors.primary
          : theme.colors.onSurfaceVariant;

    const statusLabel =
      item.status === 'failed'
        ? t('offline.statusFailed')
        : item.status === 'syncing'
          ? t('offline.statusSyncing')
          : t('offline.statusPending');

    return (
      <View>
        <List.Item
          title={label}
          description={item.error ? item.error : new Date(item.createdAt).toLocaleString()}
          left={(props) => <List.Icon {...props} icon={typeIcon(item.type)} />}
          right={() => (
            <Chip
              style={{ backgroundColor: statusColor + '22', alignSelf: 'center' }}
              textStyle={{ color: statusColor, fontSize: 11 }}
              compact
            >
              {statusLabel}
            </Chip>
          )}
        />
        <Divider />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        {status !== NetworkStatus.Online ? (
          <Text variant="bodySmall" style={[styles.badge, { color: theme.colors.error }]}>
            {t('common.offlineMode')}
          </Text>
        ) : null}
        <View style={styles.actions}>
          {items.some((i) => i.status === 'failed') ? (
            <Button compact onPress={clearFailed} style={styles.actionBtn}>
              {t('offline.clearFailed')}
            </Button>
          ) : null}
          <Button
            mode="contained"
            compact
            onPress={handleSync}
            loading={syncing}
            disabled={syncing || items.filter((i) => i.status === 'pending').length === 0}
            style={styles.actionBtn}
            icon="sync"
          >
            {t('offline.syncNow')}
          </Button>
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(entry) => (entry.kind === 'item' ? entry.item.id : entry.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={syncing} onRefresh={handleSync} />}
        ListEmptyComponent={<EmptyState message={t('offline.noItems')} />}
        contentContainerStyle={listData.length === 0 ? styles.emptyContainer : undefined}
      />

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 12 },
  badge: { fontWeight: '700', letterSpacing: 1, textAlign: 'center', marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  actionBtn: { marginLeft: 4 },
  emptyContainer: { flexGrow: 1 },
});
