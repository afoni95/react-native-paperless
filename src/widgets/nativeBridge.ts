/**
 * Bridge functions backed by react-native-android-widget.
 */

import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import type { WidgetUpdateMessage } from './types';
import { AnalyticsWidgetView } from './AnalyticsWidgetView';
import { clearWidgetSnapshot, loadWidgetSnapshot, saveWidgetSnapshot } from './widgetStorage';

const WIDGET_NAME = 'AnalyticsWidget';

/**
 * Check if widget support is available on the current platform
 */
export function isWidgetSupported(): boolean {
  return Platform.OS === 'android';
}

/**
 * Send widget data to native layer for rendering
 */
export async function updateNativeWidget(message: WidgetUpdateMessage): Promise<void> {
  if (!isWidgetSupported()) {
    return;
  }

  const snapshot = {
    data: message.data,
    error: message.error,
    updatedAt: Date.now(),
  };

  await saveWidgetSnapshot(snapshot);

  requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () =>
      React.createElement(AnalyticsWidgetView, {
        data: snapshot.data,
        error: snapshot.error,
        updatedAt: snapshot.updatedAt,
      }),
  });
}

/**
 * Notify native layer that a widget is being removed
 */
export async function removeNativeWidget(widgetId: string): Promise<void> {
  void widgetId;
  await clearWidgetSnapshot();
}

/**
 * Request widget provider to refresh a specific widget
 */
export async function requestWidgetRefresh(widgetId: string): Promise<void> {
  void widgetId;
  if (!isWidgetSupported()) {
    return;
  }

  const snapshot = await loadWidgetSnapshot();
  requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () =>
      React.createElement(AnalyticsWidgetView, {
        data: snapshot?.data ?? null,
        error: snapshot?.error,
        updatedAt: snapshot?.updatedAt,
      }),
  });
}

/**
 * Listen for widget-related events from native layer
 */
export function setupWidgetEventListener(
  callback: (event: {
    type: 'refresh' | 'remove' | 'click';
    widgetId: string;
    data?: any;
  }) => void
): () => void {
  void callback;
  return () => {};
}

/**
 * Get list of installed widgets from native layer
 */
export async function getInstalledWidgets(): Promise<string[]> {
  return [];
}

/**
 * Open widget configuration UI in native layer
 */
export async function openWidgetConfiguration(widgetId: string): Promise<void> {
  void widgetId;
}
