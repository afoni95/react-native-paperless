import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Divider, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ManageStackParamList } from '@/navigation/types';
import { usePermissionContext } from '@/hooks/PermissionProvider';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'ManageHome'>;

export const ManagementOverviewScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { can } = usePermissionContext();

  const showUsersScreen = can('view', 'user');
  const showGroupsScreen = can('view', 'group');
  const showTagsScreen = can('view', 'tag');
  const showCorrespondentsScreen = can('view', 'correspondent');
  const showDocumentTypesScreen = can('view', 'documenttype');
  const showStoragePathsScreen = can('view', 'storagepath');
  const showCustomFieldsScreen = can('view', 'customfield');
  const showWorkflowsScreen = can('view', 'workflow');
  const showTrashBinScreen = can('delete', 'document');
  const showLogEntriesScreen = can('view', 'logentry');
  const showTasksScreen = can('view', 'paperlesstask');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        {showUsersScreen ? (
          <>
            <List.Item
              title={t('manage.users')}
              left={(props) => <List.Icon {...props} icon="account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('UsersList')}
            />
            <Divider />
          </>
        ) : null}
        {showGroupsScreen ? (
          <>
            <List.Item
              title={t('manage.groups')}
              left={(props) => <List.Icon {...props} icon="account-group" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('GroupsList')}
            />
            <Divider />
          </>
        ) : null}
        {showTagsScreen ? (
          <>
            <List.Item
              title={t('manage.tags')}
              left={(props) => <List.Icon {...props} icon="tag-multiple" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('TagsList')}
            />
            <Divider />
          </>
        ) : null}
        {showCorrespondentsScreen ? (
          <>
            <List.Item
              title={t('manage.correspondents')}
              left={(props) => <List.Icon {...props} icon="account-multiple" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('CorrespondentsList')}
            />
            <Divider />
          </>
        ) : null}
        {showDocumentTypesScreen ? (
          <>
            <List.Item
              title={t('manage.documentTypes')}
              left={(props) => <List.Icon {...props} icon="file-document-multiple" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('DocumentTypesList')}
            />
            <Divider />
          </>
        ) : null}
        {showStoragePathsScreen ? (
          <>
            <List.Item
              title={t('manage.storagePaths')}
              left={(props) => <List.Icon {...props} icon="folder-multiple" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('StoragePathsList')}
            />
            <Divider />
          </>
        ) : null}
        {showCustomFieldsScreen ? (
          <>
            <List.Item
              title={t('manage.customFields')}
              left={(props) => <List.Icon {...props} icon="form-textbox" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('CustomFieldsList')}
            />
            <Divider />
          </>
        ) : null}
        {showWorkflowsScreen ? (
          <>
            <List.Item
              title={t('manage.workflows')}
              left={(props) => <List.Icon {...props} icon="git" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('WorkflowsList')}
            />
            <Divider />
          </>
        ) : null}
        {showTrashBinScreen ? (
          <>
            <List.Item
              title={t('manage.trashBin')}
              left={(props) => <List.Icon {...props} icon="trash-can" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('TrashBin')}
            />
            <Divider />
          </>
        ) : null}
        {showLogEntriesScreen ? (
          <>
            <List.Item
              title={t('manage.logs')}
              left={(props) => <List.Icon {...props} icon="file-document-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('LogsView')}
            />
            <Divider />
          </>
        ) : null}
        {showTasksScreen ? (
          <>
            <List.Item
              title={t('manage.tasks')}
              left={(props) => <List.Icon {...props} icon="clipboard-list" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('TasksList')}
            />
            <Divider />
          </>
        ) : null}
        <List.Item
          title={t('manage.settings')}
          left={(props) => <List.Icon {...props} icon="cog" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
        />
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
