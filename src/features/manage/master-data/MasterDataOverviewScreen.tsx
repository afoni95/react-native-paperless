import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ManageStackParamList } from '@/navigation/types';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageCard } from '../../../components/ManageCard';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'MasterDataOverview'>;

export const MasterDataOverviewScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { can } = usePermissionContext();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        {can('view', 'tag') ? (
          <ManageCard
            icon="tag-multiple"
            title={t('manage.tags')}
            onPress={() => navigation.navigate('TagsList')}
          />
        ) : null}
        {can('view', 'correspondent') ? (
          <ManageCard
            icon="account-multiple"
            title={t('manage.correspondents')}
            onPress={() => navigation.navigate('CorrespondentsList')}
          />
        ) : null}
        {can('view', 'documenttype') ? (
          <ManageCard
            icon="file-document-multiple"
            title={t('manage.documentTypes')}
            onPress={() => navigation.navigate('DocumentTypesList')}
          />
        ) : null}
        {can('view', 'storagepath') ? (
          <ManageCard
            icon="folder-multiple"
            title={t('manage.storagePaths')}
            onPress={() => navigation.navigate('StoragePathsList')}
          />
        ) : null}
        {can('view', 'customfield') ? (
          <ManageCard
            icon="form-textbox"
            title={t('manage.customFields')}
            onPress={() => navigation.navigate('CustomFieldsList')}
          />
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 8,
  },
});
