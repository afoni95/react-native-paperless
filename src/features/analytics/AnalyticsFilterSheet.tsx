import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilter } from './types';
import { defaultFilter } from './utils';
import { MultiSelectChips, SearchableDropdown } from '@/components';
import type { Correspondent, DocumentType, Tag } from '@/types';

interface AnalyticsFilterSheetProps {
  visible: boolean;
  value: AnalyticsFilter;
  onDismiss: () => void;
  onApply: (value: AnalyticsFilter) => void;
  correspondents: Correspondent[];
  documentTypes: DocumentType[];
  tags: Tag[];
}

export const AnalyticsFilterSheet: React.FC<AnalyticsFilterSheetProps> = ({
  visible,
  value,
  onDismiss,
  onApply,
  correspondents,
  documentTypes,
  tags,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [localValue, setLocalValue] = React.useState<AnalyticsFilter>(value);

  React.useEffect(() => {
    if (visible) setLocalValue(value);
  }, [value, visible]);

  const selectedCorrespondent = localValue.correspondentIds?.[0] ?? null;
  const selectedDocumentType = localValue.documentTypeIds?.[0] ?? null;
  const timeRangeOptions = [
    { id: 1, value: 'all', name: t('analytics.timeRange.all') },
    { id: 2, value: 'last30d', name: t('analytics.timeRange.last30d') },
    { id: 3, value: 'last90d', name: t('analytics.timeRange.last90d') },
    { id: 4, value: 'last365d', name: t('analytics.timeRange.last365d') },
    { id: 5, value: 'thisYear', name: t('analytics.timeRange.thisYear') },
    { id: 6, value: 'thisYearQ1', name: t('analytics.timeRange.thisYearQ1') },
    { id: 7, value: 'thisYearQ2', name: t('analytics.timeRange.thisYearQ2') },
    { id: 8, value: 'thisYearQ3', name: t('analytics.timeRange.thisYearQ3') },
    { id: 9, value: 'thisYearQ4', name: t('analytics.timeRange.thisYearQ4') },
    { id: 10, value: 'custom', name: t('analytics.timeRange.custom') },
  ] as const;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}
        onPress={onDismiss}
      />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <Text variant="titleLarge">{t('analytics.editor.filters')}</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>
        <Divider />

        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            {t('analytics.editor.timeRange')}
          </Text>
          <SearchableDropdown
            items={timeRangeOptions.map((item) => ({ id: item.id, name: item.name }))}
            selectedId={
              timeRangeOptions.find((item) => item.value === localValue.timeRange)?.id ?? null
            }
            onSelect={(id) => {
              const selected = timeRangeOptions.find((item) => item.id === id);
              if (!selected) return;
              setLocalValue({ ...localValue, timeRange: selected.value });
            }}
            label={t('analytics.editor.timeRange')}
            placeholder={t('common.none')}
            searchable={false}
            canClear={false}
          />

          {localValue.timeRange === 'custom' ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              <TextInput
                mode="outlined"
                label={t('analytics.editor.startDate')}
                value={localValue.startDate ?? ''}
                onChangeText={(startDate) => setLocalValue({ ...localValue, startDate })}
                placeholder="2026-01-31"
              />
              <TextInput
                mode="outlined"
                label={t('analytics.editor.endDate')}
                value={localValue.endDate ?? ''}
                onChangeText={(endDate) => setLocalValue({ ...localValue, endDate })}
                placeholder="2026-12-31"
              />
            </View>
          ) : null}

          <Divider style={styles.divider} />

          <Text variant="labelLarge" style={styles.sectionLabel}>
            {t('analytics.dimension.correspondent')}
          </Text>
          <SearchableDropdown
            items={correspondents.map((item) => ({ id: item.id, name: item.name }))}
            selectedId={selectedCorrespondent}
            onSelect={(id) =>
              setLocalValue({ ...localValue, correspondentIds: id ? [id] : undefined })
            }
            label={t('analytics.dimension.correspondent')}
            placeholder={t('documents.all')}
            canClear={false}
          />

          <Divider style={styles.divider} />

          <Text variant="labelLarge" style={styles.sectionLabel}>
            {t('analytics.dimension.documentType')}
          </Text>
          <SearchableDropdown
            items={documentTypes.map((item) => ({ id: item.id, name: item.name }))}
            selectedId={selectedDocumentType}
            onSelect={(id) =>
              setLocalValue({ ...localValue, documentTypeIds: id ? [id] : undefined })
            }
            label={t('analytics.dimension.documentType')}
            placeholder={t('documents.all')}
            canClear={false}
          />

          <Divider style={styles.divider} />

          <Text variant="labelLarge" style={styles.sectionLabel}>
            {t('analytics.dimension.tag')}
          </Text>
          <MultiSelectChips
            chipItems={tags}
            selectedIds={localValue.tagIds ?? []}
            onSelectionChange={(tagIds) => setLocalValue({ ...localValue, tagIds })}
          />
        </ScrollView>

        <Divider />

        <View style={styles.actions}>
          <Button mode="outlined" onPress={() => onApply(defaultFilter())}>
            {t('documents.clearFilters')}
          </Button>
          <Button mode="contained" onPress={() => onApply(localValue)}>
            {t('documents.applyFilters')}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  sheet: {
    maxHeight: '84%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    padding: 16,
  },
  sectionLabel: {
    marginBottom: 8,
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
