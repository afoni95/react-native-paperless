import React from 'react';
import { View, ScrollView, StyleSheet, Modal, Pressable } from 'react-native';
import { Text, Button, Chip, Divider, useTheme, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { SearchableDropdown } from './SearchableDropdown';
import { MultiSelectChips } from './MultiSelectChips';
import { Tag, Correspondent, DocumentType } from '@/types';

export interface FilterState {
  correspondent: number | null;
  documentType: number | null;
  tags: number[];
  inbox: boolean | undefined;
}

interface FilterSheetProps {
  visible: boolean;
  onDismiss: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  correspondents: Correspondent[];
  documentTypes: DocumentType[];
  tags: Tag[];
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onDismiss,
  filters,
  onApply,
  correspondents,
  documentTypes,
  tags,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const handleApply = () => {
    onApply(localFilters);
    onDismiss();
  };

  const handleReset = () => {
    const cleared: FilterState = {
      correspondent: null,
      documentType: null,
      tags: [],
      inbox: undefined,
    };
    setLocalFilters(cleared);
    onApply(cleared);
    onDismiss();
  };

  const activeFilterCount = [
    localFilters.correspondent !== null,
    localFilters.documentType !== null,
    localFilters.tags.length > 0,
    localFilters.inbox !== undefined,
  ].filter(Boolean).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
        {/* Header */}

        <View style={styles.header}>
          <Text variant="titleLarge">{t('documents.filterBy')}</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <Divider />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {/* Inbox filter */}

          <Text
            variant="labelLarge"
            style={[styles.sectionLabel, { color: theme.colors.onBackground }]}
          >
            {t('documents.inbox')}
          </Text>
          <View style={styles.chipRow}>
            <Chip
              mode="flat"
              selected={localFilters.inbox === undefined}
              onPress={() => setLocalFilters({ ...localFilters, inbox: undefined })}
              style={styles.chip}
            >
              {t('documents.all')}
            </Chip>
            <Chip
              mode="flat"
              selected={localFilters.inbox === true}
              onPress={() => setLocalFilters({ ...localFilters, inbox: true })}
              style={styles.chip}
            >
              {t('documents.inbox')}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          {/* Correspondent filter */}

          <Text
            variant="labelLarge"
            style={[styles.sectionLabel, { color: theme.colors.onBackground }]}
          >
            {t('documents.correspondent')}
          </Text>
          <SearchableDropdown
            items={correspondents.map((c) => ({ id: c.id, name: c.name }))}
            selectedId={localFilters.correspondent}
            onSelect={(id) => setLocalFilters({ ...localFilters, correspondent: id })}
            label={t('documents.correspondent')}
            placeholder={t('documents.all')}
          />

          <Divider style={styles.divider} />

          {/* Document Type filter */}

          <Text
            variant="labelLarge"
            style={[styles.sectionLabel, { color: theme.colors.onBackground }]}
          >
            {t('documents.documentType')}
          </Text>
          <SearchableDropdown
            items={documentTypes.map((dt) => ({ id: dt.id, name: dt.name }))}
            selectedId={localFilters.documentType}
            onSelect={(id) => setLocalFilters({ ...localFilters, documentType: id })}
            label={t('documents.documentType')}
            placeholder={t('documents.all')}
          />

          <Divider style={styles.divider} />

          {/* Tags filter */}

          <Text
            variant="labelLarge"
            style={[styles.sectionLabel, { color: theme.colors.onBackground }]}
          >
            {t('documents.tags')}
          </Text>
          <MultiSelectChips
            tags={tags}
            selectedIds={localFilters.tags}
            onSelectionChange={(ids) => setLocalFilters({ ...localFilters, tags: ids })}
          />
        </ScrollView>

        <Divider />

        {/* Actions */}

        <View style={styles.actions}>
          <Button mode="outlined" onPress={handleReset}>
            {t('documents.clearFilters')}
          </Button>
          <Button mode="contained" onPress={handleApply}>
            {t('documents.applyFilters')}
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
        </View>
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
  content: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
});
