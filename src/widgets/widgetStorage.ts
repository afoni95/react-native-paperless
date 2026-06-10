import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalyticsWidgetResult } from '@/features/analytics/types';

const STORAGE_KEY = 'android_widget_snapshot_v1';

export interface WidgetSnapshot {
  data: AnalyticsWidgetResult | null;
  error?: string;
  updatedAt: number;
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
