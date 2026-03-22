import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Searchbar, FAB, List, useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePermissionContext } from '@/hooks/PermissionProvider';

import { ManageStackParamList } from '@/navigation/types';
import { StoragePath } from '@/types';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';
import { useAllStoragePaths, useDeleteStoragePath } from '@/reactQuery';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'StoragePathsList'>;

export const StoragePathsListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StoragePath | null>(null);

  const {
    data: storagePaths,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAllStoragePaths();

  const deleteMutation = useDeleteStoragePath({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const filteredStoragePaths = useMemo(() => {
    if (!storagePaths) return [];
    if (!searchQuery) return storagePaths;
    return storagePaths.filter(
      (sp) =>
        sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sp.path.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [storagePaths, searchQuery]);

  const { can } = usePermissionContext();
  const canAddStoragePath = can('add', 'storagepath');

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
        data={filteredStoragePaths}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={
              <View>
                <Text style={styles.pathPreview}>{item.path}</Text>
                <Text style={styles.documentCount}>
                  {t('storagePaths.documents', { count: item.document_count })}
                </Text>
              </View>
            }
            right={(props) => (
              <View style={styles.itemActions}>
                <List.Icon {...props} icon="pencil" />
              </View>
            )}
            onPress={() =>
              can('change', 'storagepath') &&
              navigation.navigate('StoragePathEdit', { storagePathId: item.id })
            }
            onLongPress={() => can('delete', 'storagepath') && setDeleteTarget(item)}
            style={styles.listItem}
          />
        )}
        contentContainerStyle={
          filteredStoragePaths.length === 0 ? styles.emptyContainer : undefined
        }
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

      {canAddStoragePath && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => navigation.navigate('StoragePathEdit', {})}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('storagePaths.deleteConfirm')}
        destructive
        onConfirm={() => {
          if (deleteTarget && can('delete', 'storagepath')) deleteMutation.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
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
  pathPreview: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  documentCount: {
    fontSize: 12,
    marginTop: 2,
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
});
