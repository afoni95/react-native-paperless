import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ManageStackParamList } from '@/navigation/types';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageCard } from '../../../components/ManageCard';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'AccessOverview'>;

export const AccessOverviewScreen: React.FC = () => {
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
        {can('view', 'user') ? (
          <ManageCard
            icon="account"
            title={t('manage.users')}
            onPress={() => navigation.navigate('UsersList')}
          />
        ) : null}
        {can('view', 'group') ? (
          <ManageCard
            icon="account-group"
            title={t('manage.groups')}
            onPress={() => navigation.navigate('GroupsList')}
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
