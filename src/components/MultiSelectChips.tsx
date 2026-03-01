import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Tag } from '@/types';
import { getContrastTextColor } from '@/utils';

interface MultiSelectChipsProps {
  tags: Tag[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  label?: string;
}

export const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
  tags,
  selectedIds,
  onSelectionChange,
  label,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = useMemo(() => {
    if (!searchQuery) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tags, searchQuery]);

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((tid) => tid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <View style={styles.container}>
      {!!label && (
        <Text variant="labelLarge" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
          {label}
        </Text>
      )}

      <Searchbar
        placeholder={t('common.search')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      <ScrollView style={styles.chipContainer} nestedScrollEnabled>
        <View style={styles.chipWrap}>
          {filteredTags.map((tag) => {
            const isSelected = selectedIds.includes(tag.id);
            return (
              <Chip
                key={tag.id}
                mode="flat"
                selected={isSelected}
                onPress={() => handleToggle(tag.id)}
                style={{
                  backgroundColor: isSelected
                    ? tag.color || theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                  marginRight: 4,
                  marginBottom: 4,
                }}
                textStyle={{
                  color: isSelected
                    ? tag.text_color || getContrastTextColor(tag.color)
                    : theme.colors.onSurfaceVariant,
                  fontSize: 12,
                }}
              >
                {tag.name}
              </Chip>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 8,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  chipContainer: {
    maxHeight: 150,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
