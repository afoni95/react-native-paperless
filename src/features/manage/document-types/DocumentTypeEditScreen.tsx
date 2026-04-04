import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MATCHING_ALGORITHMS, MatchingAlgorithm } from '@/types';
import { LoadingScreen, ConfirmDialog, HasPermission } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useDocumentType, useUpsertDocumentType, useDeleteDocumentType } from '@/reactQuery';
import { screenStyles, formStyles, buttonStyles } from '@/theme/commonStyles';

type Props = NativeStackScreenProps<ManageStackParamList, 'DocumentTypeEdit'>;

export const DocumentTypeEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const documentTypeId = route.params?.documentTypeId;
  const isNew = !documentTypeId;

  const [name, setName] = useState('');
  const [match, setMatch] = useState('');
  const [matchingAlgorithm, setMatchingAlgorithm] = useState<MatchingAlgorithm>(6);
  const [isInsensitive, setIsInsensitive] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: docType, isLoading } = useDocumentType(documentTypeId!, !!documentTypeId);

  useEffect(() => {
    if (docType) {
      setName(docType.name);
      setMatch(docType.match || '');
      setMatchingAlgorithm(docType.matching_algorithm as MatchingAlgorithm);
      setIsInsensitive(docType.is_insensitive);
    }
  }, [docType]);

  const saveMutation = useUpsertDocumentType({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const deleteMutation = useDeleteDocumentType({
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
      style={[screenStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label={t('documentTypes.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('documentTypes.match')}
        value={match}
        onChangeText={setMatch}
        mode="outlined"
        style={formStyles.input}
      />

      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('documentTypes.matchingAlgorithm')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={formStyles.algoRow}>
        {(Object.entries(MATCHING_ALGORITHMS) as [string, string][]).map(([key, label]) => (
          <Button
            key={key}
            mode={matchingAlgorithm === Number(key) ? 'contained' : 'outlined'}
            compact
            onPress={() => setMatchingAlgorithm(Number(key) as MatchingAlgorithm)}
            style={formStyles.algoButton}
          >
            {label}
          </Button>
        ))}
      </ScrollView>

      <View style={formStyles.switchRow}>
        <Text variant="bodyLarge">{t('documentTypes.caseInsensitive')}</Text>
        <Switch value={isInsensitive} onValueChange={setIsInsensitive} />
      </View>

      <HasPermission action={isNew ? 'add' : 'change'} resource="documenttype">
        <Button
          mode="contained"
          onPress={() =>
            saveMutation.mutate({
              id: documentTypeId,
              name,
              match,
              matching_algorithm: matchingAlgorithm,
              is_insensitive: isInsensitive,
            })
          }
          loading={saveMutation.isPending}
          disabled={!name.trim() || saveMutation.isPending}
          style={buttonStyles.saveButton}
          contentStyle={buttonStyles.saveButtonContent}
        >
          {t('common.save')}
        </Button>
      </HasPermission>

      {!isNew && (
        <HasPermission action="delete" resource="documenttype">
          <Button
            mode="outlined"
            icon="delete"
            textColor={theme.colors.error}
            onPress={() => setShowDeleteDialog(true)}
            style={buttonStyles.deleteButton}
            contentStyle={buttonStyles.saveButtonContent}
          >
            {t('common.delete')}
          </Button>
        </HasPermission>
      )}

      <ConfirmDialog
        visible={showDeleteDialog}
        title={t('common.delete')}
        message={t('documentTypes.deleteConfirm')}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          deleteMutation.mutate(documentTypeId!);
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});
