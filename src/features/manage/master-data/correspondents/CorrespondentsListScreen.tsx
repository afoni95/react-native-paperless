import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Searchbar, FAB, List, useTheme, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Correspondent } from '@/types';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useAllCorrespondents, useDeleteCorrespondent } from '@/reactQuery';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { useOfflineQueueStore, OfflineQueueItem } from '@/store/offlineQueueStore';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';

type EmbeddedDiscard = { docId: string; correspondentName: string };

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'CorrespondentsList'>;

export const CorrespondentsListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Correspondent | null>(null);
  const [discardTarget, setDiscardTarget] = useState<OfflineQueueItem | null>(null);
  const [embeddedDiscardTarget, setEmbeddedDiscardTarget] = useState<EmbeddedDiscard | null>(null);

  const {
    items: offlineItems,
    removeItem: removeOfflineItem,
    updateItemData,
  } = useOfflineQueueStore();
  const pendingCorrespondents = useMemo(
    () => offlineItems.filter((i) => i.type === 'correspondent'),
    [offlineItems],
  );

  const embeddedCorrespondents = useMemo(() => {
    const pendingCorrNames = new Set(
      pendingCorrespondents.map((i) => (i.data.name ?? '').toLowerCase()),
    );
    const results: { docId: string; correspondentName: string }[] = [];
    for (const item of offlineItems) {
      if (item.type === 'document' && item.data.correspondentName) {
        if (!pendingCorrNames.has(item.data.correspondentName.toLowerCase())) {
          results.push({ docId: item.id, correspondentName: item.data.correspondentName });
        }
      }
    }
    return results;
  }, [offlineItems, pendingCorrespondents]);

  const {
    data: correspondents,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAllCorrespondents();

  const deleteMutation = useDeleteCorrespondent({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const { can } = usePermissionContext();
  const canAddCorrespondent = can('add', 'correspondent');
  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;

  const filteredItems = useMemo(() => {
    if (!correspondents) return [];
    if (!searchQuery) return correspondents;
    return correspondents.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [correspondents, searchQuery]);

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder={t('common.search')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      {isError && (
        <ErrorBanner
          message={(error as Error)?.message ?? t('common.somethingWentWrong')}
          onRetry={refetch}
        />
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          pendingCorrespondents.length > 0 || embeddedCorrespondents.length > 0 ? (
            <View style={styles.pendingSection}>
              {pendingCorrespondents.map((item) => (
                <List.Item
                  key={item.id}
                  title={item.data.name ?? ''}
                  description={t('offline.pendingItem')}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="account-clock-outline"
                      color={theme.colors.tertiary}
                    />
                  )}
                  right={() => (
                    <IconButton
                      icon="trash-can-outline"
                      iconColor={theme.colors.error}
                      size={20}
                      onPress={() => setDiscardTarget(item)}
                    />
                  )}
                  style={[styles.pendingItem, { backgroundColor: theme.colors.surfaceVariant }]}
                  descriptionStyle={{ color: theme.colors.tertiary }}
                />
              ))}
              {embeddedCorrespondents.map(({ docId, correspondentName }) => (
                <List.Item
                  key={`${docId}-${correspondentName}`}
                  title={correspondentName}
                  description={t('offline.pendingItem')}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="account-clock-outline"
                      color={theme.colors.tertiary}
                    />
                  )}
                  right={() => (
                    <IconButton
                      icon="trash-can-outline"
                      iconColor={theme.colors.error}
                      size={20}
                      onPress={() => setEmbeddedDiscardTarget({ docId, correspondentName })}
                    />
                  )}
                  style={[styles.pendingItem, { backgroundColor: theme.colors.surfaceVariant }]}
                  descriptionStyle={{ color: theme.colors.tertiary }}
                />
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`${t('common.documentCount', { count: item.document_count })}`}
            left={(props) => <List.Icon {...props} icon="account" />}
            right={(props) => <List.Icon {...props} icon="pencil" />}
            onPress={() =>
              !isOffline &&
              can('change', 'correspondent') &&
              navigation.navigate('CorrespondentEdit', { correspondentId: item.id })
            }
            onLongPress={() =>
              !isOffline && can('delete', 'correspondent') && setDeleteTarget(item)
            }
          />
        )}
        contentContainerStyle={filteredItems.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={<EmptyState message={t('common.noResults')} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
      />

      {canAddCorrespondent && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => navigation.navigate('CorrespondentEdit', {})}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('correspondents.deleteConfirm')}
        destructive
        onConfirm={() => {
          if (deleteTarget && can('delete', 'correspondent'))
            deleteMutation.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        visible={!!discardTarget}
        title={t('offline.discard')}
        message={t('offline.discardConfirm')}
        confirmLabel={t('offline.discard')}
        destructive
        onConfirm={() => {
          if (discardTarget) removeOfflineItem(discardTarget.id);
          setDiscardTarget(null);
        }}
        onCancel={() => setDiscardTarget(null)}
      />

      <ConfirmDialog
        visible={!!embeddedDiscardTarget}
        title={t('offline.discard')}
        message={t('offline.discardConfirm')}
        confirmLabel={t('offline.discard')}
        destructive
        onConfirm={() => {
          if (embeddedDiscardTarget) {
            updateItemData(embeddedDiscardTarget.docId, { correspondentName: undefined });
          }
          setEmbeddedDiscardTarget(null);
        }}
        onCancel={() => setEmbeddedDiscardTarget(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 12,
    elevation: 2,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  pendingSection: {
    marginBottom: 4,
  },
  pendingItem: {
    marginHorizontal: 8,
    marginBottom: 4,
    borderRadius: 8,
  },
});
