import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Text, Divider, useTheme, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { documentsApi } from '@/api';
import {
  GlobalSearchResult,
  Document,
  TagSearchResult,
  CorrespondentSearchResult,
  DocumentTypeSearchResult,
} from '@/types';
import { DocumentsStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DocumentsStackParamList, 'GlobalSearchResults'>;

interface RouteParams {
  query: string;
}

interface SearchResultItem {
  id: number;
  name: string;
  subtitle?: string;
  type: 'document' | 'tag' | 'correspondent' | 'document_type';
  data: Document | TagSearchResult | CorrespondentSearchResult | DocumentTypeSearchResult;
}

export const GlobalSearchResultsScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = route.params as RouteParams;

  useEffect(() => {
    navigation.setOptions({
      title: `${t('search.results')}: "${params.query}"`,
    });
  }, [navigation, t, params.query]);

  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await documentsApi.globalSearch(params.query);
      const items = compileSearchResults(results);
      setSearchResults(items);
    } catch (err) {
      console.error('Search error:', err);
      setError(t('search.error') || 'Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.query]);

  const compileSearchResults = (results: GlobalSearchResult): SearchResultItem[] => {
    const items: SearchResultItem[] = [];

    // Add documents
    if (results.documents && results.documents.length > 0) {
      results.documents.forEach((doc) => {
        items.push({
          id: doc.id,
          name: doc.title,
          subtitle: doc.created_date || doc.created,
          type: 'document',
          data: doc,
        });
      });
    }

    // Add tags
    if (results.tags && results.tags.length > 0) {
      results.tags.forEach((tag) => {
        items.push({
          id: tag.id,
          name: tag.name,
          subtitle: tag.slug,
          type: 'tag',
          data: tag,
        });
      });
    }

    // Add correspondents
    if (results.correspondents && results.correspondents.length > 0) {
      results.correspondents.forEach((correspondent) => {
        items.push({
          id: correspondent.id,
          name: correspondent.name,
          subtitle: correspondent.slug,
          type: 'correspondent',
          data: correspondent,
        });
      });
    }

    // Add document types
    if (results.document_types && results.document_types.length > 0) {
      results.document_types.forEach((docType) => {
        items.push({
          id: docType.id,
          name: docType.name,
          subtitle: docType.slug,
          type: 'document_type',
          data: docType,
        });
      });
    }

    return items;
  };

  const handleResultPress = (item: SearchResultItem) => {
    switch (item.type) {
      case 'document':
        navigation.navigate('DocumentDetail', { documentId: item.id });
        break;
      case 'tag':
        // Navigate to tag edit screen in ManageStack
        navigation.getParent()?.navigate('ManageTab', {
          screen: 'TagEdit',
          params: { tagId: item.id },
        });
        break;
      case 'correspondent':
        // Navigate to correspondent edit screen in ManageStack
        navigation.getParent()?.navigate('ManageTab', {
          screen: 'CorrespondentEdit',
          params: { correspondentId: item.id },
        });
        break;
      case 'document_type':
        // Navigate to document type edit screen in ManageStack
        navigation.getParent()?.navigate('ManageTab', {
          screen: 'DocumentTypeEdit',
          params: { documentTypeId: item.id },
        });
        break;
    }
  };

  const getResultIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'document':
        return 'file-document';
      case 'tag':
        return 'tag';
      case 'correspondent':
        return 'account';
      case 'document_type':
        return 'shape-plus';
      default:
        return 'magnify';
    }
  };

  const renderResultItem = ({ item }: { item: SearchResultItem }) => (
    <Pressable
      onPress={() => handleResultPress(item)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={[styles.resultItem, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getResultIcon(item.type)}
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.name}
          </Text>
          {item.subtitle && (
            <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {item.subtitle}
            </Text>
          )}
          <Text style={[styles.itemType, { color: theme.colors.onSurfaceVariant }]}>
            {t(`search.type.${item.type}`) || item.type}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.onSurfaceVariant}
          style={styles.chevron}
        />
      </View>
      <Divider />
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={theme.colors.error}
          style={styles.errorIcon}
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button onPress={performSearch} mode="contained" style={styles.retryButton}>
          {t('common.retry') || 'Retry'}
        </Button>
      </View>
    );
  }

  if (searchResults.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons
          name="magnify"
          size={48}
          color={theme.colors.onSurfaceVariant}
          style={styles.errorIcon}
        />
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          {t('search.noResults') || 'No results found'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={searchResults}
      renderItem={renderResultItem}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      style={[styles.list, { backgroundColor: theme.colors.background }]}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 80,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    marginBottom: 2,
  },
  itemType: {
    fontSize: 12,
  },
  chevron: {
    marginLeft: 8,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
});
