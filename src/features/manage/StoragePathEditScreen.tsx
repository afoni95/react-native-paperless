import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MATCHING_ALGORITHMS, MatchingAlgorithm } from '@/types';
import { LoadingScreen, ConfirmDialog, HasPermission } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useStoragePath, useUpsertStoragePath, useDeleteStoragePath } from '@/reactQuery';

type Props = NativeStackScreenProps<ManageStackParamList, 'StoragePathEdit'>;

export const StoragePathEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const storagePathId = route.params?.storagePathId;
  const isNew = !storagePathId;

  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [match, setMatch] = useState('');
  const [matchingAlgorithm, setMatchingAlgorithm] = useState<MatchingAlgorithm>(6);
  const [isInsensitive, setIsInsensitive] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: storagePath, isLoading } = useStoragePath(storagePathId!, !!storagePathId);

  useEffect(() => {
    if (storagePath) {
      setName(storagePath.name);
      setPath(storagePath.path);
      setMatch(storagePath.match || '');
      setMatchingAlgorithm(storagePath.matching_algorithm as MatchingAlgorithm);
      setIsInsensitive(storagePath.is_insensitive);
    }
  }, [storagePath]);

  const saveMutation = useUpsertStoragePath({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: (_err) => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const deleteMutation = useDeleteStoragePath({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'));
    },
  });

  if (!isNew && isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label={t('storagePaths.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label={t('storagePaths.pathTemplate')}
        value={path}
        onChangeText={setPath}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        placeholder="{correspondent}/{document_type}/{created_year}"
      />

      <TextInput
        label={t('storagePaths.match')}
        value={match}
        onChangeText={setMatch}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onBackground }]}>
        {t('storagePaths.matchingAlgorithm')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.algoRow}>
        {(Object.entries(MATCHING_ALGORITHMS) as [string, string][]).map(([key, label]) => (
          <Button
            key={key}
            mode={matchingAlgorithm === Number(key) ? 'contained' : 'outlined'}
            compact
            onPress={() => setMatchingAlgorithm(Number(key) as MatchingAlgorithm)}
            style={styles.algoButton}
          >
            {label}
          </Button>
        ))}
      </ScrollView>

      <View style={styles.switchRow}>
        <Text variant="bodyLarge">{t('storagePaths.caseInsensitive')}</Text>
        <Switch value={isInsensitive} onValueChange={setIsInsensitive} />
      </View>

      <HasPermission action={isNew ? 'add' : 'change'} resource="storagepath">
        <Button
          mode="contained"
          onPress={() =>
            saveMutation.mutate({
              id: storagePathId,
              name,
              path,
              match,
              matching_algorithm: matchingAlgorithm,
              is_insensitive: isInsensitive,
            })
          }
          loading={saveMutation.isPending}
          disabled={!name.trim() || !path.trim() || saveMutation.isPending}
          style={styles.saveButton}
          contentStyle={styles.buttonContent}
        >
          {t('common.save')}
        </Button>
      </HasPermission>

      {!isNew && (
        <HasPermission action="delete" resource="storagepath">
          <Button
            mode="outlined"
            icon="delete"
            textColor={theme.colors.error}
            onPress={() => setShowDeleteDialog(true)}
            style={styles.deleteButton}
            contentStyle={styles.buttonContent}
          >
            {t('common.delete')}
          </Button>
        </HasPermission>
      )}

      <ConfirmDialog
        visible={showDeleteDialog}
        title={t('common.delete')}
        message={t('storagePaths.deleteConfirm')}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          if (storagePathId) {
            deleteMutation.mutate(storagePathId);
          }
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    marginTop: 4,
  },
  algoRow: {
    marginBottom: 16,
  },
  algoButton: {
    marginRight: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  saveButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  deleteButton: {
    marginTop: 12,
    borderRadius: 8,
    borderColor: '#d32f2f',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
