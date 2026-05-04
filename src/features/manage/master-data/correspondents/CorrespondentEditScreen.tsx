import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MATCHING_ALGORITHMS, MatchingAlgorithm } from '@/types';
import { LoadingScreen, ConfirmDialog, HasPermission } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useCorrespondent, useUpsertCorrespondent, useDeleteCorrespondent } from '@/reactQuery';
import { useOfflineQueueStore } from '@/store/offlineQueueStore';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { screenStyles, formStyles, buttonStyles } from '@/theme/commonStyles';

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

  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;
  const { addItem } = useOfflineQueueStore();

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
      style={[screenStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label={t('common.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('common.matchPattern')}
        value={match}
        onChangeText={setMatch}
        mode="outlined"
        style={formStyles.input}
      />

      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('common.matchingAlgorithm')}
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
        <Text variant="bodyLarge">{t('common.caseInsensitive')}</Text>
        <Switch value={isInsensitive} onValueChange={setIsInsensitive} />
      </View>

      <HasPermission action={isNew ? 'add' : 'change'} resource="correspondent">
        <Button
          mode="contained"
          onPress={() => {
            if (isNew && isOffline) {
              addItem({
                type: 'correspondent',
                data: { name, match, isInsensitive },
              });
              navigation.goBack();
              return;
            }
            saveMutation.mutate({
              id: correspondentId,
              name,
              match,
              matching_algorithm: matchingAlgorithm,
              is_insensitive: isInsensitive,
            });
          }}
          loading={saveMutation.isPending}
          disabled={!name.trim() || saveMutation.isPending}
          style={buttonStyles.saveButton}
          contentStyle={buttonStyles.saveButtonContent}
        >
          {t('common.save')}
        </Button>
      </HasPermission>

      {!isNew && (
        <HasPermission action="delete" resource="correspondent">
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
