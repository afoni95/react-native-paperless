import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, useTheme, FAB } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ManageStackParamList } from '@/navigation/types';
import { useGroups } from '@/reactQuery';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'GroupsList'>;

export const GroupsListScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data, isLoading, isError } = useGroups();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        {isLoading && <List.Item title={t('common.loading')} />}
        {isError && <List.Item title={t('common.error')} />}
        {data?.results.map((group) => (
          <List.Item
            key={group.id}
            title={group.name}
            left={(props) => <List.Icon {...props} icon="account-group" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('GroupEdit', { groupId: group.id })}
          />
        ))}
      </List.Section>
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('GroupEdit', {})}
        color={theme.colors.onPrimary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
  },
});
