import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { List, useTheme, Snackbar, IconButton, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { TaskStatus } from '@/types';
import { LoadingScreen, EmptyState, ErrorBanner } from '@/components';
import { useAllTasks, useAcknowledgeTasks } from '@/reactQuery';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { useOfflineNavigationTitle } from '@/hooks/useOfflineNavigationTitle';

export const TasksListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { can } = usePermissionContext();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  useOfflineNavigationTitle(t('manage.tasks'));

  const { data: tasks, isLoading, isError, error, refetch, isRefetching } = useAllTasks();

  const acknowledgeMutation = useAcknowledgeTasks({
    onSuccess: () => {
      setSnackbarMessage(t('tasks.acknowledged'));
      setSnackbarVisible(true);
    },
  });

  const getStatusColor = (status: TaskStatus['status']) => {
    switch (status) {
      case 'PENDING':
        return '#FFC107';
      case 'STARTED':
        return '#2196F3';
      case 'SUCCESS':
        return '#4CAF50';
      case 'FAILURE':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: TaskStatus['status']) => {
    const statusKey = status.toLowerCase();
    return t(`tasks.${statusKey}`, status);
  };

  const handleAcknowledgeTask = (task: TaskStatus) => {
    acknowledgeMutation.mutate([task.id]);
  };

  const handleAcknowledgeAll = () => {
    const successfulTasks =
      tasks?.filter((task) => task.status === 'SUCCESS').map((task) => task.id) ?? [];
    if (successfulTasks.length > 0) {
      acknowledgeMutation.mutate(successfulTasks);
    }
  };

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <List.Subheader style={styles.sectionHeader}>{t('tasks.recentTasks')}</List.Subheader>
            <Button
              mode="text"
              onPress={handleAcknowledgeAll}
              disabled={
                !can('change', 'paperlesstask') ||
                acknowledgeMutation.isPending ||
                !tasks?.some((task) => task.status === 'SUCCESS')
              }
              style={styles.acknowledgeAllButton}
            >
              {t('tasks.acknowledgeAll')}
            </Button>
          </View>
        }
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <List.Item
              title={item.task_file_name}
              description={`${getStatusLabel(item.status)} • ${new Date(item.date_created).toLocaleDateString()}`}
              left={() => (
                <View style={styles.statusIndicator}>
                  <View
                    style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]}
                  />
                </View>
              )}
              right={() =>
                item.status === 'SUCCESS' ? (
                  <IconButton
                    icon="check"
                    size={20}
                    onPress={() => handleAcknowledgeTask(item)}
                    disabled={!can('change', 'paperlesstask') || acknowledgeMutation.isPending}
                  />
                ) : null
              }
              style={styles.listItem}
            />
            {item.result && (
              <View style={styles.resultContainer}>
                <List.Item title={t('tasks.loaded')} description={item.result} />
              </View>
            )}
          </View>
        )}
        contentContainerStyle={tasks && tasks.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          isError ? (
            <ErrorBanner
              message={(error as Error)?.message ?? t('tasks.loadError')}
              onRetry={refetch}
            />
          ) : (
            <EmptyState message={t('tasks.empty')} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    flex: 1,
  },
  acknowledgeAllButton: {
    marginRight: 8,
  },
  taskCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listItem: {
    paddingLeft: 16,
  },
  statusIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  resultContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
