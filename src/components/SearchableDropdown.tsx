import React, { useState, useMemo, useRef } from 'react';
import { View, ScrollView, StyleSheet, Modal, Pressable } from 'react-native';
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
  const [dropdownLayout, setDropdownLayout] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);

  const selectedItem = items.find((item) => item.id === selectedId);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownLayout({ top: y + height + 4, left: x, width });
      setIsOpen(true);
    });
  };

  const handleSelect = (id: number | null) => {
    onSelect(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container} ref={triggerRef}>
      <List.Item
        title={selectedItem?.name || placeholder || label || t('common.search')}
        titleStyle={!selectedItem ? { color: theme.colors.onSurfaceVariant } : undefined}
        description={label}
        onPress={handleOpen}
        right={(props) => <List.Icon {...props} icon={isOpen ? 'chevron-up' : 'chevron-down'} />}
        style={[styles.selector, { backgroundColor: theme.colors.surfaceVariant }]}
      />

      <Modal transparent visible={isOpen} onRequestClose={handleClose} animationType="none">
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable
            style={[
              styles.dropdown,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
                top: dropdownLayout?.top ?? 0,
                left: dropdownLayout?.left ?? 0,
                width: dropdownLayout?.width ?? 0,
              },
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
          </Pressable>
        </Pressable>
      </Modal>
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
  backdrop: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 300,
    elevation: 8,
    shadowColor: '#00000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  searchBar: {
    margin: 8,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  list: {
    maxHeight: 220,
  },
});
