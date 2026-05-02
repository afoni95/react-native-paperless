import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MATCHING_ALGORITHMS, MatchingAlgorithm } from '@/types';
import { LoadingScreen, ConfirmDialog, HasPermission } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useTag, useUpsertTag, useDeleteTag } from '@/reactQuery';
import { useOfflineQueueStore } from '@/store/offlineQueueStore';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { screenStyles, formStyles, buttonStyles } from '@/theme/commonStyles';

type Props = NativeStackScreenProps<ManageStackParamList, 'TagEdit'>;

const PRESET_COLORS = [
  '#e53935',
  '#d81b60',
  '#8e24aa',
  '#5e35b1',
  '#3949ab',
  '#1e88e5',
  '#039be5',
  '#00acc1',
  '#00897b',
  '#43a047',
  '#7cb342',
  '#c0ca33',
  '#fdd835',
  '#ffb300',
  '#fb8c00',
  '#f4511e',
  '#6d4c41',
  '#757575',
  '#546e7a',
  '#17541f',
];

export const TagEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const tagId = route.params?.tagId;
  const isNew = !tagId;

  const [name, setName] = useState('');
  const [color, setColor] = useState('#43a047');
  const [match, setMatch] = useState('');
  const [matchingAlgorithm, setMatchingAlgorithm] = useState<MatchingAlgorithm>(6);
  const [isInsensitive, setIsInsensitive] = useState(true);
  const [isInboxTag, setIsInboxTag] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: tag, isLoading } = useTag(tagId!, !!tagId);

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color || '#43a047');
      setMatch(tag.match || '');
      setMatchingAlgorithm(tag.matching_algorithm as MatchingAlgorithm);
      setIsInsensitive(tag.is_insensitive);
      setIsInboxTag(tag.is_inbox_tag);
    }
  }, [tag]);

  const { status } = useNetworkStore();
  const isOffline = status !== NetworkStatus.Online;
  const { addItem } = useOfflineQueueStore();

  const saveMutation = useUpsertTag({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'));
    },
  });

  const deleteMutation = useDeleteTag({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
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
        label={t('tags.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      {/* color grid */}
      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('tags.color')}
      </Text>
      <View style={styles.colorGrid}>
        {PRESET_COLORS.map((c) => (
          <View
            key={c}
            style={[
              styles.colorSwatch,
              { backgroundColor: c },
              color === c && styles.colorSwatchSelected,
            ]}
            onTouchEnd={() => setColor(c)}
          />
        ))}
      </View>
      <TextInput
        label={t('tags.color')}
        value={color}
        onChangeText={setColor}
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="circle" color={color} />}
      />

      <TextInput
        label={t('tags.match')}
        value={match}
        onChangeText={setMatch}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('tags.matchingAlgorithm')}
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
        <Text variant="bodyLarge">{t('tags.caseInsensitive')}</Text>
        <Switch value={isInsensitive} onValueChange={setIsInsensitive} />
      </View>

      <View style={formStyles.switchRow}>
        <Text variant="bodyLarge">{t('tags.isInboxTag')}</Text>
        <Switch value={isInboxTag} onValueChange={setIsInboxTag} />
      </View>

      <HasPermission action={isNew ? 'add' : 'change'} resource="tag">
        <Button
          mode="contained"
          onPress={() => {
            if (isNew && isOffline) {
              addItem({
                type: 'tag',
                data: { name, color, match, isInsensitive },
              });
              navigation.goBack();
              return;
            }
            saveMutation.mutate({
              id: tagId,
              name,
              color,
              match,
              matching_algorithm: matchingAlgorithm,
              is_insensitive: isInsensitive,
              is_inbox_tag: isInboxTag,
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
        <HasPermission action="delete" resource="tag">
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
        message={t('tags.deleteConfirm')}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          deleteMutation.mutate(tagId!);
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  input: {
    marginBottom: 14,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },
});
