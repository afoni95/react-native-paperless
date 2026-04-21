import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { FAB, List, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { ConfirmDialog, EmptyState, ErrorBanner, LoadingScreen } from '@/components';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageStackParamList } from '@/navigation/types';
import { useAllMailAccounts, useDeleteMailAccount } from '@/reactQuery';
import { MailAccount } from '@/types';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'MailAccountsList'>;

export const MailAccountsListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { can } = usePermissionContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MailAccount | null>(null);

  const {
    data: mailAccounts,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAllMailAccounts();

  const deleteMutation = useDeleteMailAccount({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const filteredMailAccounts = useMemo(() => {
    if (!mailAccounts) return [];
    if (!searchQuery.trim()) return mailAccounts;

    const term = searchQuery.trim().toLowerCase();
    return mailAccounts.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.imap_server.toLowerCase().includes(term) ||
        item.username.toLowerCase().includes(term),
    );
  }, [mailAccounts, searchQuery]);

  const canAddMailAccount = can('add', 'mailaccount');

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder={t('common.search')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      {isError && (
        <ErrorBanner
          message={error instanceof Error ? error.message : t('common.somethingWentWrong')}
          onRetry={refetch}
        />
      )}

      <FlatList
        data={filteredMailAccounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={
              <View>
                <Text style={styles.metaText}>{`${item.imap_server}:${item.imap_port}`}</Text>
                <Text style={styles.metaText}>{item.username}</Text>
                <Text style={styles.metaText}>
                  {t('mailAccounts.imapSecurityValue', {
                    value: t(`mailAccounts.imapSecurity.${item.imap_security}`),
                  })}
                </Text>
              </View>
            }
            right={(props) => (
              <View style={styles.itemActions}>
                <List.Icon {...props} icon="pencil" />
              </View>
            )}
            onPress={() =>
              can('change', 'mailaccount') &&
              navigation.navigate('MailAccountEdit', { mailAccountId: item.id })
            }
            onLongPress={() => can('delete', 'mailaccount') && setDeleteTarget(item)}
            style={styles.listItem}
          />
        )}
        contentContainerStyle={
          filteredMailAccounts.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={<EmptyState message={t('common.noResults')} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
      />

      {canAddMailAccount && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => navigation.navigate('MailAccountEdit', {})}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('mailAccounts.deleteConfirm')}
        destructive
        onConfirm={() => {
          if (deleteTarget && can('delete', 'mailaccount')) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 12,
    elevation: 2,
  },
  listItem: {
    paddingLeft: 16,
  },
  metaText: {
    fontSize: 12,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
