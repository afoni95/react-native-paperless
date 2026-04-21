import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog, HasPermission, LoadingScreen, MultiSelectChips, SearchableDropdown } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import {
  useDeleteMailRule,
  useMailRule,
  useUpsertMailRule,
  useAllMailAccounts,
  useAllTags,
  useAllCorrespondents,
  useAllDocumentTypes,
  useUsers,
} from '@/reactQuery';
import { MailRuleCreatePayload, MailRuleUpdatePayload } from '@/types';
import { buttonStyles, formStyles, screenStyles } from '@/theme/commonStyles';

type Props = NativeStackScreenProps<ManageStackParamList, 'MailRuleEdit'>;

export const MailRuleEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const mailRuleId = route.params?.mailRuleId;
  const isNew = !mailRuleId;

  const [name, setName] = useState('');
  const [account, setAccount] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [folder, setFolder] = useState('INBOX');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterBody, setFilterBody] = useState('');
  const [filterAttachmentFilenameInclude, setFilterAttachmentFilenameInclude] = useState('');
  const [filterAttachmentFilenameExclude, setFilterAttachmentFilenameExclude] = useState('');
  const [maximumAgeText, setMaximumAgeText] = useState('30');
  const [action, setAction] = useState(2);
  const [actionParameter, setActionParameter] = useState('');
  const [assignTitleFrom, setAssignTitleFrom] = useState(1);
  const [assignTags, setAssignTags] = useState<number[]>([]);
  const [assignCorrespondentFrom, setAssignCorrespondentFrom] = useState(1);
  const [assignCorrespondent, setAssignCorrespondent] = useState<number | null>(null);
  const [assignDocumentType, setAssignDocumentType] = useState<number | null>(null);
  const [assignOwnerFromRule, setAssignOwnerFromRule] = useState(true);
  const [orderText, setOrderText] = useState('0');
  const [attachmentType, setAttachmentType] = useState(1);
  const [consumptionScope, setConsumptionScope] = useState(1);
  const [pdfLayout, setPdfLayout] = useState(0);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: mailRule, isLoading } = useMailRule(mailRuleId!, !!mailRuleId);
  const { data: mailAccounts } = useAllMailAccounts();
  const { data: tags } = useAllTags();
  const { data: correspondents } = useAllCorrespondents();
  const { data: documentTypes } = useAllDocumentTypes();
  const { data: usersData } = useUsers({ page: 1, page_size: 1000 });

  const mailAccountOptions = useMemo(
    () => (mailAccounts ?? []).map((a) => ({ id: a.id, name: a.name })),
    [mailAccounts],
  );

  const correspondentOptions = useMemo(
    () => (correspondents ?? []).map((c) => ({ id: c.id, name: c.name })),
    [correspondents],
  );

  const documentTypeOptions = useMemo(
    () => (documentTypes ?? []).map((dt) => ({ id: dt.id, name: dt.name })),
    [documentTypes],
  );

  const tagChipItems = useMemo(
    () =>
      (tags ?? []).map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        text_color: tag.text_color,
      })),
    [tags],
  );

  const userOptions = useMemo(
    () =>
      (usersData?.results ?? []).map((user) => ({
        id: user.id,
        name: `${[user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.username} (${user.username})`,
      })),
    [usersData?.results],
  );

  useEffect(() => {
    if (!mailRule) return;

    setName(mailRule.name);
    setAccount(mailRule.account);
    setEnabled(mailRule.enabled);
    setFolder(mailRule.folder);
    setFilterFrom(mailRule.filter_from ?? '');
    setFilterTo(mailRule.filter_to ?? '');
    setFilterSubject(mailRule.filter_subject ?? '');
    setFilterBody(mailRule.filter_body ?? '');
    setFilterAttachmentFilenameInclude(mailRule.filter_attachment_filename_include ?? '');
    setFilterAttachmentFilenameExclude(mailRule.filter_attachment_filename_exclude ?? '');
    setMaximumAgeText(String(mailRule.maximum_age));
    setAction(mailRule.action);
    setActionParameter(mailRule.action_parameter ?? '');
    setAssignTitleFrom(mailRule.assign_title_from);
    setAssignTags(mailRule.assign_tags);
    setAssignCorrespondentFrom(mailRule.assign_correspondent_from);
    setAssignCorrespondent(mailRule.assign_correspondent);
    setAssignDocumentType(mailRule.assign_document_type);
    setAssignOwnerFromRule(mailRule.assign_owner_from_rule);
    setOrderText(String(mailRule.order));
    setAttachmentType(mailRule.attachment_type);
    setConsumptionScope(mailRule.consumption_scope);
    setPdfLayout(mailRule.pdf_layout);
    setOwnerId(mailRule.owner);
  }, [mailRule]);

  const saveMutation = useUpsertMailRule({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const deleteMutation = useDeleteMailRule({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const maximumAge = Number(maximumAgeText);
  const order = Number(orderText);

  const canSave =
    !!name.trim() &&
    account !== null &&
    Number.isFinite(maximumAge) &&
    Number.isFinite(order) &&
    !saveMutation.isPending;

  const buildPayload = (): MailRuleCreatePayload | MailRuleUpdatePayload => {
    return {
      name: name.trim(),
      account: account!,
      enabled,
      folder: folder.trim(),
      filter_from: filterFrom.trim() || null,
      filter_to: filterTo.trim() || null,
      filter_subject: filterSubject.trim() || null,
      filter_body: filterBody.trim() || null,
      filter_attachment_filename_include: filterAttachmentFilenameInclude.trim() || null,
      filter_attachment_filename_exclude: filterAttachmentFilenameExclude.trim() || null,
      maximum_age: maximumAge,
      action,
      action_parameter: actionParameter.trim() || null,
      assign_title_from: assignTitleFrom,
      assign_tags: assignTags,
      assign_correspondent_from: assignCorrespondentFrom,
      assign_correspondent: assignCorrespondentFrom === 4 ? assignCorrespondent : null,
      assign_document_type: assignDocumentType,
      assign_owner_from_rule: assignOwnerFromRule,
      order,
      attachment_type: attachmentType,
      consumption_scope: consumptionScope,
      pdf_layout: pdfLayout,
      owner: ownerId,
    };
  };

  if (!isNew && isLoading) {
    return <LoadingScreen />;
  }

  const ACTION_OPTIONS = [
    { key: 1, label: t('mailRules.actionOptions.delete') },
    { key: 2, label: t('mailRules.actionOptions.move') },
    { key: 3, label: t('mailRules.actionOptions.markRead') },
    { key: 4, label: t('mailRules.actionOptions.flag') },
    { key: 5, label: t('mailRules.actionOptions.tag') },
  ];

  const ASSIGN_TITLE_OPTIONS = [
    { key: 1, label: t('mailRules.assignTitleOptions.subject') },
    { key: 2, label: t('mailRules.assignTitleOptions.attachment') },
    { key: 3, label: t('mailRules.assignTitleOptions.none') },
  ];

  const ASSIGN_CORRESPONDENT_FROM_OPTIONS = [
    { key: 1, label: t('mailRules.assignCorrespondentFromOptions.none') },
    { key: 2, label: t('mailRules.assignCorrespondentFromOptions.mailAddress') },
    { key: 3, label: t('mailRules.assignCorrespondentFromOptions.name') },
    { key: 4, label: t('mailRules.assignCorrespondentFromOptions.correspondent') },
  ];

  const PDF_LAYOUT_OPTIONS = [
    { key: 0, label: t('mailRules.pdfLayoutOptions.systemDefault') },
    { key: 1, label: t('mailRules.pdfLayoutOptions.textThenHtml') },
    { key: 2, label: t('mailRules.pdfLayoutOptions.htmlThenText') },
    { key: 3, label: t('mailRules.pdfLayoutOptions.htmlOnly') },
    { key: 4, label: t('mailRules.pdfLayoutOptions.textOnly') },
  ];

  const ATTACHMENT_TYPE_OPTIONS = [
    { key: 1, label: t('mailRules.attachmentTypeOptions.attachmentsOnly') },
    { key: 2, label: t('mailRules.attachmentTypeOptions.allFiles') },
  ];

  const CONSUMPTION_SCOPE_OPTIONS = [
    { key: 1, label: t('mailRules.consumptionScopeOptions.attachmentsOnly') },
    { key: 2, label: t('mailRules.consumptionScopeOptions.emlOnly') },
    { key: 3, label: t('mailRules.consumptionScopeOptions.emlAndAttachments') },
  ];

  return (
    <ScrollView
      style={[screenStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label={t('mailRules.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={formStyles.input}
      />

      <SearchableDropdown
        items={mailAccountOptions}
        selectedId={account}
        onSelect={setAccount}
        label={t('mailRules.account')}
        placeholder={t('mailRules.account')}
        allowClear={false}
      />

      <View style={formStyles.switchRow}>
        <Text variant="bodyLarge">{t('mailRules.enabled')}</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>

      <TextInput
        label={t('mailRules.folder')}
        value={folder}
        onChangeText={setFolder}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailRules.maximumAge')}
        value={maximumAgeText}
        onChangeText={setMaximumAgeText}
        mode="outlined"
        keyboardType="number-pad"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailRules.order')}
        value={orderText}
        onChangeText={setOrderText}
        mode="outlined"
        keyboardType="number-pad"
        style={formStyles.input}
      />

      {/* Action */}
      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('mailRules.action')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={formStyles.algoRow}>
        {ACTION_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            mode={action === opt.key ? 'contained' : 'outlined'}
            compact
            onPress={() => setAction(opt.key)}
            style={formStyles.algoButton}
          >
            {opt.label}
          </Button>
        ))}
      </ScrollView>

      {(action === 2 || action === 5) && (
        <TextInput
          label={t('mailRules.actionParameter')}
          value={actionParameter}
          onChangeText={setActionParameter}
          mode="outlined"
          style={formStyles.input}
        />
      )}

      {/* Filters */}
      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('mailRules.filtersSection')}
      </Text>

      <TextInput
        label={t('mailRules.filterFrom')}
        value={filterFrom}
        onChangeText={setFilterFrom}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailRules.filterTo')}
        value={filterTo}
        onChangeText={setFilterTo}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailRules.filterSubject')}
        value={filterSubject}
        onChangeText={setFilterSubject}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailRules.filterBody')}
        value={filterBody}
        onChangeText={setFilterBody}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailRules.filterAttachmentFilenameInclude')}
        value={filterAttachmentFilenameInclude}
        onChangeText={setFilterAttachmentFilenameInclude}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailRules.filterAttachmentFilenameExclude')}
        value={filterAttachmentFilenameExclude}
        onChangeText={setFilterAttachmentFilenameExclude}
        mode="outlined"
        style={formStyles.input}
      />

      {/* Assign Title From */}
      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('mailRules.assignTitleFrom')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={formStyles.algoRow}>
        {ASSIGN_TITLE_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            mode={assignTitleFrom === opt.key ? 'contained' : 'outlined'}
            compact
            onPress={() => setAssignTitleFrom(opt.key)}
            style={formStyles.algoButton}
          >
            {opt.label}
          </Button>
        ))}
      </ScrollView>

      {/* Assign Tags */}
      <MultiSelectChips
        chipItems={tagChipItems}
        selectedIds={assignTags}
        onSelectionChange={setAssignTags}
        label={t('mailRules.assignTags')}
      />

      {/* Assign Correspondent From */}
      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('mailRules.assignCorrespondentFrom')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={formStyles.algoRow}>
        {ASSIGN_CORRESPONDENT_FROM_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            mode={assignCorrespondentFrom === opt.key ? 'contained' : 'outlined'}
            compact
            onPress={() => setAssignCorrespondentFrom(opt.key)}
            style={formStyles.algoButton}
          >
            {opt.label}
          </Button>
        ))}
      </ScrollView>

      {assignCorrespondentFrom === 4 && (
        <SearchableDropdown
          items={correspondentOptions}
          selectedId={assignCorrespondent}
          onSelect={setAssignCorrespondent}
          label={t('mailRules.assignCorrespondent')}
          placeholder={t('mailRules.assignCorrespondent')}
        />
      )}

      {/* Assign Document Type */}
      <SearchableDropdown
        items={documentTypeOptions}
        selectedId={assignDocumentType}
        onSelect={setAssignDocumentType}
        label={t('mailRules.assignDocumentType')}
        placeholder={t('mailRules.assignDocumentType')}
      />

      {/* Assign Owner From Rule */}
      <View style={formStyles.switchRow}>
        <Text variant="bodyLarge">{t('mailRules.assignOwnerFromRule')}</Text>
        <Switch value={assignOwnerFromRule} onValueChange={setAssignOwnerFromRule} />
      </View>

      {/* Attachment Type */}
      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('mailRules.attachmentType')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={formStyles.algoRow}>
        {ATTACHMENT_TYPE_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            mode={attachmentType === opt.key ? 'contained' : 'outlined'}
            compact
            onPress={() => setAttachmentType(opt.key)}
            style={formStyles.algoButton}
          >
            {opt.label}
          </Button>
        ))}
      </ScrollView>

      {/* Consumption Scope */}
      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('mailRules.consumptionScope')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={formStyles.algoRow}>
        {CONSUMPTION_SCOPE_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            mode={consumptionScope === opt.key ? 'contained' : 'outlined'}
            compact
            onPress={() => setConsumptionScope(opt.key)}
            style={formStyles.algoButton}
          >
            {opt.label}
          </Button>
        ))}
      </ScrollView>

      {/* PDF Layout */}
      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('mailRules.pdfLayout')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={formStyles.algoRow}>
        {PDF_LAYOUT_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            mode={pdfLayout === opt.key ? 'contained' : 'outlined'}
            compact
            onPress={() => setPdfLayout(opt.key)}
            style={formStyles.algoButton}
          >
            {opt.label}
          </Button>
        ))}
      </ScrollView>

      {/* Owner */}
      <SearchableDropdown
        items={userOptions}
        selectedId={ownerId}
        onSelect={setOwnerId}
        label={t('mailRules.owner')}
        placeholder={t('mailRules.owner')}
      />

      <HasPermission action={isNew ? 'add' : 'change'} resource="mailrule">
        <Button
          mode="contained"
          onPress={() => saveMutation.mutate({ id: mailRuleId, ...buildPayload() })}
          loading={saveMutation.isPending}
          disabled={!canSave}
          style={buttonStyles.saveButton}
          contentStyle={buttonStyles.saveButtonContent}
        >
          {t('common.save')}
        </Button>
      </HasPermission>

      {!isNew && (
        <HasPermission action="delete" resource="mailrule">
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
        message={t('mailRules.deleteConfirm')}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          if (mailRuleId) {
            deleteMutation.mutate(mailRuleId);
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
  idText: {
    marginBottom: 12,
    opacity: 0.7,
  },
});
