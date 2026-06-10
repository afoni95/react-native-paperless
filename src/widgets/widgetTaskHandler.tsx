import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { AnalyticsWidgetView } from './AnalyticsWidgetView';
import {
  loadWidgetConfiguration,
  loadWidgetSnapshot,
  removeWidgetConfiguration,
} from './widgetStorage';

async function renderFromSnapshot(props: WidgetTaskHandlerProps) {
  const widgetId = props.widgetInfo?.widgetId;
  const config = widgetId ? await loadWidgetConfiguration(widgetId) : null;

  if (!config) {
    props.renderWidget(
      <AnalyticsWidgetView
        data={null}
        error='Widget not configured. Long press and tap Configure to select an analytics widget.'
      />
    );
    return;
  }

  const snapshot = await loadWidgetSnapshot();
  const fallbackMessage = `Configured: ${config.title}. Open app to sync data.`;

  props.renderWidget(
    <AnalyticsWidgetView
      data={snapshot?.data ?? null}
      error={snapshot?.error ?? (!snapshot?.data ? fallbackMessage : undefined)}
      updatedAt={snapshot?.updatedAt}
    />
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      await renderFromSnapshot(props);
      break;

    case 'WIDGET_CLICK':
      if (props.clickAction === 'REFRESH') {
        await renderFromSnapshot(props);
      }
      break;

    case 'WIDGET_DELETED':
      if (props.widgetInfo?.widgetId) {
        await removeWidgetConfiguration(props.widgetInfo.widgetId);
      }
      break;

    default:
      break;
  }
}
