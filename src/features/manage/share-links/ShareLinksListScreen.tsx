import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Share, StyleSheet, View } from 'react-native';
import { FAB, List, IconButton, Snackbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { ConfirmDialog, EmptyState, ErrorBanner, LoadingScreen } from '@/components';
import { usePermissionContext } from '@/hooks/PermissionProvider';
import { ManageStackParamList } from '@/navigation/types';
import { useAllShareLinks, useDeleteShareLink } from '@/reactQuery';
import { ShareLink } from '@/types';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { useOfflineNavigationTitle } from '@/hooks/useOfflineNavigationTitle';
import { useAuthStore } from '@/store/authStore';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'ShareLinksList'>;

const formatExpiration = (expiration: string | null, t: (key: string) => string): string => {
  if (!expiration) return t('shareLinks.noExpiration');
  const date = new Date(expiration);
  return date.toLocaleString();
};

export const ShareLinksListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { can } = usePermissionContext();
  const { serverUrl } = useAuthStore();

  const [deleteTarget, setDeleteTarget] = useState<ShareLink | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;
  useOfflineNavigationTitle(t('shareLinks.title'));

  const { data: shareLinks, isLoading, isError, error, refetch, isRefetching } = useAllShareLinks();

  const deleteMutation = useDeleteShareLink({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const canAddShareLink = can('add', 'sharelink');
  const canDeleteShareLink = can('delete', 'sharelink');

  const getPublicUrl = (slug: string) => {
    const base = serverUrl.replace(/\/+$/, '');
    return `${base}/share/${slug}`;
  };

  const handleCopy = async (slug: string) => {
    await Clipboard.setStringAsync(getPublicUrl(slug));
    setSnackbarMessage(t('shareLinks.linkCopied'));
    setSnackbarVisible(true);
  };

  const handleShare = async (slug: string) => {
    await Share.share({ url: getPublicUrl(slug), message: getPublicUrl(slug) });
  };

  const sortedLinks = useMemo(() => {
    if (!shareLinks) return [];
    return [...shareLinks].sort((a, b) => a.id - b.id);
  }, [shareLinks]);

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isError && (
        <ErrorBanner
          message={error instanceof Error ? error.message : t('common.somethingWentWrong')}
          onRetry={refetch}
        />
      )}

      <FlatList
        data={sortedLinks}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={<EmptyState message={t('shareLinks.noShareLinks')} />}
        renderItem={({ item }) => (
          <List.Item
            title={`${t('shareLinks.document')} #${item.document}`}
            description={
              <View>
                <Text style={styles.metaText}>{getPublicUrl(item.slug)}</Text>
                <Text style={styles.metaText}>
                  {t('shareLinks.expiration')}: {formatExpiration(item.expiration, t)}
                </Text>
              </View>
            }
            right={() => (
              <View style={styles.itemActions}>
                <IconButton
                  icon="content-copy"
                  onPress={() => handleCopy(item.slug)}
                  iconColor={theme.colors.primary}
                  size={20}
                />
                <IconButton
                  icon="share-variant"
                  onPress={() => handleShare(item.slug)}
                  iconColor={theme.colors.primary}
                  size={20}
                />
                {canDeleteShareLink && (
                  <IconButton
                    icon="delete"
                    onPress={() => setDeleteTarget(item)}
                    iconColor={theme.colors.error}
                    size={20}
                  />
                )}
              </View>
            )}
          />
        )}
      />

      {canAddShareLink && !isOffline && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('ShareLinkCreate', {})}
          color={theme.colors.onPrimary}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('common.delete')}
        message={t('shareLinks.deleteConfirm')}
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.7,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
