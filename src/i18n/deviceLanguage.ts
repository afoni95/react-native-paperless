// Until a language is picked in Manage › Display, the app follows the phone's language
// (if it is one the app supports, otherwise English).
import { I18nManager } from 'react-native';
import type { Language } from '@/types';

const SUPPORTED: Language[] = ['en', 'de'];

const deviceLocale = (): string => {
  let locale = '';
  try {
    locale = I18nManager.getConstants().localeIdentifier || '';
  } catch {
    // fall through to Intl
  }
  if (!locale) {
    try {
      locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    } catch {
      locale = '';
    }
  }
  return locale.replace(/_/g, '-');
};

export const deviceLanguage = (): Language => {
  const lang = deviceLocale().split('-')[0].toLowerCase();
  return (SUPPORTED as string[]).includes(lang) ? (lang as Language) : 'en';
};
