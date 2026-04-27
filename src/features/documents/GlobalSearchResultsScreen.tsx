import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Text, Divider, useTheme, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  GlobalSearchResult,
  Document,
  TagSearchResult,
  CorrespondentSearchResult,
  DocumentTypeSearchResult,
  StoragePath,
  MailAccount,
  MailRule,
  CustomField,
} from '@/types';
import type { Workflow } from '@/types/workflows';
import type { User, Group } from '@/types';
import { DashboardStackParamList, MainTabsParamList } from '@/navigation/types';
import { useGlobalSearch, useAllTags } from '@/reactQuery';
import { useGlobalNavigationHelper } from '@/hooks';
import { usePermissionContext } from '@/hooks/PermissionProvider';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<DashboardStackParamList, 'GlobalSearchResults'>,
  BottomTabNavigationProp<MainTabsParamList>
>;

type GlobalSearchRouteProp = RouteProp<DashboardStackParamList, 'GlobalSearchResults'>;

interface SearchResultItem {
  id: number;
  name: string;
  subtitle?: string;
  type:
    | 'document'
    | 'tag'
    | 'correspondent'
    | 'document_type'
    | 'storage_path'
    | 'mail_account'
    | 'mail_rule'
    | 'custom_field'
    | 'workflow'
    | 'user';
  data:
    | Document
    | TagSearchResult
    | CorrespondentSearchResult
    | DocumentTypeSearchResult
    | StoragePath
    | MailAccount
    | MailRule
    | CustomField
    | Workflow
    | User
    | Group;
}

export const GlobalSearchResultsScreen: React.FC = () => {
  // Returns the translation key for item.type
  const getTypeTranslationKey = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'document':
        return 'search.type.document';
      case 'tag':
        return 'search.type.tag';
      case 'correspondent':
        return 'search.type.correspondent';
      case 'document_type':
        return 'search.type.document_type';
      case 'storage_path':
        return 'search.type.storage_path';
      case 'mail_account':
        return 'search.type.mail_account';
      case 'mail_rule':
        return 'search.type.mail_rule';
      case 'custom_field':
        return 'search.type.custom_field';
      case 'workflow':
        return 'search.type.workflow';
      case 'user':
        return 'search.type.user';
      default:
        return '';
    }
  };
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GlobalSearchRouteProp>();
  const params = route.params;
  const { navigateTo } = useGlobalNavigationHelper();
  const { can } = usePermissionContext();

  const { data: tags } = useAllTags();

  const { data: searchResultsData, isLoading, isError, refetch } = useGlobalSearch(params.query);

  useEffect(() => {
    navigation.setOptions({
      title: `${t('search.results')}: "${params.query}"`,
    });
  }, [navigation, t, params.query]);

  const compileSearchResults = useCallback(
    (results: GlobalSearchResult): SearchResultItem[] => {
      const getParentName = (parent: number | null): string => {
        const found = tags?.filter((x) => x.id === parent).at(0);
        if (found != null) return found.name;
        return '';
      };

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
            subtitle: getParentName(tag.parent),
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

      // Add storage paths
      if (results.storage_paths && results.storage_paths.length > 0) {
        results.storage_paths.forEach((sp) => {
          items.push({
            id: sp.id,
            name: sp.name,
            subtitle: sp.path,
            type: 'storage_path',
            data: sp,
          });
        });
      }

      // Add mail accounts
      if (results.mail_accounts && results.mail_accounts.length > 0) {
        results.mail_accounts.forEach((account) => {
          items.push({
            id: account.id,
            name: account.name,
            subtitle: account.imap_server,
            type: 'mail_account',
            data: account,
          });
        });
      }

      // Add mail rules
      if (results.mail_rules && results.mail_rules.length > 0) {
        results.mail_rules.forEach((rule) => {
          items.push({
            id: rule.id,
            name: rule.name,
            subtitle: rule.folder,
            type: 'mail_rule',
            data: rule,
          });
        });
      }

      // Add custom fields
      if (results.custom_fields && results.custom_fields.length > 0) {
        results.custom_fields.forEach((field) => {
          items.push({
            id: field.id,
            name: field.name,
            subtitle: field.data_type,
            type: 'custom_field',
            data: field,
          });
        });
      }

      // Add workflows
      if (results.workflows && results.workflows.length > 0) {
        results.workflows.forEach((workflow) => {
          items.push({
            id: workflow.id,
            name: workflow.name,
            type: 'workflow',
            data: workflow,
          });
        });
      }

      // Add users
      if (results.users && results.users.length > 0) {
        results.users.forEach((user) => {
          items.push({
            id: user.id,
            name: user.username,
            subtitle: user.email,
            type: 'user',
            data: user,
          });
        });
      }

      return items;
    },
    [tags],
  );

  const searchResults = React.useMemo(() => {
    if (!searchResultsData) return [];
    return compileSearchResults(searchResultsData);
  }, [searchResultsData, compileSearchResults]);

  const handleResultPress = (item: SearchResultItem) => {
    switch (item.type) {
      case 'document':
        if (can('view', 'document')) navigation.navigate('DocumentDetail', { documentId: item.id });
        break;
      case 'tag':
        if (can('change', 'tag')) navigateTo('tagEdit', { tagId: item.id });
        break;
      case 'correspondent':
        if (can('change', 'correspondent'))
          navigateTo('correspondentEdit', { correspondentId: item.id });
        break;
      case 'document_type':
        if (can('change', 'documenttype'))
          navigateTo('documentTypeEdit', { documentTypeId: item.id });
        break;
      case 'storage_path':
        if (can('change', 'storagepath')) navigateTo('storagePathEdit', { storagePathId: item.id });
        break;
      case 'mail_account':
        if (can('change', 'mailaccount')) navigateTo('mailAccountEdit', { mailAccountId: item.id });
        break;
      case 'mail_rule':
        if (can('change', 'mailrule')) navigateTo('mailRuleEdit', { mailRuleId: item.id });
        break;
      case 'custom_field':
        if (can('change', 'customfield')) navigateTo('customFieldEdit', { customFieldId: item.id });
        break;
      case 'workflow':
        if (can('change', 'workflow')) navigateTo('workflowEdit', { workflowId: item.id });
        break;
      case 'user':
        if (can('change', 'user')) navigateTo('userEdit', { userId: item.id });
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
      case 'storage_path':
        return 'folder-outline';
      case 'mail_account':
        return 'email-outline';
      case 'mail_rule':
        return 'email-check-outline';
      case 'custom_field':
        return 'form-textbox';
      case 'workflow':
        return 'sitemap';
      case 'user':
        return 'account-circle-outline';
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
            {t(getTypeTranslationKey(item.type)) || item.type}
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

  if (isError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={theme.colors.error}
          style={styles.errorIcon}
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {t('search.error') || 'Failed to perform search'}
        </Text>
        <Button onPress={() => refetch()} mode="contained" style={styles.retryButton}>
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
