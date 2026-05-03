import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { List, Divider, useTheme, Button, Text, Snackbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { ConfirmDialog } from '@/components';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { logout, serverUrl, login } = useAuthStore();
  const { status } = useNetworkStore();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [reconnectUrl, setReconnectUrl] = useState(serverUrl ?? '');
  const [reconnectUsername, setReconnectUsername] = useState('');
  const [reconnectPassword, setReconnectPassword] = useState('');
  const [reconnecting, setReconnecting] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const handleReconnect = async () => {
    if (!reconnectUrl.trim() || !reconnectUsername.trim() || !reconnectPassword.trim()) return;
    setReconnecting(true);
    try {
      const url = reconnectUrl.trim().replace(/\/$/, '');
      const resp = await axios.post<{ token: string }>(`${url}/api/token/`, {
        username: reconnectUsername.trim(),
        password: reconnectPassword.trim(),
      });
      await login(resp.data.token, url);
      setSnackbar(t('settings.reconnectSuccess'));
    } catch {
      setSnackbar(t('settings.reconnectFailed'));
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {status !== NetworkStatus.Online ? (
        <View style={[styles.offlineSection]}>
          <Text
            variant="labelLarge"
            style={{ color: theme.colors.error, fontWeight: '700', marginBottom: 8 }}
          >
            {status === NetworkStatus.Offline
              ? t('common.offlineMode')
              : t('common.disconnectedMode')}
          </Text>
          <RNTextInput
            value={reconnectUrl}
            onChangeText={setReconnectUrl}
            placeholder={t('auth.serverUrl')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            autoCapitalize="none"
            keyboardType="url"
            style={[
              styles.textInput,
              { color: theme.colors.onSurface, borderColor: theme.colors.outline },
            ]}
          />
          <RNTextInput
            value={reconnectUsername}
            onChangeText={setReconnectUsername}
            placeholder={t('auth.username')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            autoCapitalize="none"
            style={[
              styles.textInput,
              { color: theme.colors.onSurface, borderColor: theme.colors.outline },
            ]}
          />
          <RNTextInput
            value={reconnectPassword}
            onChangeText={setReconnectPassword}
            placeholder={t('auth.password')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            secureTextEntry
            style={[
              styles.textInput,
              { color: theme.colors.onSurface, borderColor: theme.colors.outline },
            ]}
          />
          <Button
            mode="contained"
            loading={reconnecting}
            disabled={reconnecting}
            onPress={handleReconnect}
            style={styles.reconnectButton}
          >
            {reconnecting ? t('settings.reconnecting') : t('settings.testReconnect')}
          </Button>
        </View>
      ) : (
        <List.Section>
          <List.Subheader>{t('common.server')}</List.Subheader>
          <List.Item
            title={serverUrl || '—'}
            left={(props) => <List.Icon {...props} icon="server" />}
          />
        </List.Section>
      )}

      {status === NetworkStatus.Online ? (
        <>
          <Divider />

          <View style={styles.logoutSection}>
            <Button
              mode="outlined"
              icon="logout"
              textColor={theme.colors.error}
              onPress={() => setShowLogoutDialog(true)}
              style={styles.logoutButton}
            >
              {t('auth.logout')}
            </Button>
          </View>
        </>
      ) : null}

      <ConfirmDialog
        visible={showLogoutDialog}
        title={t('auth.logout')}
        message={t('auth.logoutConfirm')}
        destructive
        onConfirm={() => {
          setShowLogoutDialog(false);
          logout();
        }}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineSection: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  reconnectButton: {
    marginTop: 4,
  },
  logoutSection: {
    padding: 16,
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
});
