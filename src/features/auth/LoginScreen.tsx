import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api';

export const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { login, serverUrl, setServerUrl } = useAuthStore();

  const [url, setUrl] = useState(serverUrl);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!url || !username || !password) return;

    setError('');
    setLoading(true);

    try {
      let cleanUrl = url.trim().replace(/\/+$/, '');
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `http://${cleanUrl}`;
      }
      await setServerUrl(cleanUrl);
      const response = await authApi.login(username, password);
      await login(response.token, cleanUrl);
    } catch (err: any) {
      const status = err?.response?.status;
      if (__DEV__)
        console.warn('login failed', status, err?.message);
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="file-document-outline" size={32} color={theme.colors.primary} />
            <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
              Paperless
            </Text>
          </View>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('auth.subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label={t('auth.serverUrl')}
            placeholder={t('auth.serverUrlPlaceholder')}
            value={url}
            onChangeText={setUrl}
            mode="outlined"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="server" />}
            style={styles.input}
          />

          <TextInput
            label={t('auth.username')}
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
          />

          <TextInput
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          {error ? (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading || !url || !username || !password}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
