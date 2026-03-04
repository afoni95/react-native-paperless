import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Divider, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ManageStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'ManageHome'>;

export const ManageHomeScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Item
          title={t('manage.tags')}
          left={(props) => <List.Icon {...props} icon="tag-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('TagsList')}
        />
        <Divider />
        <List.Item
          title={t('manage.correspondents')}
          left={(props) => <List.Icon {...props} icon="account-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('CorrespondentsList')}
        />
        <Divider />
        <List.Item
          title={t('manage.documentTypes')}
          left={(props) => <List.Icon {...props} icon="file-document-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('DocumentTypesList')}
        />
        <Divider />
        <List.Item
          title={t('manage.trashBin')}
          left={(props) => <List.Icon {...props} icon="trash-can" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('TrashBin')}
        />
        <Divider />
        <List.Item
          title={t('manage.logs')}
          left={(props) => <List.Icon {...props} icon="file-document-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('LogsView')}
        />
        <Divider />
        <List.Item
          title={t('manage.tasks')}
          left={(props) => <List.Icon {...props} icon="clipboard-list" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('TasksList')}
        />
        <Divider />
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
