import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { resolveTheme, type AppTheme } from './index';

export function useAppTheme(): AppTheme {
  const mode = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();
  return resolveTheme(mode, systemScheme);
}
