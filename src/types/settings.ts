export const THEME_NAMES = ['bright', 'dark', 'red', 'blue', 'modern'] as const;
export type ThemeName = (typeof THEME_NAMES)[number];
export type ThemeMode = ThemeName | 'auto';
export type Language = 'en' | 'de';
