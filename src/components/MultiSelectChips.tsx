import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { getContrastTextColor, sanitizeColor } from '@/utils';

export type ChipItem = {
  id: number;
  name: string;
  color?: string;
  text_color?: string;
};

interface MultiSelectChipsProps {
  chipItems: ChipItem[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  label?: string;
}

const MAX_VISIBLE = 6;

export const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
  chipItems: tags,
  selectedIds,
  onSelectionChange,
  label,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const filteredTags = useMemo(() => {
    if (!searchQuery) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tags, searchQuery]);

  const visibleTags = useMemo(() => {
    if (expanded) return filteredTags;
    // Prefer selected tags first, then fill with non-selected until MAX_VISIBLE.
    const selectedInFiltered = filteredTags.filter((tag) => selectedIds.includes(tag.id));
    const nonSelected = filteredTags.filter((tag) => !selectedIds.includes(tag.id));
    return [...selectedInFiltered, ...nonSelected].slice(0, MAX_VISIBLE);
  }, [filteredTags, expanded, selectedIds]);

  const extraCount = Math.max(0, filteredTags.length - visibleTags.length);

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
        <Text variant="labelLarge" style={{ color: theme.colors.onSurface, marginBottom: 6 }}>
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

      <ScrollView
        style={expanded ? styles.chipContainerMax : styles.chipContainerMin}
        nestedScrollEnabled
      >
        <View style={styles.chipWrap}>
          {visibleTags.map((tag) => {
            const isSelected = selectedIds.includes(tag.id);
            return (
              <Chip
                key={tag.id}
                mode="flat"
                selected={isSelected}
                onPress={() => handleToggle(tag.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected
                      ? sanitizeColor(tag.color, theme.colors.primaryContainer)
                      : theme.colors.surfaceVariant,
                  },
                ]}
                textStyle={[
                  styles.chipText,
                  {
                    color: isSelected
                      ? tag.text_color ||
                        getContrastTextColor(sanitizeColor(tag.color, theme.colors.primaryContainer))
                      : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {tag.name}
              </Chip>
            );
          })}

          {!expanded && extraCount > 0 ? (
            <Chip
              mode="outlined"
              onPress={() => setExpanded(true)}
              style={styles.moreChip}
              textStyle={styles.chipText}
            >
              +{extraCount}
            </Chip>
          ) : null}

          {expanded && filteredTags.length > MAX_VISIBLE ? (
            <Chip
              mode="outlined"
              onPress={() => setExpanded(false)}
              style={styles.moreChip}
              textStyle={styles.chipText}
            >
              {t('common.showMore')}
            </Chip>
          ) : null}
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
    fontSize: 13,
    paddingVertical: 0,
  },
  chipContainerMin: {
    maxHeight: 135,
  },
  chipContainerMax: {
    maxHeight: 260,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  chipText: {
    fontSize: 12,
  },
  moreChip: {
    marginRight: 6,
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 28,
  },
});
