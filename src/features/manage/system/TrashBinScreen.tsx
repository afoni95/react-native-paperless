import React, { useState, useLayoutEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { List, useTheme, Button, Snackbar, IconButton, Text, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { documentsApi } from '@/api';
import { Document } from '@/types';
import { ManageStackParamList } from '@/navigation/types';
import { LoadingScreen, EmptyState, ErrorBanner, ConfirmDialog } from '@/components';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { useTrashDocuments, useRestoreDocuments, useEmptyTrash } from '@/reactQuery';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { useOfflineNavigationTitle } from '@/hooks/useOfflineNavigationTitle';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'TrashBin'>;

export const TrashBinScreen: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [restoreTarget, setRestoreTarget] = useState<Document | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [emptyConfirmVisible, setEmptyConfirmVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const { data: trashData, isLoading, isError, error, refetch, isRefetching } = useTrashDocuments();

  const documents = trashData?.results ?? [];

  const { can } = usePermissionContext();
  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;
  useOfflineNavigationTitle(t('manage.trashBin'));

  const restoreMutation = useRestoreDocuments({
    onSuccess: async (_, ids) => {
      // Reprocess each restored document to regenerate thumbnails
      await Promise.allSettled(ids.map((id) => documentsApi.reprocessDocument(id)));

      setRestoreTarget(null);
      setSnackbar({ visible: true, message: t('trash.restoreSuccess') });
    },
    onError: () => {
      setRestoreTarget(null);
      setSnackbar({ visible: true, message: t('trash.restoreError') });
    },
  });

  const deleteMutation = useEmptyTrash({
    onSuccess: () => {
      setDeleteTarget(null);
      setSnackbar({ visible: true, message: t('trash.deleteSuccess') });
    },
    onError: () => {
      setDeleteTarget(null);
      setSnackbar({ visible: true, message: t('trash.deleteError') });
    },
  });

  const emptyMutation = useEmptyTrash({
    onSuccess: () => {
      setEmptyConfirmVisible(false);
      setSnackbar({ visible: true, message: t('trash.emptySuccess') });
    },
    onError: () => {
      setEmptyConfirmVisible(false);
      setSnackbar({ visible: true, message: t('trash.emptyError') });
    },
  });

  // Add "Empty Trash" button to the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        documents.length > 0 && can('delete', 'document') && !isOffline ? (
          <IconButton
            icon="trash-can-outline"
            iconColor={theme.colors.error}
            onPress={() => setEmptyConfirmVisible(true)}
            disabled={emptyMutation.isPending}
          />
        ) : null,
    });
  }, [navigation, documents.length, theme.colors.error, emptyMutation.isPending, can, isOffline]);
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isError ? (
        <ErrorBanner
          message={error instanceof Error ? error.message : t('trash.loadError')}
          onRetry={refetch}
        />
      ) : null}

      {documents.length > 0 ? (
        <View style={[styles.header, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {documents.length === 1 ? '1 document' : `${documents.length} documents`}
          </Text>
          {can('delete', 'document') && !isOffline ? (
            <Button
              mode="text"
              textColor={theme.colors.error}
              compact
              onPress={() => setEmptyConfirmVisible(true)}
              disabled={emptyMutation.isPending}
            >
              {t('trash.emptyTrash')}
            </Button>
          ) : null}
        </View>
      ) : null}

      <FlatList
        data={documents}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={
              item.deleted_at
                ? t('trash.deletedOn', { date: formatDate(item.deleted_at) })
                : formatDate(item.created)
            }
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            right={() => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {can('change', 'document') ? (
                  <Button
                    mode="text"
                    compact
                    onPress={() => setRestoreTarget(item)}
                    disabled={restoreMutation.isPending || deleteMutation.isPending}
                  >
                    {t('trash.restore')}
                  </Button>
                ) : null}
                {can('delete', 'document') ? (
                  <Button
                    mode="text"
                    textColor={theme.colors.error}
                    compact
                    onPress={() => setDeleteTarget(item)}
                    disabled={restoreMutation.isPending || deleteMutation.isPending}
                  >
                    {t('trash.deletePermanently')}
                  </Button>
                ) : null}
              </View>
            )}
            style={styles.listItem}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={documents.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={<EmptyState message={t('trash.empty')} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      />

      {/* Restore single document */}
      <ConfirmDialog
        visible={!!restoreTarget}
        title={t('trash.restore')}
        message={t('trash.restoreConfirm', { title: restoreTarget?.title ?? '' })}
        confirmLabel={t('trash.restore')}
        onConfirm={() => {
          if (restoreTarget && can('change', 'document'))
            restoreMutation.mutate([restoreTarget.id]);
        }}
        onCancel={() => setRestoreTarget(null)}
      />

      {/* Delete single document permanently */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('trash.deletePermanently')}
        message={t('trash.deleteConfirm', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('trash.deletePermanently')}
        destructive
        onConfirm={() => {
          if (deleteTarget && can('delete', 'document')) deleteMutation.mutate([deleteTarget.id]);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Empty entire trash */}
      <ConfirmDialog
        visible={emptyConfirmVisible}
        title={t('trash.emptyTrash')}
        message={t('trash.emptyTrashConfirm', { count: documents.length })}
        confirmLabel={t('trash.emptyTrash')}
        destructive
        onConfirm={() => emptyMutation.mutate(undefined)}
        onCancel={() => setEmptyConfirmVisible(false)}
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  listItem: {
    paddingVertical: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
