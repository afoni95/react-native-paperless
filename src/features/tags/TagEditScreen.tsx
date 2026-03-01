import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Switch, Text, useTheme } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { tagsApi } from '@/api';
import { MATCHING_ALGORITHMS, MatchingAlgorithm } from '@/types';
import { LoadingScreen, ConfirmDialog } from '@/components';
import { ManageStackParamList } from '@/navigation/types';

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
  const queryClient = useQueryClient();
  const tagId = route.params?.tagId;
  const isNew = !tagId;

  const [name, setName] = useState('');
  const [color, setColor] = useState('#43a047');
  const [match, setMatch] = useState('');
  const [matchingAlgorithm, setMatchingAlgorithm] = useState<MatchingAlgorithm>(6);
  const [isInsensitive, setIsInsensitive] = useState(true);
  const [isInboxTag, setIsInboxTag] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: tag, isLoading } = useQuery({
    queryKey: ['tag', tagId],
    queryFn: () => tagsApi.getTag(tagId!),
    enabled: !!tagId,
  });

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

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        name,
        color,
        match,
        matching_algorithm: matchingAlgorithm,
        is_insensitive: isInsensitive,
        is_inbox_tag: isInboxTag,
      };
      if (isNew) {
        return tagsApi.createTag(data);
      }
      return tagsApi.updateTag(tagId!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags-all'] });
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => tagsApi.deleteTag(tagId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags-all'] });
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
      <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onBackground }]}>
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

      <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onBackground }]}>
        {t('tags.matchingAlgorithm')}
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
        <Text variant="bodyLarge">{t('tags.caseInsensitive')}</Text>
        <Switch value={isInsensitive} onValueChange={setIsInsensitive} />
      </View>

      <View style={styles.switchRow}>
        <Text variant="bodyLarge">{t('tags.isInboxTag')}</Text>
        <Switch value={isInboxTag} onValueChange={setIsInboxTag} />
      </View>

      <Button
        mode="contained"
        onPress={() => saveMutation.mutate()}
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
        message={t('tags.deleteConfirm')}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          deleteMutation.mutate();
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  input: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 8,
    marginTop: 4,
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
