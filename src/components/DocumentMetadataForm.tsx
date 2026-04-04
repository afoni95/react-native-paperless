import React from 'react';
import { Card, TextInput, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { Tag } from '@/types';
import type { CustomField, DocumentCustomFieldValue } from '@/types';
import { SearchableDropdown } from './SearchableDropdown';
import { MultiSelectChips } from './MultiSelectChips';
import { CustomFieldsSection } from './CustomFieldsSection';

interface DocumentMetadataFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  correspondent: number | null;
  onCorrespondentChange: (value: number | null) => void;
  documentType: number | null;
  onDocumentTypeChange: (value: number | null) => void;
  storagePath: number | null;
  onStoragePathChange: (value: number | null) => void;
  tags: number[];
  onTagsChange: (value: number[]) => void;
  asn?: string;
  onAsnChange?: (value: string) => void;
  createdDate?: string;
  onCreatedDateChange?: (value: string) => void;
  customFields?: DocumentCustomFieldValue[];
  onCustomFieldsChange?: (value: DocumentCustomFieldValue[]) => void;
  fieldToAdd?: number | null;
  onFieldToAddChange?: (value: number | null) => void;
  onAddField?: () => void;
  onRemoveField?: (fieldId: number) => void;
  onChangeField?: (fieldId: number, value: DocumentCustomFieldValue['value']) => void;
  allCorrespondents?: { id: number; name: string }[];
  allDocumentTypes?: { id: number; name: string }[];
  allStoragePaths?: { id: number; name: string }[];
  allTags?: Tag[];
  allCustomFields?: CustomField[];
  customFieldsMap?: Map<number, CustomField>;
  availableCustomFields?: CustomField[];
  showAsn?: boolean;
  showCreatedDate?: boolean;
  inputStyle?: Record<string, unknown>;
  cardStyle?: Record<string, unknown>;
}

export const DocumentMetadataForm: React.FC<DocumentMetadataFormProps> = ({
  title,
  onTitleChange,
  correspondent,
  onCorrespondentChange,
  documentType,
  onDocumentTypeChange,
  storagePath,
  onStoragePathChange,
  tags,
  onTagsChange,
  asn,
  onAsnChange,
  createdDate,
  onCreatedDateChange,
  customFields,
  fieldToAdd,
  onFieldToAddChange,
  onAddField,
  onRemoveField,
  onChangeField,
  allCorrespondents = [],
  allDocumentTypes = [],
  allStoragePaths = [],
  allTags = [],
  allCustomFields = [],
  customFieldsMap,
  availableCustomFields = [],
  showAsn = false,
  showCreatedDate = false,
  inputStyle,
  cardStyle,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Card
        style={[
          cardStyle || { marginBottom: 16, borderRadius: 12 },
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Card.Content>
          <TextInput
            label={t('documents.singularEntity')}
            value={title}
            onChangeText={onTitleChange}
            mode="outlined"
            style={inputStyle || { marginBottom: 12 }}
          />

          <SearchableDropdown
            items={allCorrespondents}
            selectedId={correspondent}
            onSelect={onCorrespondentChange}
            label={t('documents.correspondent')}
            placeholder={t('documents.noCorrespondent')}
          />

          <SearchableDropdown
            items={allDocumentTypes}
            selectedId={documentType}
            onSelect={onDocumentTypeChange}
            label={t('documents.documentType')}
            placeholder={t('documents.noDocumentType')}
          />

          <SearchableDropdown
            items={allStoragePaths}
            selectedId={storagePath}
            onSelect={onStoragePathChange}
            label={t('documents.storagePath')}
            placeholder={t('documents.noStoragePath')}
          />

          <MultiSelectChips
            chipItems={allTags}
            selectedIds={tags}
            onSelectionChange={onTagsChange}
            label={t('documents.tags')}
          />

          {showAsn && asn !== undefined && onAsnChange && (
            <TextInput
              label={t('documents.asn')}
              value={asn}
              onChangeText={onAsnChange}
              mode="outlined"
              keyboardType="numeric"
              style={inputStyle || { marginBottom: 12 }}
            />
          )}

          {showCreatedDate && createdDate !== undefined && onCreatedDateChange && (
            <TextInput
              label={t('documents.created') + ' (YYYY-MM-DD)'}
              value={createdDate}
              onChangeText={onCreatedDateChange}
              mode="outlined"
              style={inputStyle || { marginBottom: 12 }}
              placeholder="2024-01-31"
            />
          )}
        </Card.Content>
      </Card>

      {customFields !== undefined &&
        allCustomFields.length > 0 &&
        customFieldsMap &&
        onFieldToAddChange &&
        onAddField &&
        onRemoveField &&
        onChangeField && (
          <Card
            style={[
              cardStyle || { marginBottom: 16, borderRadius: 12 },
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Title title={t('customFields.title')} />
            <Card.Content>
              <CustomFieldsSection
                customFields={customFields}
                availableFields={availableCustomFields}
                customFieldsMap={customFieldsMap}
                fieldToAdd={fieldToAdd || null}
                onFieldToAddChange={onFieldToAddChange}
                onAddField={onAddField}
                onRemoveField={onRemoveField}
                onChangeField={onChangeField}
              />
            </Card.Content>
          </Card>
        )}
    </>
  );
};
