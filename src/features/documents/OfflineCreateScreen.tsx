import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Button,
  Text,
  useTheme,
  Snackbar,
  Card,
  Divider,
  Dialog,
  Portal,
  TextInput as PaperTextInput,
  Chip,
  Checkbox,
  RadioButton,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useOfflineQueueStore } from '@/store/offlineQueueStore';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { useAllTags } from '@/reactQuery/tags';
import { useAllCorrespondents } from '@/reactQuery/correspondents';
import { useAllDocumentTypes } from '@/reactQuery/documentTypes';

export const OfflineCreateScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { addItem, items } = useOfflineQueueStore();
  const networkStatus = useNetworkStore((s) => s.status);

  const pendingTags = items
    .filter((i) => i.type === 'tag')
    .map((i) => i.data.name ?? '')
    .filter(Boolean);
  const pendingCorrespondents = items
    .filter((i) => i.type === 'correspondent')
    .map((i) => i.data.name ?? '')
    .filter(Boolean);
  const pendingDocTypes = items
    .filter((i) => i.type === 'documentType')
    .map((i) => i.data.name ?? '')
    .filter(Boolean);

  const { data: cachedTagsData } = useAllTags();
  const { data: cachedCorrespondentsData } = useAllCorrespondents();
  const { data: cachedDocTypesData } = useAllDocumentTypes();

  const dedupeNames = (primary: string[], secondary: string[]): string[] => {
    const seen = new Set(primary.map((n) => n.toLowerCase()));
    const extras = secondary.filter((n) => !seen.has(n.toLowerCase()));
    return [...primary, ...extras].sort((a, b) => a.localeCompare(b));
  };

  const cachedTagNames = (cachedTagsData ?? []).map((t) => t.name);
  const cachedCorrespondentNames = (cachedCorrespondentsData ?? []).map((c) => c.name);
  const cachedDocTypeNames = (cachedDocTypesData ?? []).map((d) => d.name);

  const allTagNames = dedupeNames(cachedTagNames, pendingTags);
  const allCorrespondentNames = dedupeNames(cachedCorrespondentNames, pendingCorrespondents);
  const allDocTypeNames = dedupeNames(cachedDocTypeNames, pendingDocTypes);

  const [title, setTitle] = useState('');
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [correspondentName, setCorrespondentName] = useState('');
  const [documentTypeName, setDocumentTypeName] = useState('');
  const [file, setFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [snackbar, setSnackbar] = useState('');

  const [tagSelectVisible, setTagSelectVisible] = useState(false);
  const [corrSelectVisible, setCorrSelectVisible] = useState(false);
  const [dtSelectVisible, setDtSelectVisible] = useState(false);

  const [tagCreateVisible, setTagCreateVisible] = useState(false);
  const [corrCreateVisible, setCorrCreateVisible] = useState(false);
  const [dtCreateVisible, setDtCreateVisible] = useState(false);

  const [newTagInput, setNewTagInput] = useState('');
  const [newCorrInput, setNewCorrInput] = useState('');
  const [newDtInput, setNewDtInput] = useState('');

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/octet-stream',
        });
        if (!title) setTitle(asset.name.replace(/\.[^/.]+$/, ''));
      }
    } catch {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('upload.permissionRequired'), t('upload.cameraPermission'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const name = `photo_${Date.now()}.jpg`;
        setFile({ uri: asset.uri, name, mimeType: 'image/jpeg' });
        if (!title) setTitle(name.replace(/\.[^/.]+$/, ''));
      }
    } catch {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    }
  };

  const handleSave = () => {
    if (!file) {
      Alert.alert(t('common.error'), t('upload.noFileSelected'));
      return;
    }

    addItem({
      type: 'document',
      data: {
        title: title || file.name,
        tagNames: tagNames.filter(Boolean),
        correspondentName: correspondentName.trim() || undefined,
        documentTypeName: documentTypeName.trim() || undefined,
        fileUri: file.uri,
        fileName: file.name,
        fileMimeType: file.mimeType,
      },
    });

    setSnackbar(t('offline.createOffline'));
    setTitle('');
    setTagNames([]);
    setCorrespondentName('');
    setDocumentTypeName('');
    setFile(null);
  };

  const toggleTag = (name: string) => {
    setTagNames((prev) => {
      const alreadySelected = prev.some((t) => t.toLowerCase() === name.toLowerCase());
      if (alreadySelected) {
        return prev.filter((t) => t.toLowerCase() !== name.toLowerCase());
      }
      return [...prev, name];
    });
  };

  const handleCreateTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const existingName = allTagNames.find((n) => n.toLowerCase() === trimmed.toLowerCase());
    if (existingName) {
      if (!tagNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
        setTagNames((prev) => [...prev, existingName]);
      }
      setSnackbar(t('offline.alreadyQueued'));
      setNewTagInput('');
      setTagCreateVisible(false);
      return;
    }
    addItem({ type: 'tag', data: { name: trimmed } });
    setTagNames((prev) => [...prev, trimmed]);
    setNewTagInput('');
    setTagCreateVisible(false);
  };

  const handleCreateCorrespondent = () => {
    const trimmed = newCorrInput.trim();
    if (!trimmed) return;
    const existingName = allCorrespondentNames.find(
      (n) => n.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existingName) {
      setCorrespondentName(existingName);
      setSnackbar(t('offline.alreadyQueued'));
      setNewCorrInput('');
      setCorrCreateVisible(false);
      return;
    }
    addItem({ type: 'correspondent', data: { name: trimmed } });
    setCorrespondentName(trimmed);
    setNewCorrInput('');
    setCorrCreateVisible(false);
  };

  const handleCreateDocType = () => {
    const trimmed = newDtInput.trim();
    if (!trimmed) return;
    const existingName = allDocTypeNames.find((n) => n.toLowerCase() === trimmed.toLowerCase());
    if (existingName) {
      setDocumentTypeName(existingName);
      setSnackbar(t('offline.alreadyQueued'));
      setNewDtInput('');
      setDtCreateVisible(false);
      return;
    }
    addItem({ type: 'documentType', data: { name: trimmed } });
    setDocumentTypeName(trimmed);
    setNewDtInput('');
    setDtCreateVisible(false);
  };

  return (
    <Portal.Host>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="bodySmall" style={[styles.offlineBadge, { color: theme.colors.error }]}>
          {networkStatus === NetworkStatus.Disconnected ? t('common.offlineMode') : null}
        </Text>

        <Card style={styles.card} elevation={1}>
          <Card.Title title={t('common.new')} />
          <Card.Content>
            <View style={styles.fileRow}>
              <Button
                mode="outlined"
                icon="file-plus"
                onPress={handlePickFile}
                style={styles.fileButton}
              >
                {t('upload.chooseFile')}
              </Button>
              <Button
                mode="outlined"
                icon="camera"
                onPress={handleTakePhoto}
                style={styles.fileButton}
              >
                {t('upload.takePhoto')}
              </Button>
            </View>

            {file ? (
              <View style={styles.fileInfo}>
                <MaterialCommunityIcons name="file-check" size={18} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ marginLeft: 6, flex: 1 }} numberOfLines={1}>
                  {file.name}
                </Text>
                <Button compact onPress={() => setFile(null)}>
                  {t('common.delete')}
                </Button>
              </View>
            ) : null}

            <Divider style={styles.divider} />

            <Button
              mode="text"
              icon="format-title"
              onPress={() =>
                Alert.prompt
                  ? Alert.prompt(
                      t('documents.singularEntity'),
                      t('documents.singularEntity'),
                      setTitle,
                      'plain-text',
                      title,
                    )
                  : undefined
              }
              style={styles.metaButton}
            >
              {title || t('documents.singularEntity')}
            </Button>

            <Button
              mode="text"
              icon="tag-multiple"
              onPress={() => setTagSelectVisible(true)}
              style={styles.metaButton}
            >
              {tagNames.length > 0 ? tagNames.join(', ') : t('documents.noTags')}
            </Button>
            {tagNames.length > 0 && (
              <View style={styles.chipRow}>
                {tagNames.map((tag) => (
                  <Chip
                    key={tag}
                    onClose={() => setTagNames((prev) => prev.filter((t) => t !== tag))}
                    style={styles.chip}
                    compact
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}

            <Button
              mode="text"
              icon="account-box"
              onPress={() => setCorrSelectVisible(true)}
              style={styles.metaButton}
            >
              {correspondentName || t('documents.noCorrespondent')}
            </Button>

            <Button
              mode="text"
              icon="file-document"
              onPress={() => setDtSelectVisible(true)}
              style={styles.metaButton}
            >
              {documentTypeName || t('documents.noDocumentType')}
            </Button>
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          {networkStatus === NetworkStatus.Disconnected ? t('auth.offlineModeHint') : null}
        </Text>

        <Button
          mode="contained"
          icon="content-save"
          onPress={handleSave}
          disabled={!file}
          style={styles.saveButton}
        >
          {t('offline.createOffline')}
        </Button>

        <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
          {snackbar}
        </Snackbar>
      </ScrollView>

      <Portal>
        <Dialog visible={tagSelectVisible} onDismiss={() => setTagSelectVisible(false)}>
          <Dialog.Title>{t('tags.title')}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              {allTagNames.length === 0 ? (
                <Text
                  variant="bodySmall"
                  style={[styles.emptyDialogText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {t('offline.noCachedItems')}
                </Text>
              ) : (
                allTagNames.map((tag) => (
                  <Checkbox.Item
                    key={tag}
                    label={tag}
                    status={tagNames.some((n) => n.toLowerCase() === tag.toLowerCase()) ? 'checked' : 'unchecked'}
                    onPress={() => toggleTag(tag)}
                  />
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button
              icon="plus"
              onPress={() => {
                setTagSelectVisible(false);
                setNewTagInput('');
                setTagCreateVisible(true);
              }}
            >
              {t('common.new')}
            </Button>
            <Button onPress={() => setTagSelectVisible(false)}>{t('common.ok')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={tagCreateVisible} onDismiss={() => setTagCreateVisible(false)}>
          <Dialog.Title>{t('offline.createTag')}</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              label={t('tags.name')}
              value={newTagInput}
              onChangeText={setNewTagInput}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setTagCreateVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={handleCreateTag} disabled={!newTagInput.trim()}>
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={corrSelectVisible} onDismiss={() => setCorrSelectVisible(false)}>
          <Dialog.Title>{t('correspondents.title')}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <RadioButton.Item
                label={t('common.none')}
                value=""
                status={correspondentName === '' ? 'checked' : 'unchecked'}
                onPress={() => setCorrespondentName('')}
              />
              {allCorrespondentNames.length === 0 ? (
                <Text
                  variant="bodySmall"
                  style={[styles.emptyDialogText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {t('offline.noCachedItems')}
                </Text>
              ) : (
                allCorrespondentNames.map((name) => (
                  <RadioButton.Item
                    key={name}
                    label={name}
                    value={name}
                    status={correspondentName === name ? 'checked' : 'unchecked'}
                    onPress={() => {
                      setCorrespondentName(name);
                      setCorrSelectVisible(false);
                    }}
                  />
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button
              icon="plus"
              onPress={() => {
                setCorrSelectVisible(false);
                setNewCorrInput('');
                setCorrCreateVisible(true);
              }}
            >
              {t('common.new')}
            </Button>
            <Button onPress={() => setCorrSelectVisible(false)}>{t('common.ok')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={corrCreateVisible} onDismiss={() => setCorrCreateVisible(false)}>
          <Dialog.Title>{t('offline.createCorrespondent')}</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              label={t('correspondents.name')}
              value={newCorrInput}
              onChangeText={setNewCorrInput}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCorrCreateVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={handleCreateCorrespondent} disabled={!newCorrInput.trim()}>
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={dtSelectVisible} onDismiss={() => setDtSelectVisible(false)}>
          <Dialog.Title>{t('documentTypes.title')}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <RadioButton.Item
                label={t('common.none')}
                value=""
                status={documentTypeName === '' ? 'checked' : 'unchecked'}
                onPress={() => setDocumentTypeName('')}
              />
              {allDocTypeNames.length === 0 ? (
                <Text
                  variant="bodySmall"
                  style={[styles.emptyDialogText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {t('offline.noCachedItems')}
                </Text>
              ) : (
                allDocTypeNames.map((name) => (
                  <RadioButton.Item
                    key={name}
                    label={name}
                    value={name}
                    status={documentTypeName === name ? 'checked' : 'unchecked'}
                    onPress={() => {
                      setDocumentTypeName(name);
                      setDtSelectVisible(false);
                    }}
                  />
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button
              icon="plus"
              onPress={() => {
                setDtSelectVisible(false);
                setNewDtInput('');
                setDtCreateVisible(true);
              }}
            >
              {t('common.new')}
            </Button>
            <Button onPress={() => setDtSelectVisible(false)}>{t('common.ok')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={dtCreateVisible} onDismiss={() => setDtCreateVisible(false)}>
          <Dialog.Title>{t('offline.createDocumentType')}</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              label={t('documentTypes.name')}
              value={newDtInput}
              onChangeText={setNewDtInput}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDtCreateVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={handleCreateDocType} disabled={!newDtInput.trim()}>
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Portal.Host>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  offlineBadge: {
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  card: { marginBottom: 16 },
  fileRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  fileButton: { flex: 1 },
  fileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  divider: { marginVertical: 8 },
  metaButton: { justifyContent: 'flex-start', marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8, marginLeft: 8 },
  chip: { marginBottom: 2 },
  hint: { textAlign: 'center', marginBottom: 16 },
  saveButton: { marginTop: 8 },
  dialogScrollArea: { maxHeight: 300 },
  emptyDialogText: { paddingHorizontal: 16, paddingVertical: 12 },
});
