import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalyticsWidgetResult } from '@/features/analytics/types';
import type { AnalyticsWidgetType } from '@/features/analytics/types';

const STORAGE_KEY = 'android_widget_snapshot_v1';
const CONFIG_STORAGE_KEY = 'android_widget_config_v1';

export interface WidgetSnapshot {
  data: AnalyticsWidgetResult | null;
  error?: string;
  updatedAt: number;
}

export interface WidgetConfiguration {
  analyticsWidgetId: string;
  title: string;
  type: AnalyticsWidgetType;
  configuredAt: number;
}

type WidgetConfigurationMap = Record<string, WidgetConfiguration>;

function toWidgetKey(widgetId: number): string {
  return widgetId.toString();
}

async function loadWidgetConfigMap(): Promise<WidgetConfigurationMap> {
  const raw = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as WidgetConfigurationMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export async function saveWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export async function loadWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WidgetSnapshot;
  } catch {
    return null;
  }
}

export async function clearWidgetSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function saveWidgetConfiguration(
  widgetId: number,
  config: WidgetConfiguration,
): Promise<void> {
  const map = await loadWidgetConfigMap();
  map[toWidgetKey(widgetId)] = config;
  await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(map));
}

export async function loadWidgetConfiguration(widgetId: number): Promise<WidgetConfiguration | null> {
  const map = await loadWidgetConfigMap();
  return map[toWidgetKey(widgetId)] ?? null;
}

export async function removeWidgetConfiguration(widgetId: number): Promise<void> {
  const map = await loadWidgetConfigMap();
  delete map[toWidgetKey(widgetId)];
  await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(map));
}
