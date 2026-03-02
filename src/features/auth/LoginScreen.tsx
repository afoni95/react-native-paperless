import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  Animated,
  Easing,
  AppState,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { TextInput, Button, Text, useTheme, HelperText } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { authApi, MfaRequiredError, MFA_INVALID_ERROR } from '@/api/auth';
import { PaperlessApiError } from '@/types';

export const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { login, loginDemo, serverUrl, setServerUrl } = useAuthStore();

  const [url, setUrl] = useState(serverUrl);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const mfaInputRef = useRef<RNTextInput>(null);
  const mfaOpacity = useRef(new Animated.Value(0)).current;
  const mfaTranslate = useRef(new Animated.Value(40)).current;

  // Animate MFA section in + auto-focus
  useEffect(() => {
    if (mfaRequired) {
      mfaOpacity.setValue(0);
      mfaTranslate.setValue(40);
      Animated.parallel([
        Animated.timing(mfaOpacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(mfaTranslate, {
          toValue: 0,
          duration: 660,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
      ]).start();
      const timer = setTimeout(() => {
        mfaInputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mfaRequired, mfaOpacity, mfaTranslate]);

  // Auto-paste from clipboard when app comes to foreground and MFA is active
  useEffect(() => {
    if (!mfaRequired) return;
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        const text = await Clipboard.getStringAsync();
        if (/^\d{6}$/.test(text.trim())) {
          setMfaCode(text.trim());
        }
      }
    });
    return () => subscription.remove();
  }, [mfaRequired]);

  // Auto-submit when exactly 6 digits are entered
  useEffect(() => {
    if (mfaCode.length === 6 && mfaRequired && !loading) {
      handleLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mfaCode]);

  const resetMfaState = () => {
    setMfaRequired(false);
    setMfaCode('');
  };

  const handleUrlChange = (text: string) => {
    setUrl(text);
    if (mfaRequired) resetMfaState();
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (mfaRequired) resetMfaState();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (mfaRequired) resetMfaState();
  };

  const handleMfaCodeChange = (text: string) => {
    // Only allow digits, max 6
    const cleaned = text.replace(/\D/g, '').slice(0, 6);
    setMfaCode(cleaned);
  };

  const handleLogin = async () => {
    if (!url || !username || !password) return;
    if (mfaRequired && mfaCode.length !== 6) return;

    // Magic demo credentials for UI testing without a server
    if (url.trim() === '_demo_' && username === 'demo' && password === 'demo') {
      loginDemo();
      return;
    }

    setError('');
    setLoading(true);

    try {
      let cleanUrl = url.trim().replace(/\/+$/, '');
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `http://${cleanUrl}`;
      }
      await setServerUrl(cleanUrl);
      const response = await authApi.login(username, password, mfaRequired ? mfaCode : undefined);
      await login(response.token, cleanUrl);
    } catch (err: unknown) {
      if (err instanceof MfaRequiredError) {
        // Server demands TOTP – reveal the MFA input field
        setMfaRequired(true);
        setMfaCode('');
        return;
      }
      const apiErr = err as {
        response?: { data?: PaperlessApiError; status?: number };
        message?: string;
      };
      const errors = apiErr.response?.data?.non_field_errors;
      if (errors?.some((e) => e.includes(MFA_INVALID_ERROR))) {
        setError(t('auth.mfaInvalid'));
        setMfaCode('');
      } else {
        resetMfaState();
        if (__DEV__) console.warn('login failed', apiErr.response?.status, apiErr.message);
        setError(t('auth.loginError'));
      }
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
            <MaterialCommunityIcons
              name="file-document-outline"
              size={32}
              color={theme.colors.primary}
            />
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
            onChangeText={handleUrlChange}
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
            onChangeText={handleUsernameChange}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
          />

          <TextInput
            label={t('auth.password')}
            value={password}
            onChangeText={handlePasswordChange}
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

          {mfaRequired && (
            <Animated.View
              style={[
                styles.mfaContainer,
                {
                  opacity: mfaOpacity,
                  transform: [{ translateY: mfaTranslate }],
                },
              ]}
            >
              <View style={styles.mfaDivider}>
                <View
                  style={[styles.mfaDividerLine, { backgroundColor: theme.colors.outlineVariant }]}
                />
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <View
                  style={[styles.mfaDividerLine, { backgroundColor: theme.colors.outlineVariant }]}
                />
              </View>
              <Text
                variant="bodySmall"
                style={[styles.mfaPrompt, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('auth.mfaPrompt')}
              </Text>
              <TextInput
                ref={mfaInputRef}
                label={t('auth.mfaCode')}
                value={mfaCode}
                onChangeText={handleMfaCodeChange}
                mode="outlined"
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                style={styles.mfaInput}
                contentStyle={styles.mfaInputContent}
              />
            </Animated.View>
          )}

          {error ? (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={
              loading || !url || !username || !password || (mfaRequired && mfaCode.length !== 6)
            }
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? t('auth.loggingIn') : mfaRequired ? t('auth.mfaVerify') : t('auth.login')}
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
  mfaContainer: {
    marginTop: 4,
  },
  mfaDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  mfaDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  mfaPrompt: {
    textAlign: 'center',
    marginBottom: 8,
  },
  mfaInput: {
    marginBottom: 12,
  },
  mfaInputContent: {
    textAlign: 'center',
    letterSpacing: 12,
    fontSize: 24,
    paddingHorizontal: 0,
  },
});
