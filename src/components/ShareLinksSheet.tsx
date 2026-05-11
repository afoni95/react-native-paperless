import React from 'react';
import { View, ScrollView, StyleSheet, Modal, Pressable, Share } from 'react-native';
import { Text, Button, Divider, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Clipboard from 'expo-clipboard';

import { usePermissionContext } from '@/hooks/PermissionProvider';
import { useAllShareLinks, useDeleteShareLink } from '@/reactQuery';
import { useAuthStore } from '@/store/authStore';
import { MainTabsParamList } from '@/navigation/types';
import { formatExpirationRelative } from '@/utils';

interface ShareLinksSheetProps {
  visible: boolean;
  onDismiss: () => void;
  documentId: number;
  documentTitle: string;
}

export const ShareLinksSheet: React.FC<ShareLinksSheetProps> = ({
  visible,
  onDismiss,
  documentId,
  documentTitle,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { can } = usePermissionContext();
  const { serverUrl } = useAuthStore();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();

  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);

  const { data: allShareLinks, isLoading } = useAllShareLinks(visible);

  const deleteMutation = useDeleteShareLink();

  const docLinks = React.useMemo(
    () => (allShareLinks ?? []).filter((link) => link.document === documentId),
    [allShareLinks, documentId],
  );

  const getPublicUrl = (slug: string) => {
    const base = serverUrl.replace(/\/+$/, '');
    return `${base}/share/${slug}`;
  };

  const handleCopy = async (slug: string) => {
    await Clipboard.setStringAsync(getPublicUrl(slug));
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleShare = async (slug: string) => {
    await Share.share({ url: getPublicUrl(slug), message: getPublicUrl(slug) });
  };

  const handleCreateNew = () => {
    onDismiss();
    navigation.navigate('ManageTab', {
      screen: 'ShareLinkCreate',
      params: { documentId },
    });
  };

  const canAdd = can('add', 'sharelink');
  const canDelete = can('delete', 'sharelink');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="titleLarge">{t('shareLinks.shareLink')}</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>
        <Text
          variant="bodySmall"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {documentTitle}
        </Text>

        <Divider />

        <ScrollView contentContainerStyle={styles.content} nestedScrollEnabled>
          {isLoading ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : docLinks.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {t('shareLinks.noShareLinks')}
            </Text>
          ) : (
            docLinks.map((link) => (
              <View key={link.id} style={[styles.linkRow, { borderColor: theme.colors.outline }]}>
                <View style={styles.linkInfo}>
                  <Text style={styles.urlText} numberOfLines={1}>
                    {getPublicUrl(link.slug)}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t('shareLinks.expiration')}: {formatExpirationRelative(link.expiration, t)}
                  </Text>
                </View>
                <View style={styles.linkActions}>
                  <IconButton
                    icon={copiedSlug === link.slug ? 'check' : 'content-copy'}
                    size={20}
                    onPress={() => handleCopy(link.slug)}
                    iconColor={theme.colors.primary}
                  />
                  <IconButton
                    icon="share-variant"
                    size={20}
                    onPress={() => handleShare(link.slug)}
                    iconColor={theme.colors.primary}
                  />
                  {canDelete && (
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => deleteMutation.mutate(link.id)}
                      iconColor={theme.colors.error}
                    />
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <Divider />

        {canAdd && (
          <View style={styles.footer}>
            <Button mode="contained" onPress={handleCreateNew} icon="plus">
              {t('shareLinks.createShareLink')}
            </Button>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subtitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
  },
  linkInfo: {
    flex: 1,
  },
  urlText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  linkActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'stretch',
  },
});
