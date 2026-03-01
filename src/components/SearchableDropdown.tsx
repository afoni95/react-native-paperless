import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Searchbar, List, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface SearchableDropdownItem {
  id: number;
  name: string;
}

interface SearchableDropdownProps {
  items: SearchableDropdownItem[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  placeholder?: string;
  label?: string;
  allowClear?: boolean;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  items,
  selectedId,
  onSelect,
  placeholder,
  label,
  allowClear = true,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = items.find((item) => item.id === selectedId);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);

  const handleSelect = (id: number | null) => {
    onSelect(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <List.Item
        title={selectedItem?.name || placeholder || label || t('common.search')}
        titleStyle={!selectedItem ? { color: theme.colors.onSurfaceVariant } : undefined}
        description={label}
        onPress={() => setIsOpen(!isOpen)}
        right={(props) => <List.Icon {...props} icon={isOpen ? 'chevron-up' : 'chevron-down'} />}
        style={[styles.selector, { backgroundColor: theme.colors.surfaceVariant }]}
      />

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
          ]}
        >
          <Searchbar
            placeholder={t('common.search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />

          {allowClear && selectedId && (
            <List.Item
              title={`— ${t('common.none')} —`}
              onPress={() => handleSelect(null)}
              titleStyle={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}
            />
          )}

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {filteredItems.map((item) => (
              <List.Item
                key={String(item.id)}
                title={item.name}
                onPress={() => handleSelect(item.id)}
                style={
                  item.id === selectedId
                    ? { backgroundColor: theme.colors.primaryContainer }
                    : undefined
                }
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  selector: {
    borderRadius: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 250,
    marginTop: 4,
  },
  searchBar: {
    margin: 8,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  list: {
    maxHeight: 180,
  },
});
