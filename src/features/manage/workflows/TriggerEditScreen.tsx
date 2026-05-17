import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, useTheme, List, Checkbox, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WorkflowTrigger, TriggerType } from '@/types/workflows';
import { ManageStackParamList } from '@/navigation/types';
import { triggerTypeOptions } from '@/utils/workflowHelpers';
import { SearchableDropdown, MultiSelectChips } from '@/components';
import {
  useAllCorrespondents,
  useAllDocumentTypes,
  useAllStoragePaths,
  useAllTags,
} from '@/reactQuery';
import { customFieldsApi } from '@/api/customFields';
import { screenStyles, buttonStyles } from '@/theme/commonStyles';

type Props = NativeStackScreenProps<ManageStackParamList, 'TriggerEdit'>;

export const TriggerEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { triggerId } = route.params;

  const [type, setType] = useState<TriggerType>(TriggerType.DocumentAdded);
  const [filterPath, setFilterPath] = useState('*');
  const [filterFilename, setFilterFilename] = useState('');
  const [filterMailrule, setFilterMailrule] = useState<number | null>(null);
  const [matchingAlgorithm, setMatchingAlgorithm] = useState(0);
  const [match, setMatch] = useState('');
  const [isInsensitive, setIsInsensitive] = useState(true);
  const [filterHasTags, setFilterHasTags] = useState<number[]>([]);
  const [filterHasAllTags, setFilterHasAllTags] = useState<number[]>([]);
  const [filterHasNotTags, setFilterHasNotTags] = useState<number[]>([]);

  const [filterHasNotCorrespondents, setFilterHasNotCorrespondents] = useState<number[]>([]);
  const [filterHasNotDocumentTypes, setFilterHasNotDocumentTypes] = useState<number[]>([]);
  const [filterHasNotStoragePaths, setFilterHasNotStoragePaths] = useState<number[]>([]);
  const [filterHasCorrespondent, setFilterHasCorrespondent] = useState<number | null>(null);
  const [filterHasDocumentType, setFilterHasDocumentType] = useState<number | null>(null);
  const [filterHasStoragePath, setFilterHasStoragePath] = useState<number | null>(null);

  const [scheduleOffsetDays, setScheduleOffsetDays] = useState('0');

  const { data: allCorrespondents = [] } = useAllCorrespondents();
  const { data: allDocumentTypes = [] } = useAllDocumentTypes();
  const { data: allStoragePaths = [] } = useAllStoragePaths();
  const { data: allTags = [] } = useAllTags();

  const [scheduleIsRecurring, setScheduleIsRecurring] = useState(false);
  const [scheduleRecurringIntervalDays, setScheduleRecurringIntervalDays] = useState('1');
  const [scheduleDateField, setScheduleDateField] = useState<
    'added' | 'created' | 'modified' | 'custom_field'
  >('added');
  const [scheduleDateCustomField, setScheduleDateCustomField] = useState<number | null>(null);

  const [customFields, setCustomFields] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const existing = route.params?.trigger as WorkflowTrigger | undefined;
    if (existing) {
      setType((existing.type as TriggerType) ?? TriggerType.DocumentAdded);
      setFilterPath(existing.filter_path ?? '*');
      setFilterFilename(existing.filter_filename ?? '');
      setFilterMailrule(existing.filter_mailrule ?? null);
      setMatchingAlgorithm(existing.matching_algorithm ?? 0);
      setMatch(existing.match ?? '');
      setIsInsensitive(!!existing.is_insensitive);
      setFilterHasTags(existing.filter_has_tags || []);
      setFilterHasAllTags(existing.filter_has_all_tags || []);
      setFilterHasNotTags(existing.filter_has_not_tags || []);
      setFilterHasNotCorrespondents(existing.filter_has_not_correspondents || []);
      setFilterHasNotDocumentTypes(existing.filter_has_not_document_types || []);
      setFilterHasNotStoragePaths(existing.filter_has_not_storage_paths || []);
      setFilterHasCorrespondent(existing.filter_has_correspondent ?? null);
      setFilterHasDocumentType(existing.filter_has_document_type ?? null);
      setFilterHasStoragePath(existing.filter_has_storage_path ?? null);
      setScheduleOffsetDays((existing.schedule_offset_days ?? 0).toString());
      setScheduleIsRecurring(!!existing.schedule_is_recurring);
      setScheduleRecurringIntervalDays((existing.schedule_recurring_interval_days ?? 1).toString());
      setScheduleDateField(existing.schedule_date_field ?? 'added');
      setScheduleDateCustomField(existing.schedule_date_custom_field ?? null);
    }
  }, [route.params?.trigger]);

  useEffect(() => {
    (async () => {
      try {
        const list = await customFieldsApi.getAllCustomFields();
        setCustomFields(
          list.filter((f) => f.data_type === 'date').map((cf) => ({ id: cf.id, name: cf.name })),
        );
      } catch {
        // ignore fetch errors
      }
    })();
  }, []);

  const handleSave = () => {
    if (!match.trim() && type !== TriggerType.Scheduled) {
      Alert.alert(t('common.error'), t('workflows.matchRequired'));
      return;
    }

    if (scheduleDateField === 'custom_field' && !scheduleDateCustomField) {
      Alert.alert(t('common.error'), t('workflows.customFieldRequired'));
      return;
    }

    // Pass trigger data back through navigation
    const trigger: Partial<WorkflowTrigger> = {
      type,
      filter_path: filterPath,
      filter_filename: filterFilename,
      filter_mailrule: filterMailrule,
      matching_algorithm: matchingAlgorithm,
      match,
      is_insensitive: isInsensitive,
      filter_has_tags: filterHasTags,
      filter_has_all_tags: filterHasAllTags,
      filter_has_not_tags: filterHasNotTags,
      filter_has_not_correspondents: filterHasNotCorrespondents,
      filter_has_not_document_types: filterHasNotDocumentTypes,
      filter_has_not_storage_paths: filterHasNotStoragePaths,
      filter_has_correspondent: filterHasCorrespondent,
      filter_has_document_type: filterHasDocumentType,
      filter_has_storage_path: filterHasStoragePath,
      schedule_offset_days: parseInt(scheduleOffsetDays, 10) || 0,
      schedule_is_recurring: scheduleIsRecurring,
      schedule_recurring_interval_days: parseInt(scheduleRecurringIntervalDays, 10) || 1,
      schedule_date_field: scheduleDateField,
      schedule_date_custom_field:
        scheduleDateField === 'custom_field' ? scheduleDateCustomField : null,
    };

    if (triggerId) trigger.id = triggerId;

    navigation.navigate({
      name: 'WorkflowEdit',
      params: {
        workflowId: route.params.workflowId || undefined,
        triggerResult: {
          token: Date.now(),
          mode: 'save',
          trigger,
        },
      },
      merge: true,
    });
  };

  const handleDelete = () => {
    Alert.alert(t('common.confirm'), t('workflows.confirmDeleteTrigger'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          if (!triggerId) {
            navigation.goBack();
            return;
          }

          navigation.navigate({
            name: 'WorkflowEdit',
            params: {
              workflowId: route.params.workflowId || undefined,
              triggerResult: {
                token: Date.now(),
                mode: 'delete',
                triggerId,
              },
            },
            merge: true,
          });
        },
      },
    ]);
  };

  const triggerTypeOptionsTranslated = triggerTypeOptions.map((opt) => ({
    id: opt.value,
    name: t(opt.label),
  }));

  const dateFieldOptions = [
    { label: t('workflows.dateFieldAdded'), value: 'added' as const },
    { label: t('workflows.dateFieldCreated'), value: 'created' as const },
    { label: t('workflows.dateFieldModified'), value: 'modified' as const },
    { label: t('workflows.dateFieldCustom'), value: 'custom_field' as const },
  ];

  return (
    <ScrollView
      style={[screenStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={screenStyles.content}
      keyboardShouldPersistTaps="handled"
    >
      <SearchableDropdown
        label={t('workflows.triggerType')}
        items={triggerTypeOptionsTranslated}
        selectedId={type}
        allowClear={false}
        searchable={false}
        onSelect={(val) => setType((val as TriggerType) ?? TriggerType.DocumentAdded)}
      />

      {type !== TriggerType.Scheduled ? (
        <>
          <TextInput
            label={t('workflows.filterPath')}
            value={filterPath}
            onChangeText={setFilterPath}
            mode="outlined"
            style={styles.input}
            placeholder="*"
          />

          <TextInput
            label={t('workflows.filterFilename')}
            value={filterFilename}
            onChangeText={setFilterFilename}
            mode="outlined"
            style={styles.input}
            placeholder="*"
          />

          <TextInput
            label={t('workflows.match')}
            value={match}
            onChangeText={setMatch}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <TextInput
            label={t('common.matchingAlgorithm')}
            value={matchingAlgorithm.toString()}
            onChangeText={(val) => setMatchingAlgorithm(parseInt(val, 10) || 0)}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
          />

          <View style={styles.switchContainer}>
            <List.Item
              title={t('common.caseInsensitive')}
              left={() => (
                <Checkbox
                  status={isInsensitive ? 'checked' : 'unchecked'}
                  onPress={() => setIsInsensitive(!isInsensitive)}
                />
              )}
            />
          </View>
        </>
      ) : null}

      {type === TriggerType.Scheduled ? (
        <>
          <TextInput
            label={t('workflows.scheduleOffsetDays')}
            value={scheduleOffsetDays}
            onChangeText={setScheduleOffsetDays}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
          />

          <View style={styles.switchContainer}>
            <List.Item
              title={t('workflows.scheduleIsRecurring')}
              left={() => (
                <Checkbox
                  status={scheduleIsRecurring ? 'checked' : 'unchecked'}
                  onPress={() => setScheduleIsRecurring(!scheduleIsRecurring)}
                />
              )}
            />
          </View>

          {scheduleIsRecurring ? (
            <TextInput
              label={t('workflows.scheduleRecurringIntervalDays')}
              value={scheduleRecurringIntervalDays}
              onChangeText={setScheduleRecurringIntervalDays}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
            />
          ) : null}

          <List.Subheader>{t('workflows.scheduleDateField')}</List.Subheader>
          {(() => {
            const dateFieldItems = dateFieldOptions.map((opt, idx) => ({
              id: idx + 1,
              name: opt.label,
              value: opt.value,
            }));
            const selectedDateFieldId =
              dateFieldItems.find((item) => item.value === scheduleDateField)?.id ?? null;

            return (
              <SearchableDropdown
                label={t('workflows.scheduleDateField')}
                items={dateFieldItems}
                selectedId={selectedDateFieldId}
                allowClear={false}
                searchable={false}
                onSelect={(id) => {
                  const item = dateFieldItems.find((i) => i.id === id);
                  setScheduleDateField(
                    (item?.value ?? dateFieldOptions[0].value) as
                      | 'added'
                      | 'created'
                      | 'modified'
                      | 'custom_field',
                  );
                }}
              />
            );
          })()}

          {scheduleDateField === 'custom_field' ? (
            <SearchableDropdown
              label={t('workflows.scheduleDateCustomField')}
              items={customFields}
              selectedId={scheduleDateCustomField}
              allowClear={false}
              searchable={false}
              onSelect={(id) => setScheduleDateCustomField(id)}
            />
          ) : null}
        </>
      ) : null}

      {[TriggerType.DocumentAdded, TriggerType.DocumentUpdated, TriggerType.Scheduled].includes(
        type,
      ) ? (
        <>
          <List.Subheader>{t('workflows.triggers')}</List.Subheader>

          <SearchableDropdown
            label={t('documents.correspondent')}
            items={allCorrespondents.map((c) => ({ id: c.id, name: c.name }))}
            selectedId={filterHasCorrespondent}
            allowClear
            onSelect={(id) => setFilterHasCorrespondent(id)}
          />

          <SearchableDropdown
            label={t('documents.documentType')}
            items={allDocumentTypes.map((dt) => ({ id: dt.id, name: dt.name }))}
            selectedId={filterHasDocumentType}
            allowClear
            onSelect={(id) => setFilterHasDocumentType(id)}
          />

          <SearchableDropdown
            label={t('documents.storagePath')}
            items={allStoragePaths.map((sp) => ({ id: sp.id, name: sp.name }))}
            selectedId={filterHasStoragePath}
            allowClear
            onSelect={(id) => setFilterHasStoragePath(id)}
          />

          <Divider style={{ marginVertical: 8 }} />
          <MultiSelectChips
            chipItems={allTags}
            selectedIds={filterHasTags}
            onSelectionChange={setFilterHasTags}
            label={t('workflows.filterHasTags')}
          />

          <MultiSelectChips
            chipItems={allTags}
            selectedIds={filterHasAllTags}
            onSelectionChange={setFilterHasAllTags}
            label={t('workflows.filterHasAllTags')}
          />

          <MultiSelectChips
            chipItems={allTags}
            selectedIds={filterHasNotTags}
            onSelectionChange={setFilterHasNotTags}
            label={t('workflows.filterHasNotTags')}
          />

          <Divider style={{ marginVertical: 8 }} />
          <MultiSelectChips
            chipItems={allCorrespondents.map((c) => ({ id: c.id, name: c.name }))}
            selectedIds={filterHasNotCorrespondents}
            onSelectionChange={setFilterHasNotCorrespondents}
            label={t('workflows.filterHasNotCorrespondents')}
          />

          <MultiSelectChips
            chipItems={allDocumentTypes.map((d) => ({ id: d.id, name: d.name }))}
            selectedIds={filterHasNotDocumentTypes}
            onSelectionChange={setFilterHasNotDocumentTypes}
            label={t('workflows.filterHasNotDocumentTypes')}
          />

          <MultiSelectChips
            chipItems={allStoragePaths.map((s) => ({ id: s.id, name: s.name }))}
            selectedIds={filterHasNotStoragePaths}
            onSelectionChange={setFilterHasNotStoragePaths}
            label={t('workflows.filterHasNotStoragePaths')}
          />
        </>
      ) : null}

      <Button mode="contained" onPress={handleSave} style={buttonStyles.saveButton}>
        {t('common.apply')}
      </Button>

      <Button
        mode="outlined"
        textColor={theme.colors.error}
        onPress={handleDelete}
        style={buttonStyles.deleteButton}
      >
        {t('common.delete')}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  segmented: {
    marginBottom: 16,
  },
  menuButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    marginBottom: 12,
  },
});
