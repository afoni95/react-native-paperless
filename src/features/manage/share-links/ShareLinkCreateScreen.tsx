import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, Divider, FAB, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthenticatedImage, ErrorBanner, LoadingScreen } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useCreateShareLink } from '@/reactQuery';
import { useDocumentMetadata } from '@/hooks';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { formatDate } from '@/utils';
import { documentsApi } from '@/api';
import { Document } from '@/types';

type Props = NativeStackScreenProps<ManageStackParamList, 'ShareLinkCreate'>;

type ExpirationOption = 'never' | '1d' | '7d' | '30d';

const EXPIRATION_OPTIONS: ExpirationOption[] = ['never', '1d', '7d', '30d'];

const computeExpiration = (option: ExpirationOption): string | null => {
  if (option === 'never') return null;
  const now = new Date();
  const offsetMap: Record<ExpirationOption, number> = {
    never: 0,
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  return new Date(now.getTime() + offsetMap[option]).toISOString();
};

export const ShareLinkCreateScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { documentId: prefilledDocumentId } = route.params ?? {};
  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [expiration, setExpiration] = useState<ExpirationOption>('never');

  const isDocumentLocked = prefilledDocumentId !== undefined;

  const { correspondentsMap } = useDocumentMetadata();
  const getThumbUri = (docId: number) => `/api/documents/${docId}/thumb/`;

  const createMutation = useCreateShareLink({
    onSuccess: () => {
      navigation.goBack();
    },
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const resp = await documentsApi.getDocuments({ query: query.trim(), page_size: 20 });
      setSearchResults(resp.results);
    } catch {
      setSearchError(t('common.somethingWentWrong'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = () => {
    const docId = prefilledDocumentId ?? selectedDocument?.id;
    if (!docId) return;
    createMutation.mutate({
      document: docId,
      expiration: computeExpiration(expiration),
    });
  };

  const canSubmit =
    !isOffline &&
    (prefilledDocumentId !== undefined || selectedDocument !== null) &&
    !createMutation.isPending;

  const expirationLabel = (opt: ExpirationOption): string => {
    const keyMap: Record<ExpirationOption, string> = {
      never: 'shareLinks.noExpiration',
      '1d': 'shareLinks.expiration1d',
      '7d': 'shareLinks.expiration7d',
      '30d': 'shareLinks.expiration30d',
    };
    return t(keyMap[opt]);
  };

  if (isOffline) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.offlineText, { color: theme.colors.error }]}>
          {t('common.unavailableOffline')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Document selection */}
        <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onBackground }]}>
          {t('shareLinks.document')}
        </Text>

        {isDocumentLocked ? (
          <Text style={styles.lockedDoc}>
            {t('shareLinks.document')} #{prefilledDocumentId}
          </Text>
        ) : (
          <>
            <Searchbar
              placeholder={t('common.search')}
              value={searchQuery}
              onChangeText={handleSearch}
              style={styles.searchBar}
            />
            {searchError ? <ErrorBanner message={searchError} /> : null}
            {isSearching ? <LoadingScreen message={t('common.loading')} /> : null}
            {selectedDocument ? (
              <View style={styles.selectedRow}>
                <Text style={{ flex: 1 }}>{selectedDocument.title}</Text>
                <Button compact onPress={() => setSelectedDocument(null)}>
                  {t('common.cancel')}
                </Button>
              </View>
            ) : null}
            {!selectedDocument && searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => String(item.id)}
                style={styles.resultsList}
                renderItem={({ item }) => {
                  const correspondent = item.correspondent
                    ? correspondentsMap.get(item.correspondent)
                    : null;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedDocument(item);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                    >
                      <Card style={styles.resultCard}>
                        <View style={styles.cardContent}>
                          <AuthenticatedImage
                            uri={getThumbUri(item.id)}
                            style={styles.thumbnail}
                            resizeMode="cover"
                          />
                          <View style={styles.cardInfo}>
                            <Text
                              variant="titleSmall"
                              numberOfLines={2}
                              style={{ color: theme.colors.onSurface }}
                            >
                              {item.title}
                            </Text>
                            {correspondent ? (
                              <Text
                                variant="bodySmall"
                                style={{ color: theme.colors.primary }}
                              >
                                {correspondent.name}
                              </Text>
                            ) : null}
                            <Text
                              variant="labelSmall"
                              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                            >
                              {formatDate(item.created)}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : null}
          </>
        )}

        <Divider style={styles.divider} />

        {/* Expiration options */}
        <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onBackground }]}>
          {t('shareLinks.expiresIn')}
        </Text>
        <View style={styles.chipRow}>
          {EXPIRATION_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              selected={expiration === opt}
              onPress={() => setExpiration(opt)}
              style={styles.chip}
              mode="flat"
            >
              {expirationLabel(opt)}
            </Chip>
          ))}
        </View>
      </View>

      <FAB
        icon="check"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={createMutation.isPending}
        color={theme.colors.onPrimary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 88,
  },
  label: {
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 8,
  },
  resultsList: {
    flex: 1,
  },
  resultCard: {
    marginBottom: 8,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    height: 110,
  },
  thumbnail: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'flex-start',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  lockedDoc: {
    marginBottom: 8,
    opacity: 0.8,
  },
  offlineText: {
    padding: 16,
    textAlign: 'center',
  },
});
