import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Searchbar, FAB, List, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { correspondentsApi } from '@/api';
import { Correspondent } from '@/types';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';
import { formatDate } from '@/utils';
import { ManageStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'CorrespondentsList'>;

export const CorrespondentsListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Correspondent | null>(null);

  const {
    data: correspondents,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['correspondents-all'],
    queryFn: correspondentsApi.getAllCorrespondents,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => correspondentsApi.deleteCorrespondent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondents-all'] });
      setDeleteTarget(null);
    },
  });

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
        <ErrorBanner message={error?.message ?? t('common.somethingWentWrong')} onRetry={refetch} />
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={
              `${t('correspondents.documents', { count: item.document_count })}` +
              (item.last_correspondence
                ? ` · ${t('correspondents.lastCorrespondence', { date: formatDate(item.last_correspondence) })}`
                : '')
            }
            left={(props) => <List.Icon {...props} icon="account" />}
            right={(props) => <List.Icon {...props} icon="pencil" />}
            onPress={() => navigation.navigate('CorrespondentEdit', { correspondentId: item.id })}
            onLongPress={() => setDeleteTarget(item)}
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

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('CorrespondentEdit', {})}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('correspondents.deleteConfirm')}
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
  emptyContainer: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
