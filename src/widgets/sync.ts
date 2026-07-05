/**
 * Widget data synchronization logic
 * Manages background sync, error handling, and retry logic
 */

import type { QueryClient } from '@tanstack/react-query';
import { useWidgetStore } from './store';
import { fetchWidgetData, isWidgetDataStale, formatWidgetError } from './api';
import type { AnalyticsWidget } from '@/features/analytics/types';

export interface SyncOptions {
  queryClient: QueryClient;
  widgets: Record<string, AnalyticsWidget> | (() => Record<string, AnalyticsWidget>);
  force?: boolean;
  onProgress?: (widgetId: string, status: 'syncing' | 'done' | 'error') => void;
}

/**
 * Sync a single widget's data
 */
export async function syncWidget(
  widgetId: string,
  analyticsWidget: AnalyticsWidget,
  queryClient: QueryClient,
  onProgress?: (status: 'syncing' | 'done' | 'error') => void,
): Promise<boolean> {
  const store = useWidgetStore.getState();

  try {
    onProgress?.('syncing');
    store.setWidgetSyncStatus(widgetId, 'syncing');

    // Fetch fresh data
    const data = await fetchWidgetData(analyticsWidget, queryClient);

    // Update cache
    store.setCachedData({
      widgetId,
      data,
      timestamp: Date.now(),
      isCached: false,
    });

    store.setWidgetSyncStatus(widgetId, 'idle');
    onProgress?.('done');

    return true;
  } catch (error) {
    const errorMessage = formatWidgetError(error);
    store.setWidgetSyncStatus(widgetId, 'error', errorMessage);
    onProgress?.('error');

    return false;
  }
}

/**
 * Sync all widgets with error handling and retry logic
 */
export async function syncAllWidgets(
  options: SyncOptions,
): Promise<{ success: number; failed: number }> {
  const store = useWidgetStore.getState();
  const { queryClient, widgets: widgetsInput, force = false, onProgress } = options;
  const widgets = typeof widgetsInput === 'function' ? widgetsInput() : widgetsInput;

  const widgetIds = Object.keys(store.widgets);

  if (widgetIds.length === 0) {
    return { success: 0, failed: 0 };
  }

  store.setSyncStatus('syncing');

  let successCount = 0;
  let failedCount = 0;

  for (const widgetId of widgetIds) {
    const widget = store.widgets[widgetId];
    if (!widget) continue;

    const analyticsWidget = widgets[widget.analyticsWidgetId];
    if (!analyticsWidget) {
      store.setWidgetSyncStatus(widgetId, 'error', 'Analytics widget configuration not found');
      failedCount++;
      continue;
    }

    // Skip sync if data is fresh and not forced
    if (!force && widget.lastSyncAt && !isWidgetDataStale(widget.lastSyncAt)) {
      successCount++;
      continue;
    }

    onProgress?.(widgetId, 'syncing');

    const success = await syncWidget(widgetId, analyticsWidget, queryClient, (status) => {
      if (status === 'done') {
        successCount++;
      } else if (status === 'error') {
        failedCount++;
      }
    });

    if (!success) {
      failedCount++;
    }
  }

  // Update global sync status
  const hasErrors = failedCount > 0;
  store.setSyncStatus(hasErrors ? 'error' : 'idle');
  store.setLastSyncTime(Date.now());

  return { success: successCount, failed: failedCount };
}

/**
 * Check if sync is needed based on configuration and time elapsed
 */
export function shouldSync(
  config: ReturnType<typeof useWidgetStore.getState>['syncConfig'],
): boolean {
  if (!config.enabled) return false;

  const { lastSyncAt, intervalMinutes } = config;
  if (!lastSyncAt) return true;

  const elapsedMinutes = (Date.now() - lastSyncAt) / (1000 * 60);
  return elapsedMinutes >= intervalMinutes;
}

/**
 * Create a sync job that respects rate limiting
 */
export function createSyncScheduler(options: Omit<SyncOptions, 'force'> & { intervalMs?: number }) {
  const { queryClient, widgets, intervalMs = 30 * 60 * 1000 } = options; // Default 30 min
  let syncTimeout: ReturnType<typeof setTimeout> | null = null;
  let isSyncing = false;

  const performSync = async (force = false) => {
    if (isSyncing) return;

    isSyncing = true;
    try {
      await syncAllWidgets({
        queryClient,
        widgets,
        force,
      });
    } finally {
      isSyncing = false;
    }

    // Schedule next sync
    syncTimeout = setTimeout(() => performSync(), intervalMs);
  };

  const start = () => {
    console.log('[WidgetSync] Starting sync scheduler');
    performSync();
  };

  const stop = () => {
    console.log('[WidgetSync] Stopping sync scheduler');
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      syncTimeout = null;
    }
  };

  const forceSync = () => {
    console.log('[WidgetSync] Force syncing widgets');
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      syncTimeout = null;
    }
    return performSync(true);
  };

  return {
    start,
    stop,
    forceSync,
  };
}
