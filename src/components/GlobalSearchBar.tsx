import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Searchbar, List, Portal, Surface, useTheme, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useDebounce } from '@/hooks';
import { documentsApi } from '@/api';
import { MainTabsParamList } from '@/navigation/types';

interface GlobalSearchBarProps {
  disabled?: boolean;
  placeholder?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ disabled, placeholder }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchPlaceholder = placeholder ?? t('search.placeholder');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await documentsApi.searchAutocomplete(debouncedSearchQuery);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        if (__DEV__) console.error('Failed to fetch autocomplete suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      setShowSuggestions(false);

      // Navigate to search results screen
      navigation.getParent()?.navigate('DashboardTab', {
        screen: 'GlobalSearchResults',
        params: { query: query.trim() },
      });
    },
    [navigation],
  );

  const handleSuggestionPress = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      handleSearch(suggestion);
    },
    [handleSearch],
  );

  const handleChangeText = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim().length === 0) {
      setShowSuggestions(false);
    }
  }, []);

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow suggestion tap to register
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const handleFocus = useCallback(() => {
    if (suggestions.length > 0 && searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
    }
  }, [suggestions.length, searchQuery]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={searchPlaceholder}
        value={disabled ? '' : searchQuery}
        onChangeText={disabled ? undefined : handleChangeText}
        onSubmitEditing={disabled ? undefined : () => handleSearch(searchQuery)}
        onBlur={disabled ? undefined : handleBlur}
        onFocus={disabled ? undefined : handleFocus}
        loading={!disabled && isLoading}
        editable={!disabled}
        style={[
          styles.searchBar,
          { backgroundColor: theme.colors.surfaceVariant },
          disabled && { opacity: 0.5 },
        ]}
        elevation={1}
        icon="magnify"
        clearIcon="close"
      />

      {showSuggestions && suggestions.length > 0 ? (
        <Portal>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setShowSuggestions(false)}
          >
            <View style={styles.suggestionsContainer}>
              <Surface
                style={[
                  styles.suggestionsSurface,
                  {
                    backgroundColor: theme.colors.surface,
                    ...Platform.select({
                      ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                      },
                      android: {
                        elevation: 5,
                      },
                    }),
                  },
                ]}
              >
                <FlatList
                  data={suggestions}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }) => (
                    <>
                      <List.Item
                        title={item}
                        onPress={() => handleSuggestionPress(item)}
                        left={(props) => <List.Icon {...props} icon="magnify" />}
                        right={(props) => <List.Icon {...props} icon="arrow-top-left" />}
                        style={styles.suggestionItem}
                      />
                      {index < suggestions.length - 1 ? <Divider /> : null}
                    </>
                  )}
                  style={styles.suggestionsList}
                />
              </Surface>
            </View>
          </TouchableOpacity>
        </Portal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
  },
  searchBar: {
    borderRadius: 12,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
  },
  suggestionsSurface: {
    borderRadius: 12,
    maxHeight: 300,
    overflow: 'hidden',
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    paddingVertical: 8,
  },
});
