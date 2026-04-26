import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { List, useTheme, Snackbar, IconButton, Text, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';
import { useProcessedMail, useDeleteProcessedMail } from '@/reactQuery';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ProcessedMail } from '@/types';

export const ProcessedMailScreen: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { can } = usePermissionContext();

  const [deleteTarget, setDeleteTarget] = useState<ProcessedMail | null>(null);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const { data, isLoading, isError, refetch, isRefetching } = useProcessedMail({
    page_size: 100,
    ordering: '-processed',
  });

  const items = data?.results ?? [];

  const deleteMutation = useDeleteProcessedMail({
    onSuccess: () => {
      setDeleteTarget(null);
      setSnackbar({ visible: true, message: t('processedMail.deleteSuccess') });
    },
    onError: () => {
      setDeleteTarget(null);
      setSnackbar({ visible: true, message: t('processedMail.deleteError') });
    },
  });

  const getStatusColor = (status: string) => {
    if (status === 'success') return '#4CAF50';
    if (status === 'error' || status === 'invalid_rule') return '#F44336';
    return '#9E9E9E';
  };

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={{ marginHorizontal: 16, marginVertical: 16, fontSize: 16 }}>
        {t('processedMail.deleteWarning')}
      </Text>
      <Divider />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <List.Item
            title={item.subject || t('processedMail.noSubject')}
            description={`${item.folder} · ${new Date(item.processed).toLocaleDateString(i18n.language)}`}
            left={() => (
              <View style={styles.statusContainer}>
                <View
                  style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]}
                />
              </View>
            )}
            right={() =>
              can('delete', 'processedmail') ? (
                <IconButton
                  icon="delete-outline"
                  size={20}
                  onPress={() => setDeleteTarget(item)}
                  disabled={deleteMutation.isPending}
                />
              ) : null
            }
          />
        )}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          isError ? (
            <ErrorBanner message={t('processedMail.loadError')} onRetry={refetch} />
          ) : (
            <EmptyState message={t('processedMail.empty')} />
          )
        }
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title={t('common.delete')}
        message={t('processedMail.deleteConfirm', {
          subject: deleteTarget?.subject || t('processedMail.noSubject'),
        })}
        onConfirm={() => deleteTarget && deleteMutation.mutate([deleteTarget.id])}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
