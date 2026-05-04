import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Searchbar, FAB, List, useTheme, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';

import { ManageStackParamList } from '@/navigation/types';
import { Tag } from '@/types';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';
import { useAllTags, useDeleteTag } from '@/reactQuery';
import { useOfflineQueueStore, OfflineQueueItem } from '@/store/offlineQueueStore';

type EmbeddedDiscard = { docId: string; tagName: string };

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'TagsList'>;

export const TagsListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [discardTarget, setDiscardTarget] = useState<OfflineQueueItem | null>(null);
  const [embeddedDiscardTarget, setEmbeddedDiscardTarget] = useState<EmbeddedDiscard | null>(null);

  const {
    items: offlineItems,
    removeItem: removeOfflineItem,
    updateItemData,
  } = useOfflineQueueStore();
  const pendingTags = useMemo(() => offlineItems.filter((i) => i.type === 'tag'), [offlineItems]);

  // tags embedded inside offline document items
  const embeddedTags = useMemo(() => {
    const pendingTagNames = new Set(pendingTags.map((i) => (i.data.name ?? '').toLowerCase()));
    const results: { docId: string; tagName: string }[] = [];
    for (const item of offlineItems) {
      if (item.type === 'document' && item.data.tagNames) {
        for (const name of item.data.tagNames) {
          if (!pendingTagNames.has(name.toLowerCase())) {
            results.push({ docId: item.id, tagName: name });
          }
        }
      }
    }
    return results;
  }, [offlineItems, pendingTags]);

  const { data: tags, isLoading, isError, error, refetch, isRefetching } = useAllTags();

  const deleteMutation = useDeleteTag({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const { can } = usePermissionContext();
  const canAddTag = can('add', 'tag');
  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!searchQuery) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tags, searchQuery]);

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
        data={filteredTags}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          pendingTags.length > 0 || embeddedTags.length > 0 ? (
            <View style={styles.pendingSection}>
              {pendingTags.map((item) => (
                <List.Item
                  key={item.id}
                  title={item.data.name ?? ''}
                  description={t('offline.pendingItem')}
                  left={() => (
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: item.data.color || theme.colors.tertiary },
                      ]}
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
              {embeddedTags.map(({ docId, tagName }) => (
                <List.Item
                  key={`${docId}-${tagName}`}
                  title={tagName}
                  description={t('offline.pendingItem')}
                  left={() => (
                    <View style={[styles.colorDot, { backgroundColor: theme.colors.tertiary }]} />
                  )}
                  right={() => (
                    <IconButton
                      icon="trash-can-outline"
                      iconColor={theme.colors.error}
                      size={20}
                      onPress={() => setEmbeddedDiscardTarget({ docId, tagName })}
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
            description={t('common.documentCount', { count: item.document_count })}
            left={() => (
              <View style={[styles.colorDot, { backgroundColor: item.color || '#ccc' }]} />
            )}
            right={(props) => (
              <View style={styles.itemActions}>
                <List.Icon {...props} icon="pencil" />
              </View>
            )}
            onPress={() =>
              can('change', 'tag') &&
              !isOffline &&
              navigation.navigate('TagEdit', { tagId: item.id })
            }
            onLongPress={() => can('delete', 'tag') && !isOffline && setDeleteTarget(item)}
            style={styles.listItem}
          />
        )}
        contentContainerStyle={filteredTags.length === 0 ? styles.emptyContainer : undefined}
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

      {canAddTag && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => navigation.navigate('TagEdit', {})}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('tags.deleteConfirm')}
        destructive
        onConfirm={() => {
          if (deleteTarget && can('delete', 'tag')) deleteMutation.mutate(deleteTarget.id);
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
            const doc = offlineItems.find((i) => i.id === embeddedDiscardTarget.docId);
            if (doc) {
              updateItemData(doc.id, {
                tagNames: (doc.data.tagNames ?? []).filter(
                  (n) => n !== embeddedDiscardTarget.tagName,
                ),
              });
            }
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
  listItem: {
    paddingLeft: 16,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginLeft: 8,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
