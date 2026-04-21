import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { FAB, List, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { ConfirmDialog, EmptyState, ErrorBanner, LoadingScreen } from '@/components';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageStackParamList } from '@/navigation/types';
import { useAllMailRules, useDeleteMailRule, useAllMailAccounts } from '@/reactQuery';
import { MailRule } from '@/types';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'MailRulesList'>;

export const MailRulesListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { can } = usePermissionContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MailRule | null>(null);

  const { data: mailRules, isLoading, isError, error, refetch, isRefetching } = useAllMailRules();

  const { data: mailAccounts } = useAllMailAccounts();

  const deleteMutation = useDeleteMailRule({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const accountMap = useMemo(() => {
    const map = new Map<number, string>();
    mailAccounts?.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [mailAccounts]);

  const filteredMailRules = useMemo(() => {
    if (!mailRules) return [];
    if (!searchQuery.trim()) return mailRules;

    const term = searchQuery.trim().toLowerCase();
    return mailRules.filter((item) => item.name.toLowerCase().includes(term));
  }, [mailRules, searchQuery]);

  const canAddMailRule = can('add', 'mailrule') && mailAccounts && mailAccounts.length > 0;

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
        data={filteredMailRules}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={
              <View>
                <Text style={styles.metaText}>
                  {t('mailRules.account')}: {accountMap.get(item.account) ?? item.account}
                </Text>
                <Text style={styles.metaText}>
                  {item.enabled ? t('mailRules.enabled') : t('mailRules.disabled')}
                </Text>
              </View>
            }
            right={(props) => (
              <View style={styles.itemActions}>
                <List.Icon {...props} icon="pencil" />
              </View>
            )}
            onPress={() =>
              can('change', 'mailrule') &&
              navigation.navigate('MailRuleEdit', { mailRuleId: item.id })
            }
            onLongPress={() => can('delete', 'mailrule') && setDeleteTarget(item)}
            style={styles.listItem}
          />
        )}
        contentContainerStyle={filteredMailRules.length === 0 ? styles.emptyContainer : undefined}
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

      {canAddMailRule && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => navigation.navigate('MailRuleEdit', {})}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('mailRules.deleteConfirm')}
        destructive
        onConfirm={() => {
          if (deleteTarget && can('delete', 'mailrule')) {
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
