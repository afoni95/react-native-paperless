import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Searchbar, Text, Chip, useTheme, Card } from 'react-native-paper';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { documentsApi } from '@/api';
import { useDebounce, useLookupMaps } from '@/hooks';
import { Document, DocumentListParams, Tag } from '@/types';
import {
  LoadingScreen,
  EmptyState,
  ErrorBanner,
  TagChip,
  FilterSheet,
  AuthenticatedImage,
} from '@/components';
import type { FilterState } from '@/components';
import { formatDate } from '@/utils';
import { DocumentsStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DocumentsStackParamList, 'DocumentList'>;

const PAGE_SIZE = 25;

const SORT_OPTIONS = [
  { key: '-created', labelKey: 'documents.createdNewest' },
  { key: 'created', labelKey: 'documents.createdOldest' },
  { key: '-added', labelKey: 'documents.addedNewest' },
  { key: 'added', labelKey: 'documents.addedOldest' },
  { key: 'title', labelKey: 'documents.titleAZ' },
  { key: '-title', labelKey: 'documents.titleZA' },
  { key: 'archive_serial_number', labelKey: 'documents.asnAsc' },
  { key: '-archive_serial_number', labelKey: 'documents.asnDesc' },
];

export const DocumentListScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { allTags, allCorrespondents, allDocTypes, tagsMap, correspondentsMap, docTypesMap } =
    useLookupMaps();

  const [searchText, setSearchText] = useState('');
  const [ordering, setOrdering] = useState('-created');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    correspondent: null,
    documentType: null,
    tags: [],
    inbox: undefined,
  });

  const debouncedSearch = useDebounce(searchText, 400);

  const queryParams: DocumentListParams = useMemo(
    () => ({
      page_size: PAGE_SIZE,
      ordering,
      query: debouncedSearch || undefined,
      correspondent__id: filters.correspondent || undefined,
      document_type__id: filters.documentType || undefined,
      tags__id__all: filters.tags.length > 0 ? filters.tags : undefined,
      is_in_inbox: filters.inbox,
      truncate_content: true,
    }),
    [ordering, debouncedSearch, filters],
  );

  const activeFilterCount = useMemo(() => {
    return [
      filters.correspondent !== null,
      filters.documentType !== null,
      filters.tags.length > 0,
      filters.inbox !== undefined,
    ].filter(Boolean).length;
  }, [filters]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['documents', queryParams],
    queryFn: async ({ pageParam = 1 }) => {
      return documentsApi.getDocuments({ ...queryParams, page: pageParam as number });
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const documents = useMemo(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);

  const totalCount = data?.pages[0]?.count ?? 0;

  const getThumbUri = useCallback((docId: number) => {
    return `/api/documents/${docId}/thumb/`;
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Document }) => {
      const correspondent = item.correspondent ? correspondentsMap.get(item.correspondent) : null;
      const docType = item.document_type ? docTypesMap.get(item.document_type) : null;
      const docTags = item.tags.map((tagId) => tagsMap.get(tagId)).filter(Boolean) as Tag[];

      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
          activeOpacity={0.7}
        >
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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
                {correspondent && (
                  <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                    {correspondent.name}
                  </Text>
                )}
                <View style={styles.metaRow}>
                  {docType && (
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {docType.name}
                    </Text>
                  )}
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDate(item.created)}
                  </Text>
                </View>
                {docTags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {docTags.slice(0, 3).map((tag) => (
                      <TagChip key={tag.id} name={tag.name} color={tag.color} />
                    ))}
                    {docTags.length > 3 && (
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        +{docTags.length - 3}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [correspondentsMap, docTypesMap, tagsMap, theme, navigation, getThumbUri],
  );

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder={t('documents.search')}
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchBar}
      />

      {/* Filters */}
      <View style={styles.filterRow}>
        <Chip
          mode="outlined"
          icon="filter-variant"
          onPress={() => setShowFilterSheet(true)}
          style={styles.filterChip}
        >
          {t('documents.filters')}
          {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Chip>
        <Chip
          mode="outlined"
          icon="sort"
          onPress={() => setShowSortOptions(!showSortOptions)}
          style={styles.filterChip}
        >
          {t('documents.sortBy')}
        </Chip>
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant, marginLeft: 'auto' }}
        >
          {totalCount} docs
        </Text>
      </View>

      {showSortOptions && (
        <View style={styles.sortOptions}>
          {SORT_OPTIONS.map((opt) => (
            <Chip
              key={opt.key}
              mode="flat"
              selected={ordering === opt.key}
              onPress={() => {
                setOrdering(opt.key);
                setShowSortOptions(false);
              }}
              style={{ margin: 2 }}
              compact
            >
              {t(opt.labelKey)}
            </Chip>
          ))}
        </View>
      )}

      {isError && (
        <ErrorBanner message={error?.message ?? t('common.somethingWentWrong')} onRetry={refetch} />
      )}

      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={documents.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={<EmptyState message={t('documents.noDocuments')} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
      />

      <FilterSheet
        visible={showFilterSheet}
        onDismiss={() => setShowFilterSheet(false)}
        filters={filters}
        onApply={setFilters}
        correspondents={allCorrespondents || []}
        documentTypes={allDocTypes || []}
        tags={allTags || []}
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  filterChip: {
    height: 32,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 8,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
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
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    alignItems: 'center',
  },
});
