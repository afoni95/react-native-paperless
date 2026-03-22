import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Searchbar, FAB, List, useTheme, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePermissionContext } from '@/hooks/PermissionProvider';

import { ManageStackParamList } from '@/navigation/types';
import { CustomField, CUSTOM_FIELD_DATA_TYPES } from '@/types';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';
import { useAllCustomFields, useDeleteCustomField } from '@/reactQuery';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'CustomFieldsList'>;

export const CustomFieldsListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CustomField | null>(null);

  const {
    data: customFields,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAllCustomFields();

  const deleteMutation = useDeleteCustomField({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const { can } = usePermissionContext();
  const canAddCustomField = can('add', 'customfield');

  const filteredCustomFields = useMemo(() => {
    if (!customFields) return [];
    if (!searchQuery) return customFields;
    return customFields.filter((field) =>
      field.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [customFields, searchQuery]);

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
        data={filteredCustomFields}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={
              item.document_count >= 1
                ? t('customFields.documentsUsingField', { count: item.document_count })
                : t('customFields.unused')
            }
            right={(props) => (
              <View style={styles.itemActions}>
                <Chip
                  mode="outlined"
                  compact
                  style={styles.typeChip}
                  textStyle={styles.typeChipText}
                >
                  {CUSTOM_FIELD_DATA_TYPES[item.data_type as keyof typeof CUSTOM_FIELD_DATA_TYPES]}
                </Chip>
                <List.Icon {...props} icon="pencil" />
              </View>
            )}
            onPress={() =>
              can('change', 'customfield') &&
              navigation.navigate('CustomFieldEdit', { customFieldId: item.id })
            }
            onLongPress={() => can('delete', 'customfield') && setDeleteTarget(item)}
            style={styles.listItem}
          />
        )}
        contentContainerStyle={
          filteredCustomFields.length === 0 ? styles.emptyContainer : undefined
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

      {canAddCustomField && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => navigation.navigate('CustomFieldEdit', {})}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('customFields.deleteConfirm')}
        destructive
        onConfirm={() => {
          if (deleteTarget && can('delete', 'customfield')) deleteMutation.mutate(deleteTarget.id);
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
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeChip: {
    marginRight: 8,
  },
  typeChipText: {
    fontSize: 11,
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
