import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ManageStackParamList } from '@/navigation/types';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageCard } from '@/components/ManageCard';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'ManageHome'>;

export const ManagementOverviewScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { can } = usePermissionContext();

  const showMailSection =
    can('view', 'mailaccount') || can('view', 'mailrule') || can('view', 'processedmail');
  const showWorkflowsScreen = can('view', 'workflow');

  const showDocumentsSection =
    can('view', 'tag') ||
    can('view', 'correspondent') ||
    can('view', 'documenttype') ||
    can('view', 'storagepath') ||
    can('view', 'customfield');
  const showAccessSection = can('view', 'user') || can('view', 'group');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <ManageCard
          icon="view-dashboard"
          title={t('manage.display')}
          subtitle={t('manage.displaySubtitle')}
          onPress={() => navigation.navigate('Display')}
        />
      </View>

      {showDocumentsSection ? (
        <View style={styles.section}>
          <ManageCard
            icon="database"
            title={t('manage.masterData')}
            subtitle={t('manage.masterDataSubtitle')}
            onPress={() => navigation.navigate('MasterDataOverview')}
          />
        </View>
      ) : null}

      {showWorkflowsScreen ? (
        <View style={styles.section}>
          <ManageCard
            icon="git"
            title={t('manage.workflows')}
            subtitle={t('manage.workflowsSubtitle')}
            onPress={() => navigation.navigate('WorkflowsList')}
          />
        </View>
      ) : null}

      {showMailSection ? (
        <View style={styles.section}>
          <ManageCard
            icon="email"
            title={t('manage.mail')}
            subtitle={t('manage.mailSubtitle')}
            onPress={() => navigation.navigate('MailOverview')}
          />
        </View>
      ) : null}

      {showAccessSection ? (
        <View style={styles.section}>
          <ManageCard
            icon="account-multiple"
            title={t('manage.access')}
            subtitle={t('manage.accessSubtitle')}
            onPress={() => navigation.navigate('AccessOverview')}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <ManageCard
          icon="cog"
          title={t('manage.system')}
          subtitle={t('manage.systemSubtitle')}
          onPress={() => navigation.navigate('SystemOverview')}
        />
      </View>
      <View style={styles.section}>
        <ManageCard
          icon="information"
          title={t('manage.about')}
          subtitle={t('manage.aboutSubtitle')}
          onPress={() => navigation.navigate('About')}
        />
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
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: 0.8,
  },
});
