import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Searchbar, FAB, List, useTheme, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';

import { DocumentType } from '@/types';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useAllDocumentTypes, useDeleteDocumentType } from '@/reactQuery';
import { useOfflineQueueStore, OfflineQueueItem } from '@/store/offlineQueueStore';

type EmbeddedDiscard = { docId: string; documentTypeName: string };

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'DocumentTypesList'>;

export const DocumentTypesListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DocumentType | null>(null);
  const [discardTarget, setDiscardTarget] = useState<OfflineQueueItem | null>(null);
  const [embeddedDiscardTarget, setEmbeddedDiscardTarget] = useState<EmbeddedDiscard | null>(null);

  const {
    items: offlineItems,
    removeItem: removeOfflineItem,
    updateItemData,
  } = useOfflineQueueStore();
  const pendingDocTypes = useMemo(
    () => offlineItems.filter((i) => i.type === 'documentType'),
    [offlineItems],
  );

  const embeddedDocTypes = useMemo(() => {
    const pendingDocTypeNames = new Set(
      pendingDocTypes.map((i) => (i.data.name ?? '').toLowerCase()),
    );
    const results: { docId: string; documentTypeName: string }[] = [];
    for (const item of offlineItems) {
      if (item.type === 'document' && item.data.documentTypeName) {
        if (!pendingDocTypeNames.has(item.data.documentTypeName.toLowerCase())) {
          results.push({ docId: item.id, documentTypeName: item.data.documentTypeName });
        }
      }
    }
    return results;
  }, [offlineItems, pendingDocTypes]);

  const { data: types, isLoading, isError, error, refetch, isRefetching } = useAllDocumentTypes();

  const deleteMutation = useDeleteDocumentType({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const { can } = usePermissionContext();
  const canAddDocumentType = can('add', 'documenttype');
  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;

  const filteredItems = useMemo(() => {
    if (!types) return [];
    if (!searchQuery) return types;
    return types.filter((dt) => dt.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [types, searchQuery]);

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  const isEmpty = !filteredItems.length;

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
          message={error instanceof Error ? error.message : t('common.somethingWentWrong')}
          onRetry={refetch}
        />
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          pendingDocTypes.length > 0 || embeddedDocTypes.length > 0 ? (
            <View style={styles.pendingSection}>
              {pendingDocTypes.map((item) => (
                <List.Item
                  key={item.id}
                  title={item.data.name ?? ''}
                  description={t('offline.pendingItem')}
                  left={(props) => (
                    <List.Icon {...props} icon="file-clock-outline" color={theme.colors.tertiary} />
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
              {embeddedDocTypes.map(({ docId, documentTypeName }) => (
                <List.Item
                  key={`${docId}-${documentTypeName}`}
                  title={documentTypeName}
                  description={t('offline.pendingItem')}
                  left={(props) => (
                    <List.Icon {...props} icon="file-clock-outline" color={theme.colors.tertiary} />
                  )}
                  right={() => (
                    <IconButton
                      icon="trash-can-outline"
                      iconColor={theme.colors.error}
                      size={20}
                      onPress={() => setEmbeddedDiscardTarget({ docId, documentTypeName })}
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
            description={t('documentTypes.documents', { count: item.document_count })}
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            right={(props) => <List.Icon {...props} icon="pencil" />}
            onPress={() =>
              !isOffline &&
              can('change', 'documenttype') &&
              navigation.navigate('DocumentTypeEdit', { documentTypeId: item.id })
            }
            onLongPress={() => !isOffline && can('delete', 'documenttype') && setDeleteTarget(item)}
          />
        )}
        contentContainerStyle={isEmpty ? styles.emptyContainer : undefined}
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

      {canAddDocumentType && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => navigation.navigate('DocumentTypeEdit', {})}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('documentTypes.deleteConfirm')}
        destructive
        onConfirm={() => {
          if (deleteTarget && can('delete', 'documenttype')) deleteMutation.mutate(deleteTarget.id);
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
            updateItemData(embeddedDiscardTarget.docId, { documentTypeName: undefined });
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
    marginHorizontal: 12,
    marginVertical: 10,
    elevation: 2,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
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
