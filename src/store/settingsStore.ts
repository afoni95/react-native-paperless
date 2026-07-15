import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SETTINGS_KEY } from './constants';
import { THEME_NAMES } from '@/types';
import type { ThemeMode, ThemeName, Language } from '@/types';

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
        const raw = parsed.theme === 'light' ? 'bright' : parsed.theme;
        const theme: ThemeMode =
          raw === 'auto' || THEME_NAMES.includes(raw as ThemeName) ? raw : 'auto';
        const language: Language = parsed.language || 'en';
        set({ theme, language, isLoaded: true });
        if (raw !== parsed.theme) {
          await persistSettings(get());
        }
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));

const persistSettings = async (state: SettingsState): Promise<void> => {
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
};
