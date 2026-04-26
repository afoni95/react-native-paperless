import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ManageStackParamList } from '@/navigation/types';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageCard } from '../../../components/ManageCard';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'MailOverview'>;

export const MailOverviewScreen: React.FC = () => {
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
        {can('view', 'mailaccount') ? (
          <ManageCard
            icon="email-multiple"
            title={t('manage.mailAccounts')}
            onPress={() => navigation.navigate('MailAccountsList')}
          />
        ) : null}
        {can('view', 'mailrule') ? (
          <ManageCard
            icon="email-newsletter"
            title={t('manage.mailRules')}
            onPress={() => navigation.navigate('MailRulesList')}
          />
        ) : null}
        {can('view', 'processedmail') ? (
          <ManageCard
            icon="email-check"
            title={t('manage.processedMail')}
            onPress={() => navigation.navigate('ProcessedMailList')}
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
