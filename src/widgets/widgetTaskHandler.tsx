import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { AnalyticsWidgetView } from './AnalyticsWidgetView';
import { loadWidgetSnapshot } from './widgetStorage';

async function renderFromSnapshot(props: WidgetTaskHandlerProps) {
  const snapshot = await loadWidgetSnapshot();
  props.renderWidget(
    <AnalyticsWidgetView
      data={snapshot?.data ?? null}
      error={snapshot?.error}
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
      // No per-widget persisted state yet.
      break;

    default:
      break;
  }
}
