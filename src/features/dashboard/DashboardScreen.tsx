import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, useTheme, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { LoadingScreen, ErrorBanner, GlobalSearchBar } from '@/components';
import { useGlobalNavigationHelper } from '@/hooks';
import { useStatistics } from '@/reactQuery';

export const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { navigateTo } = useGlobalNavigationHelper();

  const { data: stats, isLoading, isError, error, refetch, isRefetching } = useStatistics();

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorBanner
          message={(error as Error)?.message ?? t('common.somethingWentWrong')}
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
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
        <GlobalSearchBar />
      </View>

      <View style={styles.cardRow}>
        <StatCard
          title={t('dashboard.totalDocuments')}
          value={stats?.documents_total ?? 0}
          icon="file-document-outline"
          color={theme.colors.primaryContainer}
          textColor={theme.colors.onPrimaryContainer}
          onPress={() => navigateTo('documentList')}
        />
        <StatCard
          title={t('dashboard.inbox')}
          value={stats?.documents_inbox ?? 0}
          icon="inbox-arrow-down"
          color={theme.colors.secondaryContainer}
          textColor={theme.colors.onSecondaryContainer}
          onPress={() => navigateTo('documentList')}
        />
      </View>

      <View style={styles.cardRow}>
        <StatCard
          title={t('dashboard.tags')}
          value={stats?.tag_count ?? 0}
          icon="tag-outline"
          color={theme.colors.tertiaryContainer}
          textColor={theme.colors.onTertiaryContainer}
          onPress={() => navigateTo('tagsList')}
        />
        <StatCard
          title={t('dashboard.correspondents')}
          value={stats?.correspondent_count ?? 0}
          icon="account-outline"
          color={theme.colors.primaryContainer}
          textColor={theme.colors.onPrimaryContainer}
          onPress={() => navigateTo('correspondentsList')}
        />
      </View>

      <View style={styles.cardRow}>
        <StatCard
          title={t('dashboard.documentTypes')}
          value={stats?.document_type_count ?? 0}
          icon="clipboard-text-outline"
          color={theme.colors.secondaryContainer}
          textColor={theme.colors.onSecondaryContainer}
          onPress={() => navigateTo('documentTypesList')}
        />
        <StatCard
          title={t('dashboard.characters')}
          value={formatNumber(stats?.character_count ?? 0)}
          icon="format-letter-case"
          color={theme.colors.tertiaryContainer}
          textColor={theme.colors.onTertiaryContainer}
        />
      </View>

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
  fileTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
});
