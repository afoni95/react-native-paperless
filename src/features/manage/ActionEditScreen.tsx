import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, useTheme, List, Checkbox } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { WorkflowAction, ActionType } from '@/types/workflows';
import { ManageStackParamList } from '@/navigation/types';
import { actionTypeOptions } from '@/utils/workflowHelpers';
import { SearchableDropdown, MultiSelectChips } from '@/components';
import {
  useAllCorrespondents,
  useAllDocumentTypes,
  useAllStoragePaths,
  useAllTags,
  useUsers,
} from '@/reactQuery';
import { NonSearchableDropdown } from '@/components/NonSearchableDropdown';
import { screenStyles, buttonStyles } from '@/theme/commonStyles';

type Props = NativeStackScreenProps<ManageStackParamList, 'ActionEdit'>;

export const ActionEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { actionId } = route.params;

  const [type, setType] = useState<ActionType>(ActionType.Assignment);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignTags, setAssignTags] = useState<number[]>([]);
  const [assignCorrespondent, setAssignCorrespondent] = useState<number | null>(null);
  const [assignDocumentType, setAssignDocumentType] = useState<number | null>(null);
  const [assignStoragePath, setAssignStoragePath] = useState<number | null>(null);
  const [assignOwner, setAssignOwner] = useState<number | null>(null);
  const [assignViewUsers, setAssignViewUsers] = useState<number[]>([]);
  const [assignViewGroups, setAssignViewGroups] = useState<number[]>([]);
  const [assignChangeUsers, setAssignChangeUsers] = useState<number[]>([]);
  const [assignChangeGroups, setAssignChangeGroups] = useState<number[]>([]);
  const [removeAllTags, setRemoveAllTags] = useState(false);
  const [removeTags, setRemoveTags] = useState<number[]>([]);
  const [removeAllCorrespondents, setRemoveAllCorrespondents] = useState(false);
  const [removeCorrespondents, setRemoveCorrespondents] = useState<number[]>([]);
  const [removeAllDocumentTypes, setRemoveAllDocumentTypes] = useState(false);
  const [removeDocumentTypes, setRemoveDocumentTypes] = useState<number[]>([]);
  const [removeAllStoragePaths, setRemoveAllStoragePaths] = useState(false);
  const [removeStoragePaths, setRemoveStoragePaths] = useState<number[]>([]);
  const [removeAllCustomFields, setRemoveAllCustomFields] = useState(false);
  const [removeAllOwners, setRemoveAllOwners] = useState(false);
  const [removeAllPermissions, setRemoveAllPermissions] = useState(false);

  React.useEffect(() => {
    const existing = route.params?.action as WorkflowAction | undefined;
    if (existing) {
      setType((existing.type as ActionType) ?? ActionType.Assignment);
      setAssignTitle(existing.assign_title ?? '');
      setAssignTags(existing.assign_tags || []);
      setAssignCorrespondent(existing.assign_correspondent ?? null);
      setAssignDocumentType(existing.assign_document_type ?? null);
      setAssignStoragePath(existing.assign_storage_path ?? null);
      setAssignOwner(existing.assign_owner ?? null);
      setAssignViewUsers(existing.assign_view_users || []);
      setAssignViewGroups(existing.assign_view_groups || []);
      setAssignChangeUsers(existing.assign_change_users || []);
      setAssignChangeGroups(existing.assign_change_groups || []);
      setRemoveAllTags(!!existing.remove_all_tags);
      setRemoveTags(existing.remove_tags || []);
      setRemoveAllCorrespondents(!!existing.remove_all_correspondents);
      setRemoveCorrespondents(existing.remove_correspondents || []);
      setRemoveAllDocumentTypes(!!existing.remove_all_document_types);
      setRemoveDocumentTypes(existing.remove_document_types || []);
      setRemoveAllStoragePaths(!!existing.remove_all_storage_paths);
      setRemoveStoragePaths(existing.remove_storage_paths || []);
      setRemoveAllCustomFields(!!existing.remove_all_custom_fields);
      setRemoveAllOwners(!!existing.remove_all_owners);
      setRemoveAllPermissions(!!existing.remove_all_permissions);
    }
  }, [route.params?.action]);

  // Lookup data for dropdowns
  const { data: allCorrespondents } = useAllCorrespondents();
  const { data: allDocumentTypes } = useAllDocumentTypes();
  const { data: allStoragePaths } = useAllStoragePaths();
  const { data: allTags } = useAllTags();
  const { data: usersPage } = useUsers({ page: 1, page_size: 1000 });

  const handleSave = () => {
    if (type === ActionType.Assignment && !assignTitle.trim()) {
      Alert.alert(t('common.error'), t('workflows.titleRequired'));
      return;
    }

    const action: Partial<WorkflowAction> = {
      type,
      assign_title: assignTitle,
      assign_tags: assignTags,
      assign_correspondent: assignCorrespondent,
      assign_document_type: assignDocumentType,
      assign_storage_path: assignStoragePath,
      assign_owner: assignOwner,
      assign_view_users: assignViewUsers,
      assign_view_groups: assignViewGroups,
      assign_change_users: assignChangeUsers,
      assign_change_groups: assignChangeGroups,
      remove_all_tags: removeAllTags,
      remove_tags: removeTags,
      remove_all_correspondents: removeAllCorrespondents,
      remove_correspondents: removeCorrespondents,
      remove_all_document_types: removeAllDocumentTypes,
      remove_document_types: removeDocumentTypes,
      remove_all_storage_paths: removeAllStoragePaths,
      remove_storage_paths: removeStoragePaths,
      remove_all_custom_fields: removeAllCustomFields,
      remove_all_owners: removeAllOwners,
      remove_all_permissions: removeAllPermissions,
    };

    if (actionId) action.id = actionId;

    navigation.navigate({
      name: 'WorkflowEdit',
      params: {
        workflowId: route.params.workflowId || undefined,
        actionResult: {
          token: Date.now(),
          mode: 'save',
          action,
        },
      },
      merge: true,
    });
  };

  const handleDelete = () => {
    Alert.alert(t('common.confirm'), t('workflows.confirmDeleteAction'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          if (!actionId) {
            navigation.goBack();
            return;
          }

          navigation.navigate({
            name: 'WorkflowEdit',
            params: {
              workflowId: route.params.workflowId || undefined,
              actionResult: {
                token: Date.now(),
                mode: 'delete',
                actionId,
              },
            },
            merge: true,
          });
        },
      },
    ]);
  };

  const actionTypeOptionsTranslated = actionTypeOptions.map((opt) => ({
    id: opt.value,
    name: t(opt.label),
  }));

  return (
    <ScrollView
      style={[screenStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={screenStyles.content}
      keyboardShouldPersistTaps="handled"
    >
      <NonSearchableDropdown
        label={t('workflows.actionType')}
        items={actionTypeOptionsTranslated}
        selectedId={type}
        allowClear={false}
        onSelect={(val) => setType((val as ActionType) ?? ActionType.Assignment)}
      />

      {type === ActionType.Assignment ? (
        <>
          <List.Subheader>{t('workflows.assignmentSettings')}</List.Subheader>
          <TextInput
            label={t('workflows.assignTitle')}
            value={assignTitle}
            onChangeText={setAssignTitle}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="{{added_day}}-{{added_month}}-{{added_year}}"
          />

          {/* Correspondent */}
          <SearchableDropdown
            label={t('workflows.assignCorrespondent')}
            items={(allCorrespondents || []).map((c) => ({ id: c.id, name: c.name }))}
            selectedId={assignCorrespondent}
            allowClear
            onSelect={(val) => setAssignCorrespondent(val)}
          />

          {/* Document Type */}
          <SearchableDropdown
            label={t('workflows.assignDocumentType')}
            items={(allDocumentTypes || []).map((dt) => ({ id: dt.id, name: dt.name }))}
            selectedId={assignDocumentType}
            allowClear
            onSelect={(val) => setAssignDocumentType(val)}
          />

          {/* Storage Path */}
          <SearchableDropdown
            label={t('workflows.assignStoragePath')}
            items={(allStoragePaths || []).map((sp) => ({ id: sp.id, name: sp.name }))}
            selectedId={assignStoragePath}
            allowClear
            onSelect={(val) => setAssignStoragePath(val)}
          />

          {/* Owner (Users) */}
          <SearchableDropdown
            label={t('workflows.assignOwner')}
            items={(usersPage?.results || []).map((u) => ({
              id: u.id,
              name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
            }))}
            selectedId={assignOwner}
            allowClear
            onSelect={(val) => setAssignOwner(val)}
          />

          {/* Tags */}
          <MultiSelectChips
            chipItems={allTags || []}
            selectedIds={assignTags}
            onSelectionChange={setAssignTags}
            label={t('workflows.assignTags')}
          />
        </>
      ) : null}

      {type === ActionType.Removal ? (
        <>
          <List.Subheader>{t('workflows.removalSettings')}</List.Subheader>

          <View style={styles.checkboxContainer}>
            <List.Item
              title={t('workflows.removeAllTags')}
              left={() => (
                <Checkbox
                  status={removeAllTags ? 'checked' : 'unchecked'}
                  onPress={() => setRemoveAllTags(!removeAllTags)}
                />
              )}
            />
          </View>

          {!removeAllTags ? (
            <MultiSelectChips
              chipItems={allTags || []}
              selectedIds={removeTags}
              onSelectionChange={setRemoveTags}
              label={t('workflows.removeTags')}
            />
          ) : null}

          <View style={styles.checkboxContainer}>
            <List.Item
              title={t('workflows.removeCorrespondent')}
              left={() => (
                <Checkbox
                  status={removeAllCorrespondents ? 'checked' : 'unchecked'}
                  onPress={() => setRemoveAllCorrespondents(!removeAllCorrespondents)}
                />
              )}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <List.Item
              title={t('workflows.removeDocumentType')}
              left={() => (
                <Checkbox
                  status={removeAllDocumentTypes ? 'checked' : 'unchecked'}
                  onPress={() => setRemoveAllDocumentTypes(!removeAllDocumentTypes)}
                />
              )}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <List.Item
              title={t('workflows.removeStoragePath')}
              left={() => (
                <Checkbox
                  status={removeAllStoragePaths ? 'checked' : 'unchecked'}
                  onPress={() => setRemoveAllStoragePaths(!removeAllStoragePaths)}
                />
              )}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <List.Item
              title={t('workflows.removeAllCustomFields')}
              left={() => (
                <Checkbox
                  status={removeAllCustomFields ? 'checked' : 'unchecked'}
                  onPress={() => setRemoveAllCustomFields(!removeAllCustomFields)}
                />
              )}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <List.Item
              title={t('workflows.removeOwner')}
              left={() => (
                <Checkbox
                  status={removeAllOwners ? 'checked' : 'unchecked'}
                  onPress={() => setRemoveAllOwners(!removeAllOwners)}
                />
              )}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <List.Item
              title={t('workflows.removeAllPermissions')}
              left={() => (
                <Checkbox
                  status={removeAllPermissions ? 'checked' : 'unchecked'}
                  onPress={() => setRemoveAllPermissions(!removeAllPermissions)}
                />
              )}
            />
          </View>
        </>
      ) : null}

      <Button mode="contained" onPress={handleSave} style={buttonStyles.saveButton}>
        {t('common.apply')}
      </Button>

      <Button
        mode="outlined"
        textColor={theme.colors.error}
        onPress={handleDelete}
        style={buttonStyles.deleteButton}
      >
        {t('common.delete')}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 4,
  },
  checkboxContainer: {
    marginBottom: -12,
  },
});
