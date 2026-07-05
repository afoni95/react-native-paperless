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

type WidgetSnapshotMap = Record<string, WidgetSnapshot>;
type WidgetConfigurationMap = Record<string, WidgetConfiguration>;

function toWidgetKey(widgetId: number): string {
  return widgetId.toString();
}

function isWidgetSnapshot(value: unknown): value is WidgetSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<WidgetSnapshot>;
  return typeof candidate.updatedAt === 'number' && 'data' in candidate;
}

function parseWidgetSnapshotMap(raw: string): WidgetSnapshotMap {
  try {
    const parsed = JSON.parse(raw) as WidgetSnapshotMap | WidgetSnapshot;

    if (isWidgetSnapshot(parsed)) {
      return { default: parsed };
    }

    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return Object.entries(parsed).reduce<WidgetSnapshotMap>((accumulator, [key, value]) => {
      if (isWidgetSnapshot(value)) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
  } catch {
    return {};
  }
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

export async function saveWidgetSnapshot(
  widgetKey: string,
  snapshot: WidgetSnapshot,
): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const snapshots = raw ? parseWidgetSnapshotMap(raw) : {};
  snapshots[widgetKey] = snapshot;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}

export async function loadWidgetSnapshot(widgetKey?: string): Promise<WidgetSnapshot | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const snapshots = parseWidgetSnapshotMap(raw);
  if (widgetKey && snapshots[widgetKey]) {
    return snapshots[widgetKey];
  }

  if (snapshots.default) {
    return snapshots.default;
  }

  const firstSnapshot = Object.values(snapshots)[0];
  if (firstSnapshot) {
    return firstSnapshot;
  }

  try {
    const parsed = JSON.parse(raw) as WidgetSnapshot;
    return isWidgetSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearWidgetSnapshot(widgetKey?: string): Promise<void> {
  if (!widgetKey) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  const snapshots = parseWidgetSnapshotMap(raw);
  delete snapshots[widgetKey];

  if (Object.keys(snapshots).length === 0) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}

export async function saveWidgetConfiguration(
  widgetId: number,
  config: WidgetConfiguration,
): Promise<void> {
  const map = await loadWidgetConfigMap();
  map[toWidgetKey(widgetId)] = config;
  await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(map));
}

export async function loadWidgetConfiguration(
  widgetId: number,
): Promise<WidgetConfiguration | null> {
  const map = await loadWidgetConfigMap();
  return map[toWidgetKey(widgetId)] ?? null;
}

export async function removeWidgetConfiguration(widgetId: number): Promise<void> {
  const map = await loadWidgetConfigMap();
  delete map[toWidgetKey(widgetId)];
  await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(map));
}
