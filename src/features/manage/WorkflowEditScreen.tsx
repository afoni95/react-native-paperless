import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, List, useTheme, IconButton, Switch, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { WorkflowTrigger, WorkflowAction } from '@/types/workflows';
import { LoadingScreen, ConfirmDialog } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useWorkflow, useUpsertWorkflow, useDeleteWorkflow } from '@/reactQuery/workflows';
import { getTriggerTypeName, getActionTypeName } from '@/utils/workflowHelpers';

type Props = NativeStackScreenProps<ManageStackParamList, 'WorkflowEdit'>;

export const WorkflowEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const workflowId = route.params?.workflowId;
  const isNew = !workflowId;

  const [name, setName] = useState('');
  const [order, setOrder] = useState('0');
  const [enabled, setEnabled] = useState(true);
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([]);
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: workflow, isLoading } = useWorkflow(workflowId!, !!workflowId);

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setOrder(workflow.order.toString());
      setEnabled(workflow.enabled);
      setTriggers(workflow.triggers);
      setActions(workflow.actions);
    }
  }, [workflow]);

  useEffect(() => {
    const triggerResult = route.params?.triggerResult;
    if (!triggerResult) {
      return;
    }

    if (triggerResult.mode === 'delete') {
      setTriggers((prev) => prev.filter((trigger) => trigger.id !== triggerResult.triggerId));
    } else {
      setTriggers((prev) => {
        const nextTrigger = triggerResult.trigger;

        if (nextTrigger.id) {
          const hasExistingTrigger = prev.some((trigger) => trigger.id === nextTrigger.id);

          if (hasExistingTrigger) {
            return prev.map((trigger) =>
              trigger.id === nextTrigger.id
                ? ({ ...trigger, ...(nextTrigger as WorkflowTrigger) } as WorkflowTrigger)
                : trigger,
            );
          }
        }

        const id = nextTrigger.id ?? Date.now();
        return [...prev, { id, ...(nextTrigger as Partial<WorkflowTrigger>) } as WorkflowTrigger];
      });
    }

    navigation.setParams({ triggerResult: undefined });
  }, [navigation, route.params?.triggerResult]);

  useEffect(() => {
    const actionResult = route.params?.actionResult;
    if (!actionResult) {
      return;
    }

    if (actionResult.mode === 'delete') {
      setActions((prev) => prev.filter((action) => action.id !== actionResult.actionId));
    } else {
      setActions((prev) => {
        const nextAction = actionResult.action;

        if (nextAction.id) {
          const hasExistingAction = prev.some((action) => action.id === nextAction.id);

          if (hasExistingAction) {
            return prev.map((action) =>
              action.id === nextAction.id
                ? ({ ...action, ...(nextAction as WorkflowAction) } as WorkflowAction)
                : action,
            );
          }
        }

        const id = nextAction.id ?? Date.now();
        return [...prev, { id, ...(nextAction as Partial<WorkflowAction>) } as WorkflowAction];
      });
    }

    navigation.setParams({ actionResult: undefined });
  }, [navigation, route.params?.actionResult]);

  const saveMutation = useUpsertWorkflow({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const deleteMutation = useDeleteWorkflow({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('workflows.nameRequired'));
      return;
    }

    saveMutation.mutate({
      id: workflowId,
      name,
      order: parseInt(order, 10) || 0,
      enabled,
      triggers: triggers as Omit<WorkflowTrigger, 'id'>[],
      actions: actions as Omit<WorkflowAction, 'id'>[],
    });
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    deleteMutation.mutate(workflowId!);
  };

  const handleAddTrigger = () => {
    navigation.navigate('TriggerEdit', {
      workflowId: workflowId || 0,
    });
  };

  const handleEditTrigger = (trigger: WorkflowTrigger) => {
    navigation.navigate('TriggerEdit', {
      workflowId: workflowId || 0,
      triggerId: trigger.id,
      trigger,
    });
  };

  const handleAddAction = () => {
    navigation.navigate('ActionEdit', {
      workflowId: workflowId || 0,
    });
  };

  const handleEditAction = (action: WorkflowAction) => {
    navigation.navigate('ActionEdit', {
      workflowId: workflowId || 0,
      actionId: action.id,
      action,
    });
  };

  const formatSummary = (summary: string[]): string => {
    if (summary.length === 0) {
      return t('common.none');
    }

    if (summary.length <= 3) {
      return summary.join(' • ');
    }

    const visible = summary.slice(0, 3).join('•');
    return `${visible}•${t('workflows.andMore', { count: summary.length - 3 })}`;
  };

  const buildTriggerSummary = (trigger: WorkflowTrigger): string => {
    const summary: string[] = [];

    if (trigger.filter_filename?.trim()) {
      summary.push(`${t('workflows.filterFilename')}: ${trigger.filter_filename.trim()}`);
    }

    if (trigger.filter_path?.trim() && trigger.filter_path.trim() !== '*') {
      summary.push(`${t('workflows.filterPath')}: ${trigger.filter_path.trim()}`);
    }

    if (trigger.match?.trim()) {
      summary.push(`${t('workflows.match')}: ${trigger.match.trim()}`);
    }

    if (trigger.filter_has_tags?.length) {
      summary.push(`${t('workflows.filterHasTags')}: ${trigger.filter_has_tags.length}`);
    }

    if (trigger.filter_has_all_tags?.length) {
      summary.push(`${t('workflows.filterHasAllTags')}: ${trigger.filter_has_all_tags.length}`);
    }

    if (trigger.filter_has_not_tags?.length) {
      summary.push(`${t('workflows.filterHasNotTags')}: ${trigger.filter_has_not_tags.length}`);
    }

    if (trigger.filter_has_correspondent) {
      summary.push(t('workflows.assignCorrespondent'));
    }

    if (trigger.filter_has_document_type) {
      summary.push(t('workflows.assignDocumentType'));
    }

    if (trigger.filter_has_storage_path) {
      summary.push(t('workflows.assignStoragePath'));
    }

    if (trigger.type === 4) {
      summary.push(`${t('workflows.scheduleOffsetDays')}: ${trigger.schedule_offset_days ?? 0}`);
      if (trigger.schedule_is_recurring) {
        summary.push(
          `${t('workflows.scheduleRecurringIntervalDays')}: ${trigger.schedule_recurring_interval_days ?? 1}`,
        );
      }
    }

    return formatSummary(summary);
  };

  const buildActionSummary = (action: WorkflowAction): string => {
    const summary: string[] = [];

    if (action.assign_title?.trim()) {
      summary.push(`${t('workflows.assignTitle')}: ${action.assign_title.trim()}`);
    }

    if (action.assign_tags?.length) {
      summary.push(`${t('workflows.assignTags')}: ${action.assign_tags.length}`);
    }

    if (action.assign_correspondent) {
      summary.push(t('workflows.assignCorrespondent'));
    }

    if (action.assign_document_type) {
      summary.push(t('workflows.assignDocumentType'));
    }

    if (action.assign_storage_path) {
      summary.push(t('workflows.assignStoragePath'));
    }

    if (action.assign_owner) {
      summary.push(t('workflows.assignOwner'));
    }

    if (action.remove_all_tags) {
      summary.push(t('workflows.removeAllTags'));
    } else if (action.remove_tags?.length) {
      summary.push(`${t('workflows.removeTags')}: ${action.remove_tags.length}`);
    }

    if (action.remove_all_correspondents) {
      summary.push(t('workflows.removeCorrespondent'));
    }

    if (action.remove_all_document_types) {
      summary.push(t('workflows.removeDocumentType'));
    }

    if (action.remove_all_storage_paths) {
      summary.push(t('workflows.removeStoragePath'));
    }

    if (action.remove_all_custom_fields) {
      summary.push(t('workflows.removeAllCustomFields'));
    }

    if (action.remove_all_owners) {
      summary.push(t('workflows.removeOwner'));
    }

    if (action.remove_all_permissions) {
      summary.push(t('workflows.removeAllPermissions'));
    }

    return formatSummary(summary);
  };

  if (!isNew && isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label={t('workflows.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        editable={!saveMutation.isPending}
      />

      <TextInput
        label={t('workflows.order')}
        value={order}
        onChangeText={setOrder}
        mode="outlined"
        keyboardType="number-pad"
        style={styles.input}
        editable={!saveMutation.isPending}
      />

      <View style={styles.switchRow}>
        <Text variant="bodyLarge">{t('workflows.enabled')}</Text>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          disabled={saveMutation.isPending || deleteMutation.isPending}
        />
      </View>

      <View style={styles.section}>
        <List.Subheader>{t('workflows.triggers')}</List.Subheader>
        {triggers.length === 0 ? (
          <List.Item title={t('workflows.noTriggers')} />
        ) : (
          triggers.map((trigger) => (
            <List.Item
              key={trigger.id}
              title={getTriggerTypeName(trigger.type)}
              description={buildTriggerSummary(trigger)}
              right={() => (
                <View style={styles.actionButtons}>
                  <IconButton
                    icon="pencil"
                    onPress={() => handleEditTrigger(trigger)}
                    disabled={saveMutation.isPending}
                    size={20}
                  />
                </View>
              )}
            />
          ))
        )}
        <Button
          mode="outlined"
          onPress={handleAddTrigger}
          style={styles.addButton}
          disabled={saveMutation.isPending}
        >
          {t('workflows.addTrigger')}
        </Button>
      </View>

      <View style={styles.section}>
        <List.Subheader>{t('workflows.actions')}</List.Subheader>
        {actions.length === 0 ? (
          <List.Item title={t('workflows.noActions')} />
        ) : (
          actions.map((action) => (
            <List.Item
              key={action.id}
              title={getActionTypeName(action.type)}
              description={buildActionSummary(action)}
              right={() => (
                <View style={styles.actionButtons}>
                  <IconButton
                    icon="pencil"
                    onPress={() => handleEditAction(action)}
                    disabled={saveMutation.isPending}
                    size={20}
                  />
                </View>
              )}
            />
          ))
        )}
        <Button
          mode="outlined"
          onPress={handleAddAction}
          style={styles.addButton}
          disabled={saveMutation.isPending}
        >
          {t('workflows.addAction')}
        </Button>
      </View>

      <View style={styles.buttonGroup}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saveMutation.isPending}
          disabled={saveMutation.isPending}
          style={styles.button}
        >
          {t('common.save')}
        </Button>

        {!isNew && (
          <Button
            mode="outlined"
            textColor={theme.colors.error}
            onPress={handleDelete}
            disabled={saveMutation.isPending || deleteMutation.isPending}
            style={styles.button}
          >
            {t('common.delete')}
          </Button>
        )}
      </View>

      <ConfirmDialog
        visible={showDeleteDialog}
        title={t('common.delete')}
        message={t('workflows.deleteConfirm', { name: name.trim() || workflow?.name || '' })}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  section: {
    marginVertical: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  addButton: {
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  buttonGroup: {
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  button: {
    marginVertical: 4,
  },
});
