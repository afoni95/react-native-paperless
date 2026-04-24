import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { List, Divider, useTheme, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { ConfirmDialog } from '@/components';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { logout, serverUrl } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>{t('common.server')}</List.Subheader>
        <List.Item
          title={serverUrl || '—'}
          left={(props) => <List.Icon {...props} icon="server" />}
        />
      </List.Section>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutSection: {
    padding: 16,
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
});
