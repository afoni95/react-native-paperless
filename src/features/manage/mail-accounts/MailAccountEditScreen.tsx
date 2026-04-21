import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog, HasPermission, LoadingScreen, SearchableDropdown } from '@/components';
import { ManageStackParamList } from '@/navigation/types';
import { useDeleteMailAccount, useMailAccount, useUpsertMailAccount, useUsers } from '@/reactQuery';
import { ImapSecurity, MailAccountCreatePayload, MailAccountUpdatePayload } from '@/types';
import { buttonStyles, formStyles, screenStyles } from '@/theme/commonStyles';

type Props = NativeStackScreenProps<ManageStackParamList, 'MailAccountEdit'>;
const IMAP_SECURITY_OPTIONS: ImapSecurity[] = [1, 2, 3];

export const MailAccountEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const mailAccountId = route.params?.mailAccountId;
  const isNew = !mailAccountId;

  const [name, setName] = useState('');
  const [imapServer, setImapServer] = useState('');
  const [imapPortText, setImapPortText] = useState('993');
  const [imapSecurity, setImapSecurity] = useState<ImapSecurity>(2);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [characterSet, setCharacterSet] = useState('UTF-8');
  const [isToken, setIsToken] = useState(false);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: mailAccount, isLoading } = useMailAccount(mailAccountId!, !!mailAccountId);
  const { data: usersData } = useUsers({ page: 1, page_size: 1000 });

  const userOptions = useMemo(
    () =>
      (usersData?.results ?? []).map((user) => ({
        id: user.id,
        name: `${[user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.username} (${user.username})`,
      })),
    [usersData?.results],
  );

  useEffect(() => {
    if (!mailAccount) return;

    setName(mailAccount.name);
    setImapServer(mailAccount.imap_server);
    setImapPortText(String(mailAccount.imap_port));
    setImapSecurity(mailAccount.imap_security);
    setUsername(mailAccount.username);
    setPassword('');
    setCharacterSet(mailAccount.character_set);
    setIsToken(mailAccount.is_token);
    setOwnerId(mailAccount.owner);
  }, [mailAccount]);

  const saveMutation = useUpsertMailAccount({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const deleteMutation = useDeleteMailAccount({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    },
  });

  const imapPort = Number(imapPortText);

  const hasValidNumericFields = Number.isFinite(imapPort) && imapPort > 0;

  const canSave =
    !!name.trim() &&
    !!imapServer.trim() &&
    !!username.trim() &&
    !!characterSet.trim() &&
    hasValidNumericFields &&
    (isNew ? !!password.trim() : true) &&
    !saveMutation.isPending;

  const buildPayload = (): MailAccountCreatePayload | MailAccountUpdatePayload => {
    const payload: MailAccountUpdatePayload = {
      name: name.trim(),
      imap_server: imapServer.trim(),
      imap_port: imapPort,
      imap_security: imapSecurity,
      username: username.trim(),
      character_set: characterSet.trim(),
      is_token: isToken,
      owner: ownerId,
    };

    if (password.trim()) {
      payload.password = password;
    }

    if (isNew) {
      return {
        name: payload.name || '',
        imap_server: payload.imap_server || '',
        imap_port: payload.imap_port || 0,
        imap_security: payload.imap_security || 1,
        username: payload.username || '',
        password: payload.password || '',
        character_set: payload.character_set || 'UTF-8',
        is_token: payload.is_token || false,
        owner: payload.owner,
        user_can_change: true,
        account_type: 1,
        expiration: null,
      };
    }

    return payload;
  };

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
        label={t('mailAccounts.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailAccounts.imapServer')}
        value={imapServer}
        onChangeText={setImapServer}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailAccounts.imapPort')}
        value={imapPortText}
        onChangeText={setImapPortText}
        mode="outlined"
        keyboardType="number-pad"
        style={formStyles.input}
      />

      <Text variant="labelLarge" style={[formStyles.label, { color: theme.colors.onBackground }]}>
        {t('mailAccounts.imapSecurityLabel')}
      </Text>
      <View style={styles.securityRow}>
        {IMAP_SECURITY_OPTIONS.map((value) => (
          <Button
            key={value}
            mode={imapSecurity === value ? 'contained' : 'outlined'}
            compact
            onPress={() => setImapSecurity(value)}
            style={styles.securityButton}
          >
            {t(`mailAccounts.imapSecurity.${value}`)}
          </Button>
        ))}
      </View>

      <TextInput
        label={t('mailAccounts.username')}
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        style={formStyles.input}
      />

      <TextInput
        label={t('mailAccounts.password')}
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={formStyles.input}
        placeholder={!isNew ? t('common.leave') : undefined}
      />

      <View style={formStyles.switchRow}>
        <Text variant="bodyLarge">{t('mailAccounts.isToken')}</Text>
        <Switch value={isToken} onValueChange={setIsToken} />
      </View>

      <TextInput
        label={t('mailAccounts.characterSet')}
        value={characterSet}
        onChangeText={setCharacterSet}
        mode="outlined"
        style={formStyles.input}
      />

      <SearchableDropdown
        items={userOptions}
        selectedId={ownerId}
        onSelect={setOwnerId}
        label={t('mailAccounts.owner')}
        placeholder={t('mailAccounts.owner')}
      />

      <HasPermission action={isNew ? 'add' : 'change'} resource="mailaccount">
        <Button
          mode="contained"
          onPress={() => saveMutation.mutate({ id: mailAccountId, ...buildPayload() })}
          loading={saveMutation.isPending}
          disabled={!canSave}
          style={buttonStyles.saveButton}
          contentStyle={buttonStyles.saveButtonContent}
        >
          {t('common.save')}
        </Button>
      </HasPermission>

      {!isNew && (
        <HasPermission action="delete" resource="mailaccount">
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
        message={t('mailAccounts.deleteConfirm')}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          if (mailAccountId) {
            deleteMutation.mutate(mailAccountId);
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
  securityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  securityButton: {
    marginRight: 6,
    marginBottom: 6,
  },
});
