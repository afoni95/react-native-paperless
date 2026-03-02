import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, SERVER_URL_KEY, BIOMETRIC_ENABLED_KEY } from './constants';

interface AuthState {
  token: string | null;
  serverUrl: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  biometricEnabled: boolean;
  biometricLocked: boolean;
  login: (token: string, serverUrl: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setServerUrl: (url: string) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  unlockBiometric: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  serverUrl: '',
  isAuthenticated: false,
  isLoading: true,
  isDemo: false,
  biometricEnabled: false,
  biometricLocked: false,

  login: async (token: string, serverUrl: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await AsyncStorage.setItem(SERVER_URL_KEY, serverUrl);
    set({ token, serverUrl, isAuthenticated: true, isDemo: false });
  },

  loginDemo: () => {
    set({
      token: 'demo-token',
      serverUrl: 'https://demo.paperless.example',
      isAuthenticated: true,
      isDemo: true,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, isAuthenticated: false, isDemo: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const serverUrl = (await AsyncStorage.getItem(SERVER_URL_KEY)) || '';
      const biometricRaw = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      const biometricEnabled = biometricRaw === 'true';

      if (token && serverUrl) {
        if (biometricEnabled) {
          // Credentials exist but biometric gate is active – stay locked
          set({
            serverUrl,
            biometricEnabled,
            biometricLocked: true,
            isLoading: false,
          });
        } else {
          set({ token, serverUrl, isAuthenticated: true, biometricEnabled, isLoading: false });
        }
      } else {
        set({ isLoading: false, serverUrl, biometricEnabled });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setServerUrl: async (url: string) => {
    await AsyncStorage.setItem(SERVER_URL_KEY, url);
    set({ serverUrl: url });
  },

  setBiometricEnabled: async (enabled: boolean) => {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    set({ biometricEnabled: enabled });
  },

  unlockBiometric: async () => {
    // Called after successful biometric authentication – restore the saved token
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const serverUrl = (await AsyncStorage.getItem(SERVER_URL_KEY)) || '';
      if (token && serverUrl) {
        set({ token, serverUrl, isAuthenticated: true, biometricLocked: false });
      } else {
        // Token was removed externally – drop to login
        set({ biometricLocked: false });
      }
    } catch {
      set({ biometricLocked: false });
    }
  },
}));
