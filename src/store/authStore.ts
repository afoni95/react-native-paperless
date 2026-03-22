import { create } from 'zustand';
import type { User } from '@/api/users';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, SERVER_URL_KEY, BIOMETRIC_ENABLED_KEY, USERNAME_KEY } from './constants';
import apiClient from '@/api/client';
import { PaginatedResponse } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  serverUrl: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  biometricEnabled: boolean;
  biometricLocked: boolean;
  username: string | null;
  login: (token: string, serverUrl: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setServerUrl: (url: string) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  setUsername: (username: string | null) => Promise<void>;
  unlockBiometric: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  serverUrl: '',
  isAuthenticated: false,
  isLoading: true,
  isDemo: false,
  biometricEnabled: false,
  biometricLocked: false,
  username: null,

  login: async (token: string, serverUrl: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await AsyncStorage.setItem(SERVER_URL_KEY, serverUrl);
    set({ token, serverUrl, isAuthenticated: true, isDemo: false });
  },

  loginDemo: () => {
    const demoUserUrl = 'https://demo.paperless.example';
    AsyncStorage.setItem(SERVER_URL_KEY, demoUserUrl);
    AsyncStorage.setItem(USERNAME_KEY, 'demo');
    set({
      token: 'demo-token',
      serverUrl: demoUserUrl,
      isAuthenticated: true,
      isDemo: true,
      username: 'demo',
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await AsyncStorage.removeItem(USERNAME_KEY);
    set({ token: null, isAuthenticated: false, isDemo: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const serverUrl = (await AsyncStorage.getItem(SERVER_URL_KEY)) || '';
      const username = (await AsyncStorage.getItem(USERNAME_KEY)) || null;
      const biometricRaw = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      const biometricEnabled = biometricRaw === 'true';

      if (token && serverUrl) {
        if (biometricEnabled) {
          // Credentials exist but biometric gate is active – stay locked
          set({
            serverUrl,
            biometricEnabled,
            biometricLocked: true,
            username,
            isLoading: false,
          });
        } else {
          set({
            token,
            serverUrl,
            isAuthenticated: true,
            biometricEnabled,
            isLoading: false,
            username,
          });

          // Try to fetch the full user object if we have a username
          if (username) {
            try {
              const resp = await apiClient.get('/api/users/', { params: { username } });
              const list = resp.data as PaginatedResponse<User>;
              const found = list.results?.find((u) => u.username === username) || null;
              if (found) set({ user: found });
            } catch {
              await SecureStore.deleteItemAsync(TOKEN_KEY);
              await AsyncStorage.removeItem(USERNAME_KEY);
              set({ token: null, isAuthenticated: false, isDemo: false });
            }
          }
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

  setUsername: async (username: string | null) => {
    if (username) {
      await AsyncStorage.setItem(USERNAME_KEY, username);
      set({ username });
    } else {
      await AsyncStorage.removeItem(USERNAME_KEY);
      set({ username: null });
    }
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
      const username = (await AsyncStorage.getItem(USERNAME_KEY)) || null;
      if (token && serverUrl) {
        set({ token, serverUrl, isAuthenticated: true, biometricLocked: false, username });

        // Try to fetch user when unlocking biometric
        if (username) {
          try {
            const resp = await apiClient.get('/api/users/', { params: { username } });
            const list = resp.data as PaginatedResponse<User>;
            const found = list.results?.find((u) => u.username === username) || null;
            if (found) set({ user: found });
          } catch {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await AsyncStorage.removeItem(USERNAME_KEY);
            set({ token: null, isAuthenticated: false, isDemo: false });
          }
        }
      } else {
        // Token was removed externally – drop to login
        set({ biometricLocked: false });
      }
    } catch {
      set({ biometricLocked: false });
    }
  },
}));
