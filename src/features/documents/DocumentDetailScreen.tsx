import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Text, TextInput, Button, Card, useTheme, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Tag } from '@/types';
import { useAuthStore } from '@/store/authStore';
import {
  LoadingScreen,
  ErrorBanner,
  ConfirmDialog,
  DocumentMetadataForm,
  DocumentMetadataDisplay,
  ShareLinksSheet,
} from '@/components';
import { formatDateTime, coerceCustomFieldValueForSubmit } from '@/utils';
import { DocumentsStackParamList } from '@/navigation/types';
import {
  useDocument,
  useUpdateDocument,
  useDeleteDocument,
  useAddDocumentNote,
} from '@/reactQuery';
import { useDocumentMetadata, useCustomFieldsForm } from '@/hooks';
import { usePermissionContext } from '@/hooks/PermissionProvider';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentDetail'>;

export const DocumentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { documentId } = route.params;
  const { can } = usePermissionContext();

  // Metadata hooks
  const {
    allTags,
    allCorrespondents,
    allDocTypes,
    allStoragePaths,
    allCustomFields,
    tagsMap,
    correspondentsMap,
    docTypesMap,
    storagePathsMap,
    customFieldsMap,
  } = useDocumentMetadata();

  // Custom fields form hook
  const {
    customFields: editCustomFields,
    setCustomFields: setEditCustomFields,
    fieldToAdd: customFieldToAdd,
    setFieldToAdd: setCustomFieldToAdd,
    availableFields: availableCustomFieldsToAdd,
    updateFieldValue: updateCustomFieldValue,
    removeField: removeCustomField,
    addField: addSelectedCustomField,
  } = useCustomFieldsForm(allCustomFields);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCorrespondent, setEditCorrespondent] = useState<number | null>(null);
  const [editDocType, setEditDocType] = useState<number | null>(null);
  const [editStoragePath, setEditStoragePath] = useState<number | null>(null);
  const [editTags, setEditTags] = useState<number[]>([]);
  const [editAsn, setEditAsn] = useState('');
  const [editCreated, setEditCreated] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [shareLinksVisible, setShareLinksVisible] = useState(false);

  const { serverUrl, token } = useAuthStore();

  const { data: doc, isLoading, isError, refetch, isRefetching } = useDocument(documentId);

  const updateMutation = useUpdateDocument({
    onSuccess: () => {
      setIsEditing(false);
    },
    onError: (error) => {
      Alert.alert(
        t('common.error'),
        t('common.somethingWentWrong') + '\n' + (error instanceof Error ? error.message : ''),
      );
    },
  });

  const deleteMutation = useDeleteDocument({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert(
        t('common.error'),
        t('common.somethingWentWrong') + '\n' + (error instanceof Error ? error.message : ''),
      );
    },
  });

  const addNoteMutation = useAddDocumentNote(documentId, {
    onSuccess: () => {
      setNewNote('');
    },
    onError: (error) => {
      Alert.alert(
        t('common.error'),
        t('common.somethingWentWrong') + '\n' + (error instanceof Error ? error.message : ''),
      );
    },
  });

  const startEditing = () => {
    if (!doc) return;
    setEditTitle(doc.title);
    setEditCorrespondent(doc.correspondent);
    setEditDocType(doc.document_type);
    setEditStoragePath(doc.storage_path);
    setEditTags([...doc.tags]);
    setEditAsn(doc.archive_serial_number?.toString() || '');
    setEditCreated(doc.created_date || doc.created?.split('T')[0] || '');
    setEditCustomFields((doc.custom_fields || []).map((item) => ({ ...item })));
    setCustomFieldToAdd(null);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      id: documentId,
      data: {
        title: editTitle,
        correspondent: editCorrespondent,
        document_type: editDocType,
        storage_path: editStoragePath,
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

  const allowEdit = can('change', 'document') || !!doc.user_can_change;
  const allowDelete = can('delete', 'document') || !!doc.user_can_change;

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
              {allowEdit ? (
                <Button mode="outlined" icon="pencil" onPress={startEditing}>
                  {t('common.edit')}
                </Button>
              ) : null}
              <View style={styles.iconActions}>
                <IconButton
                  icon="file-pdf-box"
                  onPress={() => navigation.navigate('PdfViewer', { documentId })}
                  iconColor={theme.colors.primary}
                />
                <IconButton
                  icon="download"
                  iconColor={theme.colors.primary}
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
                />
                {can('view', 'sharelink') ? (
                  <IconButton
                    icon="share-variant"
                    iconColor={theme.colors.primary}
                    onPress={() => setShareLinksVisible(true)}
                  />
                ) : null}
                {allowDelete ? (
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.error}
                    onPress={() => setShowDeleteDialog(true)}
                  />
                ) : null}
              </View>
            </>
          )}
        </View>

        {isEditing ? (
          <DocumentMetadataForm
            title={editTitle}
            onTitleChange={setEditTitle}
            correspondent={editCorrespondent}
            onCorrespondentChange={setEditCorrespondent}
            documentType={editDocType}
            onDocumentTypeChange={setEditDocType}
            storagePath={editStoragePath}
            onStoragePathChange={setEditStoragePath}
            tags={editTags}
            onTagsChange={setEditTags}
            asn={editAsn}
            onAsnChange={setEditAsn}
            createdDate={editCreated}
            onCreatedDateChange={setEditCreated}
            customFields={editCustomFields}
            onCustomFieldsChange={setEditCustomFields}
            fieldToAdd={customFieldToAdd}
            onFieldToAddChange={setCustomFieldToAdd}
            onAddField={addSelectedCustomField}
            onRemoveField={removeCustomField}
            onChangeField={updateCustomFieldValue}
            allCorrespondents={(allCorrespondents || []).map((c) => ({ id: c.id, name: c.name }))}
            allDocumentTypes={(allDocTypes || []).map((dt) => ({ id: dt.id, name: dt.name }))}
            allStoragePaths={(allStoragePaths || []).map((sp) => ({ id: sp.id, name: sp.name }))}
            allTags={allTags || []}
            allCustomFields={allCustomFields || []}
            customFieldsMap={customFieldsMap}
            availableCustomFields={availableCustomFieldsToAdd}
            showAsn
            showCreatedDate
            cardStyle={{ marginBottom: 12, borderRadius: 12 }}
          />
        ) : (
          <DocumentMetadataDisplay
            title={doc.title}
            correspondent={correspondent}
            documentType={docType}
            storagePath={doc.storage_path ? storagePathsMap.get(doc.storage_path) : null}
            tags={docTags}
            asn={doc.archive_serial_number}
            created={doc.created}
            added={doc.added}
            modified={doc.modified}
            customFields={enabledCustomFields}
            customFieldsMap={customFieldsMap}
            cardStyle={{ marginBottom: 12, borderRadius: 12 }}
          />
        )}

        {/* Notes */}
        {can('view', 'note') ? (
          <Card style={[styles.metaCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                {t('documents.notes')}
              </Text>
              {doc.notes &&
                doc.notes.length > 0 &&
                doc.notes.map((note) => (
                  <View
                    key={note.id}
                    style={[styles.noteItem, { borderBottomColor: theme.colors.outlineVariant }]}
                  >
                    <Text variant="bodyMedium">{note.note}</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatDateTime(note.created)}
                    </Text>
                  </View>
                ))}
              {can('add', 'note') ? (
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
              ) : null}
            </Card.Content>
          </Card>
        ) : null}
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

      {can('view', 'sharelink') ? (
        <ShareLinksSheet
          visible={shareLinksVisible}
          onDismiss={() => setShareLinksVisible(false)}
          documentId={documentId}
          documentTitle={doc.title}
        />
      ) : null}
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
    justifyContent: 'space-between',
  },
  iconActions: {
    flexDirection: 'row',
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
  },
  addNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  noteInput: {
    flex: 1,
  },
});
