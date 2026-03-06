import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MATCHING_ALGORITHMS, MatchingAlgorithm } from '@/types';
import { LoadingScreen, ConfirmDialog } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useCorrespondent, useUpsertCorrespondent, useDeleteCorrespondent } from '@/reactQuery';

type Props = NativeStackScreenProps<ManageStackParamList, 'CorrespondentEdit'>;

export const CorrespondentEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const correspondentId = route.params?.correspondentId;
  const isNew = !correspondentId;

  const [name, setName] = useState('');
  const [match, setMatch] = useState('');
  const [matchingAlgorithm, setMatchingAlgorithm] = useState<MatchingAlgorithm>(6);
  const [isInsensitive, setIsInsensitive] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: correspondent, isLoading } = useCorrespondent(correspondentId!, !!correspondentId);

  useEffect(() => {
    if (correspondent) {
      setName(correspondent.name);
      setMatch(correspondent.match || '');
      setMatchingAlgorithm(correspondent.matching_algorithm as MatchingAlgorithm);
      setIsInsensitive(correspondent.is_insensitive);
    }
  }, [correspondent]);

  const saveMutation = useUpsertCorrespondent({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: (_err) => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const deleteMutation = useDeleteCorrespondent({
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
        label={t('correspondents.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label={t('correspondents.match')}
        value={match}
        onChangeText={setMatch}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onBackground }]}>
        {t('correspondents.matchingAlgorithm')}
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
        <Text variant="bodyLarge">{t('correspondents.caseInsensitive')}</Text>
        <Switch value={isInsensitive} onValueChange={setIsInsensitive} />
      </View>

      <Button
        mode="contained"
        onPress={() =>
          saveMutation.mutate({
            id: correspondentId,
            name,
            match,
            matching_algorithm: matchingAlgorithm,
            is_insensitive: isInsensitive,
          })
        }
        loading={saveMutation.isPending}
        disabled={!name.trim() || saveMutation.isPending}
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
      >
        {t('common.save')}
      </Button>

      {!isNew && (
        <Button
          mode="outlined"
          icon="delete"
          textColor={theme.colors.error}
          onPress={() => setShowDeleteDialog(true)}
          style={styles.deleteButton}
          contentStyle={styles.saveButtonContent}
        >
          {t('common.delete')}
        </Button>
      )}

      <ConfirmDialog
        visible={showDeleteDialog}
        title={t('common.delete')}
        message={t('correspondents.deleteConfirm')}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          if (correspondentId) {
            deleteMutation.mutate(correspondentId);
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
    marginTop: 24,
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  deleteButton: {
    marginTop: 12,
    borderRadius: 8,
    borderColor: '#d32f2f',
  },
});
