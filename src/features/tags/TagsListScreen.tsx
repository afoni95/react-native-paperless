import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Searchbar, FAB, List, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { tagsApi } from '@/api';
import { ManageStackParamList } from '@/navigation/types';
import { Tag } from '@/types';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'TagsList'>;

export const TagsListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  const {
    data: tags,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['tags-all'],
    queryFn: tagsApi.getAllTags,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tagsApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags-all'] });
      setDeleteTarget(null);
    },
  });

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
        <ErrorBanner message={error?.message ?? t('common.somethingWentWrong')} onRetry={refetch} />
      )}

      <FlatList
        data={filteredTags}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={t('tags.documents', { count: item.document_count })}
            left={() => (
              <View style={[styles.colorDot, { backgroundColor: item.color || '#ccc' }]} />
            )}
            right={(props) => (
              <View style={styles.itemActions}>
                <List.Icon {...props} icon="pencil" />
              </View>
            )}
            onPress={() => navigation.navigate('TagEdit', { tagId: item.id })}
            onLongPress={() => setDeleteTarget(item)}
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

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('TagEdit', {})}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('tags.deleteConfirm')}
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
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
});
