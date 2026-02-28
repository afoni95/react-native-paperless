import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'paperless_settings';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'de';

interface SettingsState {
  theme: ThemeMode;
  language: Language;
  isLoaded: boolean;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'auto',
  language: 'en',
  isLoaded: false,

  setTheme: async (theme: ThemeMode) => {
    set({ theme });
    await persistSettings(get());
  },

  setLanguage: async (language: Language) => {
    set({ language });
    await persistSettings(get());
  },

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          theme: parsed.theme || 'auto',
          language: parsed.language || 'en',
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));

async function persistSettings(state: SettingsState) {
  try {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        theme: state.theme,
        language: state.language,
      }),
    );
  } catch {
    // idk
  }
}
