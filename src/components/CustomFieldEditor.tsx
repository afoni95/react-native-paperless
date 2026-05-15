import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Switch, Chip, IconButton, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { CustomField, DocumentCustomFieldValue } from '@/types';
import { DocumentLinkEditor } from './DocumentLinkEditor';

interface CustomFieldEditorProps {
  entry: DocumentCustomFieldValue;
  fieldDefinition: CustomField | undefined;
  onRemove: (fieldId: number) => void;
  onChange: (fieldId: number, value: DocumentCustomFieldValue['value']) => void;
}

export const CustomFieldEditor: React.FC<CustomFieldEditorProps> = ({
  entry,
  fieldDefinition,
  onRemove,
  onChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const isSelectField = fieldDefinition?.data_type === 'select';
  const hasSelectOptions = !!fieldDefinition?.extra_data?.select_options?.length;
  const isDocumentLink = fieldDefinition?.data_type === 'documentlink';
  const selectValues = Array.isArray(entry.value) ? entry.value.map((v) => String(v)) : [];
  const docLinkIds =
    isDocumentLink && Array.isArray(entry.value)
      ? (entry.value as (string | number)[]).map((v) => Number(v)).filter((n) => !Number.isNaN(n))
      : [];

  const handleRemove = () => onRemove(entry.field);
  const handleTextChange = (value: string) => onChange(entry.field, value);
  const handleToggleOption = (optionId: string) => {
    const isSelected = selectValues.includes(optionId);
    const nextValues = isSelected
      ? selectValues.filter((id) => id !== optionId)
      : [...selectValues, optionId];
    const normalized = nextValues.map((id) => {
      const parsed = Number.parseInt(id, 10);
      return Number.isNaN(parsed) ? id : parsed;
    });
    onChange(entry.field, normalized.length > 0 ? normalized : '');
  };

  return (
    <View style={[styles.editor, { borderColor: theme.colors.outlineVariant }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall">{fieldDefinition?.name || `#${entry.field}`}</Text>
        </View>
        <IconButton
          icon="close"
          size={18}
          onPress={handleRemove}
          accessibilityLabel={t('documents.removeCustomField')}
        />
      </View>

      {fieldDefinition?.data_type === 'boolean' ? (
        <View style={styles.booleanRow}>
          <Switch value={Boolean(entry.value)} onValueChange={(v) => onChange(entry.field, v)} />
        </View>
      ) : isDocumentLink ? (
        <DocumentLinkEditor value={docLinkIds} onChange={(ids) => onChange(entry.field, ids)} />
      ) : isSelectField && hasSelectOptions ? (
        <View style={styles.chipsRow}>
          {fieldDefinition!.extra_data!.select_options.map((option) => {
            const optionId = String(option.id);
            const isSelected = selectValues.includes(optionId);
            return (
              <Chip
                key={optionId}
                selected={isSelected}
                onPress={() => handleToggleOption(optionId)}
                style={styles.chip}
              >
                {option.label}
              </Chip>
            );
          })}
        </View>
      ) : (
        <TextInput
          mode="outlined"
          value={Array.isArray(entry.value) ? entry.value.join(', ') : String(entry.value ?? '')}
          onChangeText={handleTextChange}
          multiline={fieldDefinition?.data_type === 'longtext'}
          keyboardType={
            fieldDefinition?.data_type === 'integer' || fieldDefinition?.data_type === 'float'
              ? 'numeric'
              : 'default'
          }
          placeholder={t('documents.customFieldValue')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  editor: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  booleanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
});
