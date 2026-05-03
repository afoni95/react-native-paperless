import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, useTheme, FAB } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePermissionContext } from '@/hooks/PermissionProvider';

import type { ManageStackParamList } from '@/navigation/types';
import { useUsers } from '@/reactQuery';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { useOfflineNavigationTitle } from '@/hooks/useOfflineNavigationTitle';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'UsersList'>;

export const UsersListScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data, isLoading, isError } = useUsers();

  const { can } = usePermissionContext();
  const canAddUser = can('add', 'user');
  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;
  useOfflineNavigationTitle(t('manage.users'));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        {isLoading && <List.Item title={t('common.loading')} />}
        {isError && <List.Item title={t('common.error')} />}
        {data?.results.map((user) => (
          <List.Item
            key={user.id}
            title={user.username}
            description={user.email}
            left={(props) => <List.Icon {...props} icon="account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() =>
              can('change', 'user') && navigation.navigate('UserEdit', { userId: user.id })
            }
          />
        ))}
      </List.Section>
      {canAddUser && !isOffline && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('UserEdit', {})}
          color={theme.colors.onPrimary}
        />
      )}
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
