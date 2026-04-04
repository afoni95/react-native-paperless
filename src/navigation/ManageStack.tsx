import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ManagementOverviewScreen } from '@/features/manage/ManagementOverviewScreen';
import { SettingsScreen } from '@/features/manage/SettingsScreen';
import { TasksListScreen } from '@/features/manage/TasksListScreen';
import { TagsListScreen } from '@/features/manage/tags/TagsListScreen';
import { TagEditScreen } from '@/features/manage/tags/TagEditScreen';
import { CorrespondentsListScreen } from '@/features/manage/correspondents/CorrespondentsListScreen';
import { CorrespondentEditScreen } from '@/features/manage/correspondents/CorrespondentEditScreen';
import { DocumentTypesListScreen } from '@/features/manage/document-types/DocumentTypesListScreen';
import { DocumentTypeEditScreen } from '@/features/manage/document-types/DocumentTypeEditScreen';
import { StoragePathsListScreen } from '@/features/manage/storage/StoragePathsListScreen';
import { StoragePathEditScreen } from '@/features/manage/storage/StoragePathEditScreen';
import { CustomFieldsListScreen } from '@/features/manage/custom-fields/CustomFieldsListScreen';
import { CustomFieldEditScreen } from '@/features/manage/custom-fields/CustomFieldEditScreen';
import { WorkflowsListScreen } from '@/features/manage/workflows/WorkflowsListScreen';
import { WorkflowEditScreen } from '@/features/manage/workflows/WorkflowEditScreen';
import { TriggerEditScreen } from '@/features/manage/workflows/TriggerEditScreen';
import { ActionEditScreen } from '@/features/manage/workflows/ActionEditScreen';
import { TrashBinScreen } from '@/features/manage/TrashBinScreen';
import { LogsScreen } from '@/features/manage/LogsScreen';
import { UsersListScreen } from '@/features/manage/users/UsersListScreen';
import { UserEditScreen } from '@/features/manage/users/UserEditScreen';
import { GroupsListScreen } from '@/features/manage/groups/GroupsListScreen';
import { GroupEditScreen } from '@/features/manage/groups/GroupEditScreen';
import { ManageStackParamList } from './types';

const Stack = createNativeStackNavigator<ManageStackParamList>();

export const ManageStack: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ManageHome"
        component={ManagementOverviewScreen}
        options={{ title: t('manage.title') }}
      />
      <Stack.Screen
        name="TagsList"
        component={TagsListScreen}
        options={{ title: t('tags.title') }}
      />
      <Stack.Screen
        name="TagEdit"
        component={TagEditScreen}
        options={({ route }) => ({
          title: route.params?.tagId ? t('tags.editTag') : t('tags.createTag'),
        })}
      />
      <Stack.Screen
        name="CorrespondentsList"
        component={CorrespondentsListScreen}
        options={{ title: t('correspondents.title') }}
      />
      <Stack.Screen
        name="CorrespondentEdit"
        component={CorrespondentEditScreen}
        options={({ route }) => ({
          title: route.params?.correspondentId
            ? t('correspondents.editCorrespondent')
            : t('correspondents.createCorrespondent'),
        })}
      />
      <Stack.Screen
        name="DocumentTypesList"
        component={DocumentTypesListScreen}
        options={{ title: t('documentTypes.title') }}
      />
      <Stack.Screen
        name="DocumentTypeEdit"
        component={DocumentTypeEditScreen}
        options={({ route }) => ({
          title: route.params?.documentTypeId
            ? t('documentTypes.editDocumentType')
            : t('documentTypes.createDocumentType'),
        })}
      />
      <Stack.Screen
        name="StoragePathsList"
        component={StoragePathsListScreen}
        options={{ title: t('storagePaths.title') }}
      />
      <Stack.Screen
        name="StoragePathEdit"
        component={StoragePathEditScreen}
        options={({ route }) => ({
          title: route.params?.storagePathId
            ? t('storagePaths.editStoragePath')
            : t('storagePaths.createStoragePath'),
        })}
      />
      <Stack.Screen
        name="CustomFieldsList"
        component={CustomFieldsListScreen}
        options={{ title: t('customFields.title') }}
      />
      <Stack.Screen
        name="CustomFieldEdit"
        component={CustomFieldEditScreen}
        options={({ route }) => ({
          title: route.params?.customFieldId
            ? t('customFields.editCustomField')
            : t('customFields.createCustomField'),
        })}
      />
      <Stack.Screen
        name="WorkflowsList"
        component={WorkflowsListScreen}
        options={{ title: t('workflows.title') }}
      />
      <Stack.Screen
        name="WorkflowEdit"
        component={WorkflowEditScreen}
        options={({ route }) => ({
          title: route.params?.workflowId
            ? t('workflows.editWorkflow')
            : t('workflows.createWorkflow'),
        })}
      />
      <Stack.Screen
        name="TriggerEdit"
        component={TriggerEditScreen}
        options={{ title: t('workflows.editTrigger') }}
      />
      <Stack.Screen
        name="ActionEdit"
        component={ActionEditScreen}
        options={{ title: t('workflows.editAction') }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('common.settings') }}
      />
      <Stack.Screen
        name="TrashBin"
        component={TrashBinScreen}
        options={{ title: t('trash.title') }}
      />
      <Stack.Screen name="LogsView" component={LogsScreen} options={{ title: t('manage.logs') }} />
      <Stack.Screen
        name="TasksList"
        component={TasksListScreen}
        options={{ title: t('tasks.title') }}
      />
      <Stack.Screen
        name="UsersList"
        component={UsersListScreen}
        options={{ title: t('manage.users') }}
      />
      <Stack.Screen
        name="UserEdit"
        component={UserEditScreen}
        options={({ route }) => ({
          title: route.params?.userId ? t('manage.editUser') : t('manage.createUser'),
        })}
      />
      <Stack.Screen
        name="GroupsList"
        component={GroupsListScreen}
        options={{ title: t('manage.groups') }}
      />
      <Stack.Screen
        name="GroupEdit"
        component={GroupEditScreen}
        options={({ route }) => ({
          title: route.params?.groupId ? t('manage.editGroup') : t('manage.createGroup'),
        })}
      />
    </Stack.Navigator>
  );
};
