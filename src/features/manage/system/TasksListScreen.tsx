import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { List, Snackbar, IconButton, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { TaskStatus } from '@/types';
import { usePaperTheme } from '@/theme';
import { LoadingScreen, EmptyState, ErrorBanner } from '@/components';
import { useAllTasks, useAcknowledgeTasks } from '@/reactQuery';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { useOfflineNavigationTitle } from '@/hooks/useOfflineNavigationTitle';

export const TasksListScreen: React.FC = () => {
  const theme = usePaperTheme();
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
        return theme.statusColors.warning;
      case 'STARTED':
        return theme.statusColors.info;
      case 'SUCCESS':
        return theme.statusColors.success;
      case 'FAILURE':
        return theme.statusColors.error;
      default:
        return theme.statusColors.neutral;
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
          <View
            style={[
              styles.taskCard,
              {
                backgroundColor: theme.colors.elevation.level1,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          >
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
            {item.result ? (
              <View
                style={[
                  styles.resultContainer,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderTopColor: theme.colors.outlineVariant,
                  },
                ]}
              >
                <List.Item title={t('tasks.loaded')} description={item.result} />
              </View>
            ) : null}
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
    borderRadius: 8,
    overflow: 'hidden',
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
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
