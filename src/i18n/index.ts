import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import de from './locales/de.json';
import { useSettingsStore } from '@/store/settingsStore';

const resources = {
  en: { translation: en },
  de: { translation: de },
};

i18n.use(initReactI18next).init({
  resources,
  lng: useSettingsStore.getState().language || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  defaultNS: 'translation',
  compatibilityJSON: 'v4',
});

// Subscribe to language changes from settings store
useSettingsStore.subscribe((state) => {
  if (state.language && i18n.language !== state.language) {
    i18n.changeLanguage(state.language);
  }
});

export default i18n;
