import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ManageStackParamList } from '@/navigation/types';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageCard } from '../../../components/ManageCard';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'SystemOverview'>;

export const SystemOverviewScreen: React.FC = () => {
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
        {can('view', 'paperlesstask') ? (
          <ManageCard
            icon="clipboard-list"
            title={t('manage.tasks')}
            onPress={() => navigation.navigate('TasksList')}
          />
        ) : null}
        {can('view', 'logentry') ? (
          <ManageCard
            icon="file-document-outline"
            title={t('manage.logs')}
            onPress={() => navigation.navigate('LogsView')}
          />
        ) : null}
        {can('delete', 'document') ? (
          <ManageCard
            icon="trash-can"
            title={t('manage.trashBin')}
            onPress={() => navigation.navigate('TrashBin')}
          />
        ) : null}
        <ManageCard
          icon="cog"
          title={t('manage.settings')}
          onPress={() => navigation.navigate('Settings')}
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
});
