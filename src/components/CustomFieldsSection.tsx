import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { CustomField, DocumentCustomFieldValue } from '@/types';
import { SearchableDropdown } from './SearchableDropdown';
import { CustomFieldEditor } from './CustomFieldEditor';

interface Props {
  customFields: DocumentCustomFieldValue[];
  availableFields: CustomField[];
  customFieldsMap: Map<number, CustomField>;
  fieldToAdd: number | null;
  onFieldToAddChange: (id: number | null) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: number) => void;
  onChangeField: (fieldId: number, value: DocumentCustomFieldValue['value']) => void;
}

export const CustomFieldsSection: React.FC<Props> = ({
  customFields,
  availableFields,
  customFieldsMap,
  fieldToAdd,
  onFieldToAddChange,
  onAddField,
  onRemoveField,
  onChangeField,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <View style={styles.addRow}>
        <View style={styles.addDropdown}>
          <SearchableDropdown
            items={availableFields.map((field) => ({ id: field.id, name: field.name }))}
            selectedId={fieldToAdd}
            onSelect={onFieldToAddChange}
            placeholder={t('documents.selectCustomField')}
          />
        </View>
        <Button mode="outlined" onPress={onAddField} disabled={!fieldToAdd}>
          {t('documents.addCustomField')}
        </Button>
      </View>

      {customFields.length === 0 && (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('documents.noCustomFieldsSet')}
        </Text>
      )}

      {customFields.map((entry) => (
        <CustomFieldEditor
          key={entry.field}
          entry={entry}
          fieldDefinition={customFieldsMap.get(entry.field)}
          onRemove={onRemoveField}
          onChange={onChangeField}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addDropdown: {
    flex: 1,
  },
});
