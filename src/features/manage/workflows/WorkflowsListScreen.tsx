import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { List, useTheme, FAB, Switch, Snackbar, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Workflow } from '@/types/workflows';
import { LoadingScreen, EmptyState } from '@/components';
import { useAllWorkflows, useUpsertWorkflow, useDeleteWorkflow } from '@/reactQuery/workflows';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageStackParamList } from '@/navigation/types';
import { getTriggerTypeName, getActionTypeName } from '@/utils/workflowHelpers';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { useOfflineNavigationTitle } from '@/hooks/useOfflineNavigationTitle';

type Props = NativeStackScreenProps<ManageStackParamList, 'WorkflowsList'>;

export const WorkflowsListScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { can } = usePermissionContext();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;
  useOfflineNavigationTitle(t('manage.workflows'));

  const {
    data: workflows,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAllWorkflows(true);

  const updateMutation = useUpsertWorkflow({
    onSuccess: () => {
      setSnackbarMessage(t('workflows.updated'));
      setSnackbarVisible(true);
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const deleteMutation = useDeleteWorkflow({
    onSuccess: () => {
      setSnackbarMessage(t('workflows.deleted'));
      setSnackbarVisible(true);
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const handleToggleEnabled = (workflow: Workflow) => {
    if (isOffline) {
      setSnackbarMessage(t('common.unavailableOffline'));
      setSnackbarVisible(true);
      return;
    }
    updateMutation.mutate({
      id: workflow.id,
      enabled: !workflow.enabled,
      name: workflow.name,
      order: workflow.order,
      triggers: workflow.triggers,
      actions: workflow.actions,
    });
  };

  const handleDeleteWorkflow = (workflow: Workflow) => {
    if (isOffline) {
      setSnackbarMessage(t('common.unavailableOffline'));
      setSnackbarVisible(true);
      return;
    }
    Alert.alert(t('common.confirm'), t('workflows.deleteConfirm', { name: workflow.name }), [
      { text: t('common.cancel'), onPress: () => {} },
      {
        text: t('common.delete'),
        onPress: () => deleteMutation.mutate(workflow.id),
        style: 'destructive',
      },
    ]);
  };

  const getTriggerSummary = (workflow: Workflow): string => {
    if (workflow.triggers.length === 0) return t('workflows.noTriggers');
    const triggerNames = workflow.triggers
      .map((trigger) => t(getTriggerTypeName(trigger.type)))
      .join(', ');
    return triggerNames;
  };

  const getActionSummary = (workflow: Workflow): string => {
    if (workflow.actions.length === 0) return t('workflows.noActions');
    const actionNames = workflow.actions.map((a) => t(getActionTypeName(a.type))).join(', ');
    return actionNames;
  };

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  if (isError) {
    return <Text>{error instanceof Error ? error.message : t('common.error')}</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={workflows}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        ListEmptyComponent={<EmptyState message={t('workflows.createFirst')} />}
        renderItem={({ item: workflow }) => (
          <View>
            <List.Item
              key={workflow.id}
              title={workflow.name}
              description={`${t('workflows.triggers')}: ${getTriggerSummary(workflow)}`}
              left={(props) => (
                <List.Icon {...props} icon={workflow.enabled ? 'check-circle' : 'circle-outline'} />
              )}
              right={() => (
                <View style={styles.rightContainer}>
                  <Switch
                    value={workflow.enabled}
                    onValueChange={() => handleToggleEnabled(workflow)}
                    disabled={!can('change', 'workflow')}
                  />
                </View>
              )}
              onPress={() => {
                if (can('change', 'workflow')) {
                  navigation.navigate('WorkflowEdit', { workflowId: workflow.id });
                }
              }}
              onLongPress={() => {
                if (can('delete', 'workflow')) {
                  handleDeleteWorkflow(workflow);
                }
              }}
            />
            <List.Item
              title={`${t('workflows.actions')}:`}
              description={getActionSummary(workflow)}
              style={styles.descriptionItem}
            />
          </View>
        )}
      />

      {can('add', 'workflow') && !isOffline ? (
        <FAB
          icon="plus"
          style={[styles.fab, { bottom: 2, right: 2 }]}
          onPress={() => navigation.navigate('WorkflowEdit', { workflowId: undefined })}
        />
      ) : null}

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rightContainer: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  descriptionItem: {
    paddingVertical: 0,
    marginLeft: 56,
    marginRight: 16,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});
