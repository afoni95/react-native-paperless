import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ManagementOverviewScreen } from '@/features/manage/ManagementOverviewScreen';
import { SettingsScreen } from '@/features/manage/SettingsScreen';
import { TasksListScreen } from '@/features/manage/TasksListScreen';
import { TagsListScreen } from '@/features/tags/TagsListScreen';
import { TagEditScreen } from '@/features/tags/TagEditScreen';
import { CorrespondentsListScreen } from '@/features/correspondents/CorrespondentsListScreen';
import { CorrespondentEditScreen } from '@/features/correspondents/CorrespondentEditScreen';
import { DocumentTypesListScreen } from '@/features/document-types/DocumentTypesListScreen';
import { DocumentTypeEditScreen } from '@/features/document-types/DocumentTypeEditScreen';
import { StoragePathsListScreen } from '@/features/manage/StoragePathsListScreen';
import { StoragePathEditScreen } from '@/features/manage/StoragePathEditScreen';
import { CustomFieldsListScreen } from '@/features/custom-fields/CustomFieldsListScreen';
import { CustomFieldEditScreen } from '@/features/custom-fields/CustomFieldEditScreen';
import { TrashBinScreen } from '@/features/manage/TrashBinScreen';
import { LogsScreen } from '@/features/manage/LogsScreen';
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
    </Stack.Navigator>
  );
};
