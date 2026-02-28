import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'paperless_token';
const SERVER_URL_KEY = 'paperless_server_url';

interface AuthState {
  token: string | null;
  serverUrl: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, serverUrl: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setServerUrl: (url: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  serverUrl: '',
  isAuthenticated: false,
  isLoading: true,

  login: async (token: string, serverUrl: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await AsyncStorage.setItem(SERVER_URL_KEY, serverUrl);
    set({ token, serverUrl, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const serverUrl = (await AsyncStorage.getItem(SERVER_URL_KEY)) || '';
      if (token && serverUrl) {
        set({ token, serverUrl, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false, serverUrl });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setServerUrl: async (url: string) => {
    await AsyncStorage.setItem(SERVER_URL_KEY, url);
    set({ serverUrl: url });
  },
}));
