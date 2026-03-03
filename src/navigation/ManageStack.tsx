import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ManageHomeScreen } from '@/features/manage/ManageHomeScreen';
import { SettingsScreen } from '@/features/manage/SettingsScreen';
import { TagsListScreen } from '@/features/tags/TagsListScreen';
import { TagEditScreen } from '@/features/tags/TagEditScreen';
import { CorrespondentsListScreen } from '@/features/correspondents/CorrespondentsListScreen';
import { CorrespondentEditScreen } from '@/features/correspondents/CorrespondentEditScreen';
import { DocumentTypesListScreen } from '@/features/document-types/DocumentTypesListScreen';
import { DocumentTypeEditScreen } from '@/features/document-types/DocumentTypeEditScreen';
import { TrashBinScreen } from '@/features/manage/TrashBinScreen';
import { ManageStackParamList } from './types';

const Stack = createNativeStackNavigator<ManageStackParamList>();

export const ManageStack: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ManageHome"
        component={ManageHomeScreen}
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
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('common.settings') }}
      />
      <Stack.Screen
        name="TrashBin"
        component={TrashBinScreen}
        options={{ title: t('trash.title') }}
      />
    </Stack.Navigator>
  );
};
