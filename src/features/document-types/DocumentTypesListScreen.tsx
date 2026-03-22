import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Searchbar, FAB, List, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { usePermissionContext } from '@/hooks/PermissionProvider';

import { DocumentType } from '@/types';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useAllDocumentTypes, useDeleteDocumentType } from '@/reactQuery';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'DocumentTypesList'>;

export const DocumentTypesListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DocumentType | null>(null);

  const { data: types, isLoading, isError, error, refetch, isRefetching } = useAllDocumentTypes();

  const deleteMutation = useDeleteDocumentType({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const { can } = usePermissionContext();
  const canAddDocumentType = can('add', 'documenttype');

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
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={t('documentTypes.documents', { count: item.document_count })}
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            right={(props) => <List.Icon {...props} icon="pencil" />}
            onPress={() => can('change', 'documenttype') && navigation.navigate('DocumentTypeEdit', { documentTypeId: item.id })}
            onLongPress={() => can('delete', 'documenttype') && setDeleteTarget(item)}
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
});
