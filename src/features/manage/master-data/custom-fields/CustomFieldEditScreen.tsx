import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CUSTOM_FIELD_DATA_TYPES, CustomFieldDataType } from '@/types';
import { LoadingScreen, ConfirmDialog, HasPermission } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useCustomField, useUpsertCustomField, useDeleteCustomField } from '@/reactQuery';
import { screenStyles, formStyles, buttonStyles } from '@/theme/commonStyles';

type Props = NativeStackScreenProps<ManageStackParamList, 'CustomFieldEdit'>;

export const CustomFieldEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const customFieldId = route.params?.customFieldId;
  const isNew = !customFieldId;

  const [name, setName] = useState('');
  const [dataType, setDataType] = useState<CustomFieldDataType>('string');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: customField, isLoading } = useCustomField(customFieldId, !!customFieldId);

  useEffect(() => {
    if (customField) {
      setName(customField.name);
      setDataType(customField.data_type as CustomFieldDataType);
    }
  }, [customField]);

  const saveMutation = useUpsertCustomField({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'));
    },
  });

  const deleteMutation = useDeleteCustomField({
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
        label={t('common.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('customFields.dataType')}
      </Text>
      <View style={styles.typeGrid}>
        {(Object.entries(CUSTOM_FIELD_DATA_TYPES) as [CustomFieldDataType, string][]).map(
          ([key, label]) => (
            <Button
              key={key}
              mode={dataType === key ? 'contained' : 'outlined'}
              compact
              onPress={() => setDataType(key)}
              style={styles.typeButton}
            >
              {label}
            </Button>
          ),
        )}
      </View>

      <HasPermission action={isNew ? 'add' : 'change'} resource="customfield">
        <Button
          mode="contained"
          onPress={() =>
            saveMutation.mutate({
              id: customFieldId,
              name,
              data_type: dataType,
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

      {!isNew ? (
        <HasPermission action="delete" resource="customfield">
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
      ) : null}

      <ConfirmDialog
        visible={showDeleteDialog}
        title={t('common.delete')}
        message={t('customFields.deleteConfirm')}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          deleteMutation.mutate(customFieldId!);
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    marginBottom: 4,
  },
});
