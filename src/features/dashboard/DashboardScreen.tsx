import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { Button, Card, Text, useTheme, Divider, Snackbar } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { LoadingScreen, GlobalSearchBar } from '@/components';
import { useGlobalNavigationHelper } from '@/hooks';
import { useAllMailAccounts, useProcessMailAccount, useStatistics } from '@/reactQuery';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { useOfflineQueueStore } from '@/store/offlineQueueStore';

export const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { navigateTo } = useGlobalNavigationHelper();
  const { can } = usePermissionContext();
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(null);
  const { status } = useNetworkStore();
  // True only when user explicitly chose "Work Offline" with no prior server login
  const tokenlessOffline = status === NetworkStatus.Offline;
  const offlineItems = useOfflineQueueStore((s) => s.items);

  const showDocumentsTab = can('view', 'document');
  const showTagsList = can('view', 'tag');
  const showCorrespondentsList = can('view', 'correspondent');
  const showDocumentTypesList = can('view', 'documenttype');
  const showMailAccounts = can('view', 'mailaccount');
  const canProcessMailAccounts = can('change', 'mailaccount');

  const { data: stats, isLoading, isError, refetch, isRefetching } = useStatistics();
  const { data: mailAccounts = [] } = useAllMailAccounts(showMailAccounts);

  const processMailAccountMutation = useProcessMailAccount();

  const handleProcessMailAccount = (accountId: number, accountName: string) => {
    processMailAccountMutation.mutate(accountId, {
      onSuccess: () => {
        setSnackbarMessage(t('dashboard.processMailQueued', { account: accountName }));
      },
      onError: () => {
        setSnackbarMessage(t('dashboard.processMailFailed'));
      },
    });
  };

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  if (isError) {
    // Silently show empty dashboard (no server reachable — offline mode)
    // fall through to render with null stats
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.searchContainer}>
          <GlobalSearchBar
            disabled={tokenlessOffline}
            placeholder={tokenlessOffline ? t('common.unavailableOffline') : undefined}
          />
        </View>

        <View style={styles.cardRow}>
          <StatCard
            title={t('dashboard.totalDocuments')}
            value={
              tokenlessOffline
                ? offlineItems.filter((i) => i.type === 'document').length
                : (stats?.documents_total ?? 0)
            }
            icon="file-document-outline"
            color={theme.colors.primaryContainer}
            textColor={theme.colors.onPrimaryContainer}
            onPress={() => {
              if (showDocumentsTab) {
                navigateTo('documentList');
              }
            }}
          />
          <StatCard
            title={t('dashboard.inbox')}
            value={tokenlessOffline ? 0 : (stats?.documents_inbox ?? 0)}
            icon="inbox-arrow-down"
            color={theme.colors.tertiaryContainer}
            textColor={theme.colors.onTertiaryContainer}
            onPress={() => {
              if (!tokenlessOffline && showDocumentsTab) {
                navigateTo('documentList');
              }
            }}
          />
        </View>

        <View style={styles.cardRow}>
          <StatCard
            title={t('dashboard.tags')}
            value={
              tokenlessOffline
                ? offlineItems.filter((i) => i.type === 'tag').length
                : (stats?.tag_count ?? 0)
            }
            icon="tag-outline"
            color={theme.colors.tertiaryContainer}
            textColor={theme.colors.onTertiaryContainer}
            onPress={() => {
              if (showTagsList) {
                navigateTo('tagsList');
              }
            }}
          />
          <StatCard
            title={t('dashboard.correspondents')}
            value={
              tokenlessOffline
                ? offlineItems.filter((i) => i.type === 'correspondent').length
                : (stats?.correspondent_count ?? 0)
            }
            icon="account-outline"
            color={theme.colors.primaryContainer}
            textColor={theme.colors.onPrimaryContainer}
            onPress={() => {
              if (showCorrespondentsList) {
                navigateTo('correspondentsList');
              }
            }}
          />
        </View>

        <View style={styles.cardRow}>
          <StatCard
            title={t('dashboard.documentTypes')}
            value={
              tokenlessOffline
                ? offlineItems.filter((i) => i.type === 'documentType').length
                : (stats?.document_type_count ?? 0)
            }
            icon="clipboard-text-outline"
            color={theme.colors.primaryContainer}
            textColor={theme.colors.onPrimaryContainer}
            onPress={() => {
              if (showDocumentTypesList) {
                navigateTo('documentTypesList');
              }
            }}
          />
          <StatCard
            title={t('dashboard.characters')}
            value={tokenlessOffline ? '-' : formatNumber(stats?.character_count ?? 0)}
            icon="format-letter-case"
            color={theme.colors.tertiaryContainer}
            textColor={theme.colors.onTertiaryContainer}
          />
        </View>

        {showMailAccounts && (
          <Card style={[styles.mailAccountsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                {t('dashboard.mailAccounts')}
              </Text>

              {tokenlessOffline ? (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('common.unavailableOffline')}
                </Text>
              ) : mailAccounts.length === 0 ? (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('dashboard.noMailAccounts')}
                </Text>
              ) : (
                mailAccounts.map((account, index) => {
                  return (
                    <View key={account.id}>
                      <View style={styles.mailAccountRow}>
                        <View style={{ flex: 1 }}>
                          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                            {account.name}
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={{ color: theme.colors.onSurfaceVariant }}
                          >
                            {account.username}
                          </Text>
                        </View>
                        <Button
                          mode="contained-tonal"
                          compact
                          icon="refresh"
                          onPress={() => handleProcessMailAccount(account.id, account.name)}
                          disabled={!canProcessMailAccounts}
                        >
                          {t('dashboard.processMail')}
                        </Button>
                      </View>
                      {index < mailAccounts.length - 1 && <Divider style={{ marginVertical: 8 }} />}
                    </View>
                  );
                })
              )}
            </Card.Content>
          </Card>
        )}

        {stats?.document_file_type_counts && stats.document_file_type_counts.length > 0 && (
          <Card style={[styles.fileTypesCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                {t('dashboard.fileTypes')}
              </Text>
              {stats.document_file_type_counts.map((ft, index) => (
                <View key={ft.mime_type}>
                  <View style={styles.fileTypeRow}>
                    <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.onSurface }}>
                      {ft.mime_type}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.primary, fontWeight: '600' }}
                    >
                      {ft.mime_type_count}
                    </Text>
                  </View>
                  {index < stats.document_file_type_counts.length - 1 && (
                    <Divider style={{ marginVertical: 4 }} />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage(null)}
        duration={5000}
        style={{ marginBottom: 12 }}
      >
        {snackbarMessage ?? ''}
      </Snackbar>
    </>
  );
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconName;
  color: string;
  textColor: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, textColor, onPress }) => {
  return (
    <Card style={[styles.statCard, { backgroundColor: color }]} onPress={onPress}>
      <Card.Content style={styles.statCardContent}>
        <MaterialCommunityIcons
          name={icon}
          size={28}
          color={textColor}
          style={{ marginBottom: 8 }}
        />
        <Text variant="headlineMedium" style={[styles.statValue, { color: textColor }]}>
          {value}
        </Text>
        <Text variant="labelMedium" style={{ color: textColor, opacity: 0.8 }}>
          {title}
        </Text>
      </Card.Content>
    </Card>
  );
};

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
  },
  statCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fileTypesCard: {
    marginTop: 8,
    borderRadius: 16,
  },
  mailAccountsCard: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 16,
  },
  mailAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fileTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
});
