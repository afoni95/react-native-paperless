/**
 * Widget types and interfaces for Android home screen widgets
 * Extends analytics widget configuration with widget-specific metadata
 */

import type {
  AnalyticsWidget,
  AnalyticsWidgetConfig,
  AnalyticsWidgetType,
  AnalyticsWidgetResult,
} from '@/features/analytics/types';

export interface HomeScreenWidget {
  /** Unique widget ID (generated UUID) */
  id: string;
  /** Reference to the analytics widget config ID */
  analyticsWidgetId: string;
  /** Display name for the widget on home screen */
  title: string;
  /** Widget type (line, pie, infoTile) */
  type: AnalyticsWidgetType;
  /** Timestamp when widget was added */
  createdAt: number;
  /** Last time widget was updated */
  updatedAt: number;
  /** Last time data was synced from API */
  lastSyncAt?: number;
  /** Sync status for this widget */
  syncStatus: 'idle' | 'syncing' | 'error';
  /** Sync error message if applicable */
  syncError?: string;
}

export interface WidgetDataSnapshot {
  /** Widget ID this data is for */
  widgetId: string;
  /** Rendered widget data */
  data: AnalyticsWidgetResult | null;
  /** Timestamp of data */
  timestamp: number;
  /** Whether this is from cache or fresh API call */
  isCached: boolean;
}

export interface WidgetSyncConfig {
  /** Enable auto-sync */
  enabled: boolean;
  /** Sync interval in minutes (15, 30, 60, 240, etc.) */
  intervalMinutes: number;
  /** Last time auto-sync ran */
  lastSyncAt?: number;
  /** Sync on WiFi only */
  wifiOnly: boolean;
}

export interface WidgetStoreState {
  /** All home screen widgets */
  widgets: Record<string, HomeScreenWidget>;
  /** Order of widgets (for display) */
  widgetOrder: string[];
  /** Sync configuration */
  syncConfig: WidgetSyncConfig;
  /** Widget data cache */
  dataCache: Record<string, WidgetDataSnapshot>;
  /** Global sync status */
  globalSyncStatus: 'idle' | 'syncing' | 'error';
  /** Last global sync error */
  globalSyncError?: string;
  /** Last time global sync ran */
  lastGlobalSyncAt?: number;
}

/** Message passed from widget provider to app for sync */
export interface WidgetSyncMessage {
  widgetId: string;
  timestamp: number;
}

/** Message to send widget data to native layer */
export interface WidgetUpdateMessage {
  widgetId: string;
  data: AnalyticsWidgetResult | null;
  error?: string;
}
