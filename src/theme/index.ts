import { MD3LightTheme, MD3DarkTheme, configureFonts, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { DefaultTheme as NavLightTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import type { ColorSchemeName } from 'react-native';
import type { ThemeMode, ThemeName } from '@/types';

const paperlessGreen = '#17541f';
const paperlessGreenLight = '#2e7d32';

const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
};

const fonts = configureFonts({ config: fontConfig });

export interface StatusColors {
  success: string;
  warning: string;
  info: string;
  error: string;
  neutral: string;
}

export type PaperlessTheme = MD3Theme & { statusColors: StatusColors };

const lightStatusColors = {
  success: '#2e7d32',
  warning: '#b26a00',
  info: '#1565c0',
  neutral: '#757575',
};
const darkStatusColors = {
  success: '#81c784',
  warning: '#ffb74d',
  info: '#64b5f6',
  neutral: '#9e9e9e',
};

function makePaperTheme(base: MD3Theme, colors: Partial<MD3Theme['colors']>): PaperlessTheme {
  const mergedColors = { ...base.colors, ...colors };
  const statusSet = base.dark ? darkStatusColors : lightStatusColors;
  return {
    ...base,
    fonts,
    colors: mergedColors,
    statusColors: { ...statusSet, error: mergedColors.error },
  };
}

function makeNavTheme(
  base: NavigationTheme,
  colors: Partial<NavigationTheme['colors']>,
): NavigationTheme {
  return {
    ...base,
    colors: { ...base.colors, ...colors },
  };
}

export interface AppTheme {
  labelKey: string;
  paper: PaperlessTheme;
  navigation: NavigationTheme;
  swatches: { primary: string; secondary: string; background: string };
}

const bright: AppTheme = {
  labelKey: 'common.themeBright',
  paper: makePaperTheme(MD3LightTheme, {
    primary: paperlessGreen,
    primaryContainer: '#c8e6c9',
    secondary: '#4caf50',
    secondaryContainer: '#e8f5e9',
    tertiary: '#00796b',
    tertiaryContainer: '#b2dfdb',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    background: '#fafafa',
    error: '#d32f2f',
    errorContainer: '#ffcdd2',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#002204',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#1b5e20',
    onSurface: '#1c1b1f',
    onSurfaceVariant: '#49454f',
    onBackground: '#1c1b1f',
    onError: '#ffffff',
    outline: '#79747e',
    outlineVariant: '#e0e0e0',
    elevation: {
      level0: 'transparent',
      level1: '#f5f5f5',
      level2: '#eeeeee',
      level3: '#e0e0e0',
      level4: '#d6d6d6',
      level5: '#cccccc',
    },
  }),
  navigation: makeNavTheme(NavLightTheme, {
    primary: paperlessGreen,
    background: '#fafafa',
    card: '#ffffff',
    text: '#1c1b1f',
    border: '#e0e0e0',
  }),
  swatches: { primary: paperlessGreen, secondary: '#4caf50', background: '#fafafa' },
};

const dark: AppTheme = {
  labelKey: 'common.themeDark',
  paper: makePaperTheme(MD3DarkTheme, {
    primary: paperlessGreenLight,
    primaryContainer: '#1b5e20',
    secondary: '#81c784',
    secondaryContainer: '#2e7d32',
    tertiary: '#4db6ac',
    tertiaryContainer: '#00695c',
    surface: '#1c1b1f',
    surfaceVariant: '#2c2c2c',
    background: '#121212',
    error: '#ef5350',
    errorContainer: '#93000a',
    onPrimary: '#003910',
    onPrimaryContainer: '#c8e6c9',
    onSecondary: '#003910',
    onSecondaryContainer: '#c8e6c9',
    onSurface: '#e6e1e5',
    onSurfaceVariant: '#cac4d0',
    onBackground: '#e6e1e5',
    onError: '#690005',
    outline: '#938f99',
    outlineVariant: '#3c3c3c',
    elevation: {
      level0: 'transparent',
      level1: '#2c2c2c',
      level2: '#333333',
      level3: '#3c3c3c',
      level4: '#414141',
      level5: '#484848',
    },
  }),
  navigation: makeNavTheme(NavDarkTheme, {
    primary: paperlessGreenLight,
    background: '#121212',
    card: '#1c1b1f',
    text: '#e6e1e5',
    border: '#333333',
  }),
  swatches: { primary: paperlessGreenLight, secondary: '#81c784', background: '#121212' },
};

const red: AppTheme = {
  labelKey: 'common.themeRed',
  paper: makePaperTheme(MD3DarkTheme, {
    primary: '#f87171',
    onPrimary: '#450a0a',
    primaryContainer: '#7f1d1d',
    onPrimaryContainer: '#fee2e2',
    secondary: '#fb7185',
    onSecondary: '#4c0519',
    secondaryContainer: '#9f1239',
    onSecondaryContainer: '#ffe4e6',
    tertiary: '#fbbf24',
    onTertiary: '#451a03',
    tertiaryContainer: '#92400e',
    onTertiaryContainer: '#fef3c7',
    surface: '#1f1717',
    onSurface: '#f0e4e4',
    surfaceVariant: '#332525',
    onSurfaceVariant: '#d9c7c7',
    background: '#150f0f',
    onBackground: '#f0e4e4',
    error: '#f87171',
    errorContainer: '#7f1d1d',
    onError: '#450a0a',
    outline: '#a08a8a',
    outlineVariant: '#4a3535',
    elevation: {
      level0: 'transparent',
      level1: '#241a1a',
      level2: '#291d1d',
      level3: '#2e2121',
      level4: '#312323',
      level5: '#362727',
    },
  }),
  navigation: makeNavTheme(NavDarkTheme, {
    primary: '#f87171',
    background: '#150f0f',
    card: '#1f1717',
    text: '#f0e4e4',
    border: '#3a2a2a',
  }),
  swatches: { primary: '#f87171', secondary: '#fb7185', background: '#150f0f' },
};

const blue: AppTheme = {
  labelKey: 'common.themeBlue',
  paper: makePaperTheme(MD3DarkTheme, {
    primary: '#60a5fa',
    onPrimary: '#08214a',
    primaryContainer: '#1e3a8a',
    onPrimaryContainer: '#dbeafe',
    secondary: '#38bdf8',
    onSecondary: '#052f4a',
    secondaryContainer: '#075985',
    onSecondaryContainer: '#e0f2fe',
    tertiary: '#818cf8',
    onTertiary: '#1e1b4b',
    tertiaryContainer: '#3730a3',
    onTertiaryContainer: '#e0e7ff',
    surface: '#161b26',
    onSurface: '#e3e8f0',
    surfaceVariant: '#232a38',
    onSurfaceVariant: '#c3cbd9',
    background: '#0d1017',
    onBackground: '#e3e8f0',
    error: '#f87171',
    errorContainer: '#7f1d1d',
    onError: '#450a0a',
    outline: '#8b95a8',
    outlineVariant: '#333b4d',
    elevation: {
      level0: 'transparent',
      level1: '#1a2030',
      level2: '#1e2537',
      level3: '#22293d',
      level4: '#252d42',
      level5: '#293148',
    },
  }),
  navigation: makeNavTheme(NavDarkTheme, {
    primary: '#60a5fa',
    background: '#0d1017',
    card: '#161b26',
    text: '#e3e8f0',
    border: '#2a3140',
  }),
  swatches: { primary: '#60a5fa', secondary: '#38bdf8', background: '#0d1017' },
};

const modern: AppTheme = {
  labelKey: 'common.themeModern',
  paper: makePaperTheme(MD3DarkTheme, {
    primary: '#a78bfa',
    onPrimary: '#2e1065',
    primaryContainer: '#5b21b6',
    onPrimaryContainer: '#ede9fe',
    secondary: '#2dd4bf',
    onSecondary: '#053b34',
    secondaryContainer: '#0f766e',
    onSecondaryContainer: '#ccfbf1',
    tertiary: '#67e8f9',
    onTertiary: '#0e4f5c',
    tertiaryContainer: '#155e75',
    onTertiaryContainer: '#cffafe',
    surface: '#17151f',
    onSurface: '#e6e2f0',
    surfaceVariant: '#252233',
    onSurfaceVariant: '#c7c1d9',
    background: '#0f0e15',
    onBackground: '#e6e2f0',
    error: '#f87171',
    errorContainer: '#7f1d1d',
    onError: '#450a0a',
    outline: '#918aa8',
    outlineVariant: '#363047',
    elevation: {
      level0: 'transparent',
      level1: '#1c1927',
      level2: '#211d2e',
      level3: '#262136',
      level4: '#29233a',
      level5: '#2e2740',
    },
  }),
  navigation: makeNavTheme(NavDarkTheme, {
    primary: '#a78bfa',
    background: '#0f0e15',
    card: '#17151f',
    text: '#e6e2f0',
    border: '#2b2638',
  }),
  swatches: { primary: '#a78bfa', secondary: '#2dd4bf', background: '#0f0e15' },
};

export const themes: Record<ThemeName, AppTheme> = { bright, dark, red, blue, modern };
export const themeOrder: readonly ThemeName[] = ['bright', 'dark', 'red', 'blue', 'modern'];

export function resolveTheme(mode: ThemeMode, systemScheme: ColorSchemeName): AppTheme {
  if (mode === 'auto') return systemScheme === 'dark' ? themes.dark : themes.bright;
  return themes[mode];
}

export const usePaperTheme = () => useTheme<PaperlessTheme>();

export { useAppTheme } from './useAppTheme';
