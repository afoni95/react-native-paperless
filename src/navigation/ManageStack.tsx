import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ManagementOverviewScreen } from '@/features/manage/ManagementOverviewScreen';
import { SettingsScreen } from '@/features/manage/system/SettingsScreen';
import { DisplayScreen } from '@/features/manage/DisplayScreen';
import { TasksListScreen } from '@/features/manage/system/TasksListScreen';
import { TagsListScreen } from '@/features/manage/master-data/tags/TagsListScreen';
import { TagEditScreen } from '@/features/manage/master-data/tags/TagEditScreen';
import { CorrespondentsListScreen } from '@/features/manage/master-data/correspondents/CorrespondentsListScreen';
import { CorrespondentEditScreen } from '@/features/manage/master-data/correspondents/CorrespondentEditScreen';
import { DocumentTypesListScreen } from '@/features/manage/master-data/document-types/DocumentTypesListScreen';
import { DocumentTypeEditScreen } from '@/features/manage/master-data/document-types/DocumentTypeEditScreen';
import { StoragePathsListScreen } from '@/features/manage/master-data/storage-paths/StoragePathsListScreen';
import { StoragePathEditScreen } from '@/features/manage/master-data/storage-paths/StoragePathEditScreen';
import { CustomFieldsListScreen } from '@/features/manage/master-data/custom-fields/CustomFieldsListScreen';
import { CustomFieldEditScreen } from '@/features/manage/master-data/custom-fields/CustomFieldEditScreen';
import { WorkflowsListScreen } from '@/features/manage/workflows/WorkflowsListScreen';
import { WorkflowEditScreen } from '@/features/manage/workflows/WorkflowEditScreen';
import { TriggerEditScreen } from '@/features/manage/workflows/TriggerEditScreen';
import { ActionEditScreen } from '@/features/manage/workflows/ActionEditScreen';
import { TrashBinScreen } from '@/features/manage/system/TrashBinScreen';
import { LogsScreen } from '@/features/manage/system/LogsScreen';
import { UsersListScreen } from '@/features/manage/access/users/UsersListScreen';
import { UserEditScreen } from '@/features/manage/access/users/UserEditScreen';
import { GroupsListScreen } from '@/features/manage/access/groups/GroupsListScreen';
import { GroupEditScreen } from '@/features/manage/access/groups/GroupEditScreen';
import { MailAccountsListScreen } from '@/features/manage/mail/mail-accounts/MailAccountsListScreen';
import { MailAccountEditScreen } from '@/features/manage/mail/mail-accounts/MailAccountEditScreen';
import { MailRulesListScreen } from '@/features/manage/mail/mail-rules/MailRulesListScreen';
import { MailRuleEditScreen } from '@/features/manage/mail/mail-rules/MailRuleEditScreen';
import { ProcessedMailScreen } from '@/features/manage/mail/processed-mail/ProcessedMailScreen';
import { MailOverviewScreen } from '@/features/manage/mail/MailOverviewScreen';
import { SystemOverviewScreen } from '@/features/manage/system/SystemOverviewScreen';
import { MasterDataOverviewScreen } from '@/features/manage/master-data/MasterDataOverviewScreen';
import { AccessOverviewScreen } from '@/features/manage/access/AccessOverviewScreen';
import { AboutScreen } from '@/features/manage/AboutScreen';
import { ManageStackParamList } from './types';
import { PendingSyncScreen } from '@/features/manage/system/PendingSyncScreen';
import { OfflineTagCreateScreen } from '@/features/manage/master-data/tags/OfflineTagCreateScreen';
import { OfflineCorrespondentCreateScreen } from '@/features/manage/master-data/correspondents/OfflineCorrespondentCreateScreen';
import { OfflineDocTypeCreateScreen } from '@/features/manage/master-data/document-types/OfflineDocTypeCreateScreen';
import { ShareLinksListScreen } from '@/features/manage/share-links/ShareLinksListScreen';
import { ShareLinkCreateScreen } from '@/features/manage/share-links/ShareLinkCreateScreen';

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
        name="Display"
        component={DisplayScreen}
        options={{ title: t('manage.display') }}
      />
      <Stack.Screen
        name="SystemOverview"
        component={SystemOverviewScreen}
        options={{ title: t('manage.system') }}
      />
      <Stack.Screen
        name="MasterDataOverview"
        component={MasterDataOverviewScreen}
        options={{ title: t('manage.masterData') }}
      />
      <Stack.Screen
        name="AccessOverview"
        component={AccessOverviewScreen}
        options={{ title: t('manage.access') }}
      />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: t('manage.about') }} />
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
      <Stack.Screen
        name="MailOverview"
        component={MailOverviewScreen}
        options={{ title: t('manage.mail') }}
      />
      <Stack.Screen
        name="MailAccountsList"
        component={MailAccountsListScreen}
        options={{ title: t('mailAccounts.title') }}
      />
      <Stack.Screen
        name="MailAccountEdit"
        component={MailAccountEditScreen}
        options={({ route }) => ({
          title: route.params?.mailAccountId
            ? t('mailAccounts.editMailAccount')
            : t('mailAccounts.createMailAccount'),
        })}
      />
      <Stack.Screen
        name="MailRulesList"
        component={MailRulesListScreen}
        options={{ title: t('mailRules.title') }}
      />
      <Stack.Screen
        name="MailRuleEdit"
        component={MailRuleEditScreen}
        options={({ route }) => ({
          title: route.params?.mailRuleId
            ? t('mailRules.editMailRule')
            : t('mailRules.createMailRule'),
        })}
      />
      <Stack.Screen
        name="ProcessedMailList"
        component={ProcessedMailScreen}
        options={{ title: t('processedMail.title') }}
      />
      <Stack.Screen
        name="PendingSync"
        component={PendingSyncScreen}
        options={{ title: t('offline.pendingSync') }}
      />
      <Stack.Screen
        name="OfflineTagCreate"
        component={OfflineTagCreateScreen}
        options={{ title: t('offline.createTag') }}
      />
      <Stack.Screen
        name="OfflineCorrespondentCreate"
        component={OfflineCorrespondentCreateScreen}
        options={{ title: t('offline.createCorrespondent') }}
      />
      <Stack.Screen
        name="OfflineDocTypeCreate"
        component={OfflineDocTypeCreateScreen}
        options={{ title: t('offline.createDocumentType') }}
      />
      <Stack.Screen
        name="ShareLinksList"
        component={ShareLinksListScreen}
        options={{ title: t('shareLinks.title') }}
      />
      <Stack.Screen
        name="ShareLinkCreate"
        component={ShareLinkCreateScreen}
        options={{ title: t('shareLinks.createShareLink') }}
      />
    </Stack.Navigator>
  );
};
