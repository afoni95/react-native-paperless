import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, Text, useTheme, ProgressBar, Card, Snackbar } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { DocumentMetadataForm } from '@/components';

import { taskQueryKeys, useAllTasks, useUploadDocument } from '@/reactQuery';
import { coerceCustomFieldValueForSubmit } from '@/utils';
import { useDocumentMetadata, useCustomFieldsForm } from '@/hooks';
import { useGlobalNavigationHelper } from '@/hooks/useGlobalNavigationHelper';
import { usePermissionContext } from '@/hooks/PermissionProvider';

export const UploadScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { navigateTo } = useGlobalNavigationHelper();

  // Metadata hooks
  const {
    allTags,
    allCorrespondents,
    allDocTypes,
    allStoragePaths,
    allCustomFields,
    customFieldsMap,
  } = useDocumentMetadata();

  const { can } = usePermissionContext();
  const canAddDocument = can('add', 'document');

  // Custom fields form hook
  const {
    customFields: selectedCustomFields,
    setCustomFields: setSelectedCustomFields,
    fieldToAdd: customFieldToAdd,
    setFieldToAdd: setCustomFieldToAdd,
    availableFields: availableCustomFieldsToAdd,
    updateFieldValue: updateCustomFieldValue,
    removeField: removeCustomField,
    addField: addSelectedCustomField,
  } = useCustomFieldsForm(allCustomFields);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [title, setTitle] = useState('');
  const [correspondent, setCorrespondent] = useState<number | null>(null);
  const [documentType, setDocumentType] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [storagePath, setStoragePath] = useState<number | null>(null);

  // Snackbar toast state
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  // Track known completed/failed task IDs to detect transitions
  const knownCompletedRef = useRef<Set<string>>(new Set());
  const knownFailedRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  // Poll all tasks from the server
  const { data: allServerTasks } = useAllTasks(true, { refetchInterval: 3000 });

  // Detect task state transitions → show toasts
  useEffect(() => {
    if (!allServerTasks) return;

    // On first load, record the initial state without showing toasts
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      allServerTasks.forEach((task) => {
        if (task.status === 'SUCCESS') knownCompletedRef.current.add(task.task_id);
        if (task.status === 'FAILURE') knownFailedRef.current.add(task.task_id);
      });
      return;
    }

    let newSuccess = false;
    let newFailure = false;

    allServerTasks.forEach((task) => {
      if (task.status === 'SUCCESS' && !knownCompletedRef.current.has(task.task_id)) {
        knownCompletedRef.current.add(task.task_id);
        newSuccess = true;
      }
      if (task.status === 'FAILURE' && !knownFailedRef.current.has(task.task_id)) {
        knownFailedRef.current.add(task.task_id);
        newFailure = true;
      }
    });

    if (newSuccess) {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      const message = t('documents.taskSuccess');
      setSnackbar({ visible: true, message, type: 'success' });
    } else if (newFailure) {
      const message = t('documents.taskFailed');
      setSnackbar({ visible: true, message, type: 'error' });
    }
  }, [allServerTasks, queryClient, t]);

  const resetForm = () => {
    setSelectedFile(null);
    setTitle('');
    setCorrespondent(null);
    setDocumentType(null);
    setSelectedTags([]);
    setStoragePath(null);
    setSelectedCustomFields([]);
    setCustomFieldToAdd(null);
  };

  const uploadMutation = useUploadDocument({
    onSuccess: () => {
      setSnackbar({ visible: true, message: t('upload.uploadSuccess'), type: 'success' });
      resetForm();

      queryClient.refetchQueries({ queryKey: taskQueryKeys.all, type: 'all' });
      navigateTo('documentList');
    },
    onError: () => {
      Alert.alert(t('common.error'), t('upload.uploadError'));
    },
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'text/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
        });
      }
    } catch {
      // User cancelled
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('upload.permissionRequired'), t('upload.cameraPermission'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
        setSelectedFile({
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType || 'image/jpeg',
        });
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* File selection */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.fileButtons}>
              <Button mode="contained" icon="file" onPress={pickDocument} style={styles.fileButton}>
                {t('upload.chooseFile')}
              </Button>
              <Button mode="outlined" icon="camera" onPress={takePhoto} style={styles.fileButton}>
                {t('upload.takePhoto')}
              </Button>
            </View>

            {selectedFile ? (
              <View style={styles.selectedFile}>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                  {selectedFile.name}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {selectedFile.type}
                </Text>
              </View>
            ) : null}

            {!selectedFile ? (
              <Text
                variant="bodyMedium"
                style={[styles.noFile, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('upload.noFileSelected')}
              </Text>
            ) : null}
          </Card.Content>
        </Card>

        {/* Optional metadata */}
        <DocumentMetadataForm
          title={title}
          onTitleChange={setTitle}
          correspondent={correspondent}
          onCorrespondentChange={setCorrespondent}
          documentType={documentType}
          onDocumentTypeChange={setDocumentType}
          storagePath={storagePath}
          onStoragePathChange={setStoragePath}
          tags={selectedTags}
          onTagsChange={setSelectedTags}
          customFields={selectedCustomFields}
          onCustomFieldsChange={setSelectedCustomFields}
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
          cardStyle={{ marginBottom: 16, borderRadius: 12 }}
        />

        {/* Upload section */}
        {uploadMutation.isPending ? (
          <ProgressBar indeterminate color={theme.colors.primary} style={styles.progress} />
        ) : null}

        {canAddDocument ? (
          <Button
            mode="contained"
            icon="upload"
            onPress={() => {
              if (!selectedFile) return;

              // Prepare custom fields for submission
              const customFieldsForSubmit = selectedCustomFields
                .filter((entry) => entry.value !== undefined && entry.value !== '')
                .map((entry) => ({
                  field: entry.field,
                  value: coerceCustomFieldValueForSubmit(
                    entry.value,
                    customFieldsMap.get(entry.field),
                  ),
                }));

              uploadMutation.mutate({
                document: selectedFile,
                title: title || undefined,
                correspondent: correspondent || undefined,
                document_type: documentType || undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
                storage_path: storagePath || undefined,
                custom_fields: customFieldsForSubmit.length > 0 ? customFieldsForSubmit : undefined,
              });
            }}
            loading={uploadMutation.isPending}
            disabled={!selectedFile || uploadMutation.isPending}
            style={styles.uploadButton}
            contentStyle={styles.uploadButtonContent}
          >
            {uploadMutation.isPending ? t('upload.uploading') : t('upload.upload')}
          </Button>
        ) : null}
      </ScrollView>

      {/* Toast snackbar for success / failure */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
        duration={4000}
        style={[
          styles.snackbar,
          {
            backgroundColor:
              snackbar.type === 'success'
                ? theme.colors.primaryContainer
                : theme.colors.errorContainer,
          },
        ]}
        action={{
          label: t('common.ok'),
          textColor:
            snackbar.type === 'success'
              ? theme.colors.onPrimaryContainer
              : theme.colors.onErrorContainer,
          onPress: () => setSnackbar((s) => ({ ...s, visible: false })),
        }}
      >
        <Text
          style={{
            color:
              snackbar.type === 'success'
                ? theme.colors.onPrimaryContainer
                : theme.colors.onErrorContainer,
          }}
        >
          {snackbar.message}
        </Text>
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  fileButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  fileButton: {
    flex: 1,
  },
  selectedFile: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  noFile: {
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 12,
  },
  progress: {
    marginBottom: 12,
    borderRadius: 4,
  },
  uploadButton: {
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadButtonContent: {
    paddingVertical: 8,
  },
  snackbar: {
    marginBottom: 8,
  },
});
