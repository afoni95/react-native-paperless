import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  useTheme,
  IconButton,
  List,
  Chip,
  Switch,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Tag, Correspondent, DocumentType, CustomField, DocumentCustomFieldValue } from '@/types';
import { useAuthStore } from '@/store/authStore';
import {
  LoadingScreen,
  ErrorBanner,
  TagChip,
  ConfirmDialog,
  SearchableDropdown,
  MultiSelectChips,
  DocumentLinkEditor,
  DocumentLinkDisplay,
} from '@/components';
import { formatDate, formatDateTime } from '@/utils';
import { DocumentsStackParamList } from '@/navigation/types';
import {
  useDocument,
  useAllTags,
  useAllCorrespondents,
  useAllDocumentTypes,
  useAllCustomFields,
  useUpdateDocument,
  useDeleteDocument,
  useAddDocumentNote,
} from '@/reactQuery';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentDetail'>;

const getDefaultCustomFieldValue = (field?: CustomField) => {
  if (!field) return '';
  if (field.data_type === 'boolean') return false;
  if (field.data_type === 'select' || field.data_type === 'documentlink') return [];
  return '';
};

const coerceCustomFieldValueForSubmit = (
  value: DocumentCustomFieldValue['value'],
  field?: CustomField,
): DocumentCustomFieldValue['value'] => {
  if (!field) return value;

  if (field.data_type === 'boolean') {
    if (typeof value === 'boolean') return value;
    return value === 'true';
  }

  if (field.data_type === 'integer') {
    if (value === '' || value === null) return null;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? value : parsed;
  }

  if (field.data_type === 'float') {
    if (value === '' || value === null) return null;
    const parsed = Number.parseFloat(String(value));
    return Number.isNaN(parsed) ? value : parsed;
  }

  if (field.data_type === 'documentlink') {
    if (Array.isArray(value)) return value;
    const parsedValues = String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => {
        const n = Number.parseInt(v, 10);
        return Number.isNaN(n) ? v : n;
      });
    return parsedValues;
  }

  return value;
};

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

export const DocumentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { documentId } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCorrespondent, setEditCorrespondent] = useState<number | null>(null);
  const [editDocType, setEditDocType] = useState<number | null>(null);
  const [editTags, setEditTags] = useState<number[]>([]);
  const [editAsn, setEditAsn] = useState('');
  const [editCreated, setEditCreated] = useState('');
  const [editCustomFields, setEditCustomFields] = useState<DocumentCustomFieldValue[]>([]);
  const [customFieldToAdd, setCustomFieldToAdd] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');

  const { serverUrl, token } = useAuthStore();

  const { data: doc, isLoading, isError, refetch, isRefetching } = useDocument(documentId);

  const { data: allTags } = useAllTags(true, { staleTime: 5 * 60 * 1000 });
  const { data: allCorrespondents } = useAllCorrespondents(true, { staleTime: 5 * 60 * 1000 });
  const { data: allDocTypes } = useAllDocumentTypes(true, { staleTime: 5 * 60 * 1000 });
  const { data: allCustomFields } = useAllCustomFields(true, { staleTime: 5 * 60 * 1000 });

  const tagsMap = useMemo(() => {
    const map = new Map<number, Tag>();
    allTags?.forEach((tag) => map.set(tag.id, tag));
    return map;
  }, [allTags]);

  const correspondentsMap = useMemo(() => {
    const map = new Map<number, Correspondent>();
    allCorrespondents?.forEach((c) => map.set(c.id, c));
    return map;
  }, [allCorrespondents]);

  const docTypesMap = useMemo(() => {
    const map = new Map<number, DocumentType>();
    allDocTypes?.forEach((dt) => map.set(dt.id, dt));
    return map;
  }, [allDocTypes]);

  const customFieldsMap = useMemo(() => {
    const map = new Map<number, CustomField>();
    allCustomFields?.forEach((field) => map.set(field.id, field));
    return map;
  }, [allCustomFields]);

  const updateMutation = useUpdateDocument({
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  const deleteMutation = useDeleteDocument({
    onSuccess: () => {
      navigation.goBack();
    },
  });

  const addNoteMutation = useAddDocumentNote(documentId, {
    onSuccess: () => {
      setNewNote('');
    },
  });

  const startEditing = () => {
    if (!doc) return;
    setEditTitle(doc.title);
    setEditCorrespondent(doc.correspondent);
    setEditDocType(doc.document_type);
    setEditTags([...doc.tags]);
    setEditAsn(doc.archive_serial_number?.toString() || '');
    setEditCreated(doc.created_date || doc.created?.split('T')[0] || '');
    setEditCustomFields((doc.custom_fields || []).map((item) => ({ ...item })));
    setCustomFieldToAdd(null);
    setIsEditing(true);
  };

  const updateCustomFieldValue = (fieldId: number, value: DocumentCustomFieldValue['value']) => {
    setEditCustomFields((prev) =>
      prev.map((entry) => (entry.field === fieldId ? { ...entry, value } : entry)),
    );
  };

  const removeCustomField = (fieldId: number) => {
    setEditCustomFields((prev) => prev.filter((entry) => entry.field !== fieldId));
  };

  const addSelectedCustomField = () => {
    if (!customFieldToAdd) return;
    const fieldDefinition = customFieldsMap.get(customFieldToAdd);

    setEditCustomFields((prev) => {
      if (prev.some((entry) => entry.field === customFieldToAdd)) return prev;
      return [
        ...prev,
        { field: customFieldToAdd, value: getDefaultCustomFieldValue(fieldDefinition) },
      ];
    });

    setCustomFieldToAdd(null);
  };

  const handleSave = () => {
    updateMutation.mutate({
      id: documentId,
      data: {
        title: editTitle,
        correspondent: editCorrespondent,
        document_type: editDocType,
        tags: editTags,
        archive_serial_number: editAsn ? parseInt(editAsn, 10) : null,
        created_date: editCreated || undefined,
        custom_fields: editCustomFields.map((entry) => ({
          field: entry.field,
          value: coerceCustomFieldValueForSubmit(entry.value, customFieldsMap.get(entry.field)),
        })),
      },
    });
  };

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  if (isError || !doc) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorBanner message={t('common.somethingWentWrong')} onRetry={refetch} />
      </View>
    );
  }

  const correspondent = doc.correspondent ? correspondentsMap.get(doc.correspondent) : null;
  const docType = doc.document_type ? docTypesMap.get(doc.document_type) : null;
  const docTags = doc.tags.map((id) => tagsMap.get(id)).filter(Boolean) as Tag[];
  const enabledCustomFields = doc.custom_fields || [];
  const availableCustomFieldsToAdd = (allCustomFields || []).filter(
    (field) => !editCustomFields.some((entry) => entry.field === field.id),
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
        nestedScrollEnabled
      >
        <View style={styles.actions}>
          {isEditing ? (
            <>
              <Button mode="outlined" onPress={() => setIsEditing(false)}>
                {t('common.cancel')}
              </Button>
              <Button mode="contained" onPress={handleSave} loading={updateMutation.isPending}>
                {t('common.save')}
              </Button>
            </>
          ) : (
            <>
              <Button mode="outlined" icon="pencil" onPress={startEditing}>
                {t('common.edit')}
              </Button>
              <Button
                mode="outlined"
                icon="file-pdf-box"
                onPress={() => navigation.navigate('PdfViewer', { documentId })}
              >
                {t('documents.viewPdf')}
              </Button>
              <Button
                mode="outlined"
                icon="download"
                onPress={async () => {
                  try {
                    const baseUrl = serverUrl.replace(/\/+$/, '');
                    const downloadUrl = `${baseUrl}/api/documents/${documentId}/download/`;
                    const filename = `${doc?.title || 'document'}.pdf`;
                    const fileUri = `${FileSystem.documentDirectory}${filename}`;

                    const result = await FileSystem.downloadAsync(downloadUrl, fileUri, {
                      headers: { Authorization: `Token ${token}` },
                    });

                    if (result.status !== 200) {
                      Alert.alert(t('documents.downloadFailed'), t('documents.downloadError'));
                      return;
                    }

                    await Sharing.shareAsync(fileUri, {
                      mimeType: 'application/pdf',
                      UTI: 'com.adobe.pdf',
                    });
                  } catch (error) {
                    Alert.alert(t('documents.downloadFailed'), t('documents.downloadError'));
                    if (__DEV__) console.warn('download err', error);
                  }
                }}
              >
                {t('documents.download')}
              </Button>
              <IconButton
                icon="delete"
                iconColor={theme.colors.error}
                onPress={() => setShowDeleteDialog(true)}
              />
            </>
          )}
        </View>
        {/* Title */}
        {isEditing ? (
          <TextInput
            label={t('documents.title')}
            value={editTitle}
            onChangeText={setEditTitle}
            mode="outlined"
            style={styles.input}
          />
        ) : (
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            {doc.title}
          </Text>
        )}

        {/* Metadata */}
        <Card style={[styles.metaCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            {/* Correspondent */}
            {isEditing ? (
              <SearchableDropdown
                items={(allCorrespondents || []).map((c) => ({ id: c.id, name: c.name }))}
                selectedId={editCorrespondent}
                onSelect={setEditCorrespondent}
                label={t('documents.correspondent')}
                placeholder={t('documents.noCorrespondent')}
              />
            ) : (
              <List.Item
                title={t('documents.correspondent')}
                description={correspondent?.name || t('documents.noCorrespondent')}
                left={(props) => <List.Icon {...props} icon="account" />}
              />
            )}

            <Divider />

            {/* Document Type */}
            {isEditing ? (
              <SearchableDropdown
                items={(allDocTypes || []).map((dt) => ({ id: dt.id, name: dt.name }))}
                selectedId={editDocType}
                onSelect={setEditDocType}
                label={t('documents.documentType')}
                placeholder={t('documents.noDocumentType')}
              />
            ) : (
              <List.Item
                title={t('documents.documentType')}
                description={docType?.name || t('documents.noDocumentType')}
                left={(props) => <List.Icon {...props} icon="file-document" />}
              />
            )}

            <Divider />

            {/* ASN */}
            {isEditing ? (
              <TextInput
                label={t('documents.asn')}
                value={editAsn}
                onChangeText={setEditAsn}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
            ) : (
              <List.Item
                title={t('documents.asn')}
                description={doc.archive_serial_number?.toString() || '—'}
                left={(props) => <List.Icon {...props} icon="pound" />}
              />
            )}

            <Divider />

            {/* Dates */}
            {isEditing ? (
              <TextInput
                label={t('documents.created') + ' (YYYY-MM-DD)'}
                value={editCreated}
                onChangeText={setEditCreated}
                mode="outlined"
                style={styles.input}
                placeholder="2024-01-31"
              />
            ) : (
              <List.Item
                title={t('documents.created')}
                description={formatDate(doc.created)}
                left={(props) => <List.Icon {...props} icon="calendar" />}
              />
            )}
            <List.Item
              title={t('documents.added')}
              description={formatDateTime(doc.added)}
              left={(props) => <List.Icon {...props} icon="calendar-plus" />}
            />
            <List.Item
              title={t('documents.modified')}
              description={formatDateTime(doc.modified)}
              left={(props) => <List.Icon {...props} icon="calendar-edit" />}
            />
          </Card.Content>
        </Card>

        {/* Tags */}
        <Card style={[styles.metaCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {t('documents.tags')}
            </Text>
            {isEditing ? (
              <MultiSelectChips
                tags={allTags || []}
                selectedIds={editTags}
                onSelectionChange={setEditTags}
              />
            ) : (
              <View style={styles.tagsRow}>
                {docTags.length > 0 ? (
                  docTags.map((tag) => (
                    <TagChip key={tag.id} name={tag.name} color={tag.color} compact={false} />
                  ))
                ) : (
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t('documents.noTags')}
                  </Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Custom Fields */}
        {(isEditing || enabledCustomFields.length > 0) && (
          <Card style={[styles.metaCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                {t('customFields.title')}
              </Text>

              {isEditing ? (
                <>
                  <View style={styles.customFieldAddRow}>
                    <View style={styles.customFieldAddDropdown}>
                      <SearchableDropdown
                        items={availableCustomFieldsToAdd.map((field) => ({
                          id: field.id,
                          name: field.name,
                        }))}
                        selectedId={customFieldToAdd}
                        onSelect={setCustomFieldToAdd}
                        // label={t('documents.addCustomField')}
                        placeholder={t('documents.selectCustomField')}
                      />
                    </View>
                    <Button
                      mode="outlined"
                      onPress={addSelectedCustomField}
                      disabled={!customFieldToAdd}
                    >
                      {t('documents.addCustomField')}
                    </Button>
                  </View>

                  {editCustomFields.length === 0 && (
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {t('documents.noCustomFieldsSet')}
                    </Text>
                  )}

                  {editCustomFields.map((entry) => {
                    const fieldDefinition = customFieldsMap.get(entry.field);
                    const isSelectField = fieldDefinition?.data_type === 'select';
                    const hasSelectOptions = !!fieldDefinition?.extra_data?.select_options?.length;
                    const isDocumentLink = fieldDefinition?.data_type === 'documentlink';
                    const selectValues = Array.isArray(entry.value)
                      ? entry.value.map((value) => String(value))
                      : [];
                    const docLinkIds = Array.isArray(entry.value)
                      ? (entry.value as (string | number)[])
                          .map((v) => Number(v))
                          .filter((n) => !Number.isNaN(n))
                      : [];

                    return (
                      <View
                        key={entry.field}
                        style={[
                          styles.customFieldEditor,
                          { borderColor: theme.colors.outlineVariant },
                        ]}
                      >
                        <View style={styles.customFieldEditorHeader}>
                          <View style={{ flex: 1 }}>
                            <Text variant="titleSmall">
                              {fieldDefinition?.name || `#${entry.field}`}
                            </Text>
                          </View>
                          <IconButton
                            icon="close"
                            size={18}
                            onPress={() => removeCustomField(entry.field)}
                            accessibilityLabel={t('documents.removeCustomField')}
                          />
                        </View>

                        {fieldDefinition?.data_type === 'boolean' ? (
                          <View style={styles.customFieldSwitchRow}>
                            <Text>{String(Boolean(entry.value))}</Text>
                            <Switch
                              value={Boolean(entry.value)}
                              onValueChange={(nextValue) =>
                                updateCustomFieldValue(entry.field, nextValue)
                              }
                            />
                          </View>
                        ) : isDocumentLink ? (
                          <DocumentLinkEditor
                            value={docLinkIds}
                            onChange={(ids) => updateCustomFieldValue(entry.field, ids)}
                          />
                        ) : isSelectField && hasSelectOptions ? (
                          <View style={styles.customFieldOptionRow}>
                            {fieldDefinition.extra_data!.select_options.map((option) => {
                              const optionId = String(option.id);
                              const isSelected = selectValues.includes(optionId);

                              return (
                                <Chip
                                  key={optionId}
                                  selected={isSelected}
                                  onPress={() => {
                                    const nextValues = isSelected
                                      ? selectValues.filter((id) => id !== optionId)
                                      : [...selectValues, optionId];
                                    const normalizedValues = nextValues.map((id) => {
                                      const parsed = Number.parseInt(id, 10);
                                      return Number.isNaN(parsed) ? id : parsed;
                                    });
                                    updateCustomFieldValue(entry.field, normalizedValues);
                                  }}
                                  style={styles.customFieldOptionChip}
                                >
                                  {option.label}
                                </Chip>
                              );
                            })}
                          </View>
                        ) : (
                          <TextInput
                            mode="outlined"
                            value={
                              Array.isArray(entry.value)
                                ? entry.value.join(', ')
                                : String(entry.value ?? '')
                            }
                            onChangeText={(nextValue) =>
                              updateCustomFieldValue(entry.field, nextValue)
                            }
                            multiline={fieldDefinition?.data_type === 'longtext'}
                            keyboardType={
                              fieldDefinition?.data_type === 'integer' ||
                              fieldDefinition?.data_type === 'float'
                                ? 'numeric'
                                : 'default'
                            }
                            placeholder={t('documents.customFieldValue')}
                          />
                        )}
                      </View>
                    );
                  })}
                </>
              ) : (
                <>
                  {enabledCustomFields.map((entry) => {
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
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Notes */}
        <Card style={[styles.metaCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {t('documents.notes')}
            </Text>
            {doc.notes &&
              doc.notes.length > 0 &&
              doc.notes.map((note) => (
                <View key={note.id} style={styles.noteItem}>
                  <Text variant="bodyMedium">{note.note}</Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDateTime(note.created)}
                  </Text>
                </View>
              ))}
            <View style={styles.addNoteRow}>
              <TextInput
                placeholder={t('documents.addNote')}
                value={newNote}
                onChangeText={setNewNote}
                mode="outlined"
                style={[styles.noteInput]}
                dense
              />
              <IconButton
                icon="send"
                onPress={() => {
                  if (newNote.trim()) addNoteMutation.mutate(newNote.trim());
                }}
                disabled={!newNote.trim() || addNoteMutation.isPending}
              />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteDialog}
        title={t('common.delete')}
        message={t('documents.deleteConfirm')}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          deleteMutation.mutate(documentId);
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  metaCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noteItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  addNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  noteInput: {
    flex: 1,
  },
  customFieldAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  customFieldAddDropdown: {
    flex: 1,
  },
  customFieldEditor: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  customFieldEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customFieldSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customFieldOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  customFieldOptionChip: {
    marginBottom: 4,
  },
});
