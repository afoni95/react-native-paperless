import React from 'react';
import { View } from 'react-native';
import { Card, useTheme, Text, List, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { TagChip, DocumentLinkDisplay } from '@/components';
import {
  CustomField,
  DocumentCustomFieldValue,
  Tag,
  Correspondent,
  DocumentType,
  StoragePath,
} from '@/types';
import { formatDate, formatDateTime } from '@/utils';

interface DocumentMetadataDisplayProps {
  title: string;
  correspondent: Correspondent | null | undefined;
  documentType: DocumentType | null | undefined;
  storagePath: StoragePath | null | undefined;
  tags: Tag[];
  asn?: number | null;
  created?: string;
  added?: string;
  modified?: string;
  customFields?: DocumentCustomFieldValue[];
  customFieldsMap?: Map<number, CustomField>;
  cardStyle?: Record<string, unknown>;
}

const formatCustomFieldValue = (value: DocumentCustomFieldValue['value'], field?: CustomField) => {
  if (typeof value === 'boolean') return value ? 'true' : 'false';

  if (Array.isArray(value)) {
    if (field?.data_type === 'select' && field.extra_data?.select_options?.length) {
      const optionLabelById = new Map(
        field.extra_data.select_options.map((opt) => [String(opt.id), opt.label]),
      );

      return value.map((entry) => optionLabelById.get(String(entry)) ?? String(entry)).join(', ');
    }

    return value.map((entry) => String(entry)).join(', ');
  }

  return value === null ? '—' : String(value);
};

export const DocumentMetadataDisplay: React.FC<DocumentMetadataDisplayProps> = ({
  title,
  correspondent,
  documentType,
  storagePath,
  tags,
  asn,
  created,
  added,
  modified,
  customFields,
  customFieldsMap,
  cardStyle,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Text
        variant="headlineSmall"
        style={{
          fontWeight: 'bold',
          marginBottom: 16,
          color: theme.colors.onBackground,
        }}
      >
        {title}
      </Text>

      <Card
        style={[
          cardStyle || { marginBottom: 12, borderRadius: 12 },
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Card.Content>
          <List.Item
            title={t('documents.correspondent')}
            description={correspondent?.name || t('documents.noCorrespondent')}
            left={(props) => <List.Icon {...props} icon="account" />}
          />

          <Divider />

          <List.Item
            title={t('documents.documentType')}
            description={documentType?.name || t('documents.noDocumentType')}
            left={(props) => <List.Icon {...props} icon="file-document" />}
          />

          <Divider />

          <List.Item
            title={t('documents.storagePath')}
            description={storagePath?.name || t('documents.noStoragePath')}
            left={(props) => <List.Icon {...props} icon="folder" />}
          />

          <Divider />

          <List.Item
            title={t('documents.asn')}
            description={asn?.toString() || '—'}
            left={(props) => <List.Icon {...props} icon="pound" />}
          />

          <Divider />

          <List.Item
            title={t('documents.created')}
            description={created ? formatDate(created) : '—'}
            left={(props) => <List.Icon {...props} icon="calendar" />}
          />
          <List.Item
            title={t('documents.added')}
            description={added ? formatDateTime(added) : '—'}
            left={(props) => <List.Icon {...props} icon="calendar-plus" />}
          />
          <List.Item
            title={t('documents.modified')}
            description={modified ? formatDateTime(modified) : '—'}
            left={(props) => <List.Icon {...props} icon="calendar-edit" />}
          />
        </Card.Content>
      </Card>

      <Card
        style={[
          cardStyle || { marginBottom: 12, borderRadius: 12 },
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            {t('documents.tags')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <TagChip key={tag.id} name={tag.name} color={tag.color} compact={false} />
              ))
            ) : (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('documents.noTags')}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {customFields && customFields.length > 0 && customFieldsMap && (
        <Card
          style={[
            cardStyle || { marginBottom: 12, borderRadius: 12 },
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {t('customFields.title')}
            </Text>

            {customFields.map((entry) => {
              const fieldDefinition = customFieldsMap.get(entry.field);
              const isDocumentLink = fieldDefinition?.data_type === 'documentlink';
              const docLinkIds =
                isDocumentLink && Array.isArray(entry.value)
                  ? (entry.value as (string | number)[])
                      .map((v) => Number(v))
                      .filter((n) => !Number.isNaN(n))
                  : [];
              return (
                <List.Item
                  key={entry.field}
                  title={fieldDefinition?.name || `#${entry.field}`}
                  description={
                    isDocumentLink
                      ? () => <DocumentLinkDisplay ids={docLinkIds} />
                      : formatCustomFieldValue(entry.value, fieldDefinition)
                  }
                  left={(props) => <List.Icon {...props} icon="form-textbox" />}
                />
              );
            })}
          </Card.Content>
        </Card>
      )}
    </>
  );
};
