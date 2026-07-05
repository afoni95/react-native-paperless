import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAnalyticsSource } from '@/features/analytics/useAnalyticsSource';
import { analyticsWidgetRegistry } from '@/features/analytics/registry';
import { useAnalyticsDashboardStore } from '@/store/analyticsDashboardStore';
import { updateNativeWidget } from './nativeBridge';

export function WidgetSnapshotBootstrap() {
  const queryClient = useQueryClient();
  const { widgets, isHydrated, hydrate } = useAnalyticsDashboardStore();
  const analyticsSource = useAnalyticsSource();

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    queryClient.setQueryData(['analyticsWidgets'], widgets);
    queryClient.setQueryData(['analyticsDataSource'], analyticsSource);
  }, [analyticsSource, isHydrated, queryClient, widgets]);

  const widgetEntries = useMemo(() => Object.values(widgets), [widgets]);

  useEffect(() => {
    if (!isHydrated || widgetEntries.length === 0) {
      return;
    }

    let cancelled = false;

    async function publishSnapshots() {
      for (const widget of widgetEntries) {
        if (cancelled) {
          return;
        }

        const definition = analyticsWidgetRegistry.get(widget.type);
        const validationErrors = definition.validate(widget.config as never, analyticsSource);
        const data = validationErrors.length
          ? null
          : definition.transform(widget.config as never, analyticsSource);

        await updateNativeWidget({
          widgetId: widget.id,
          data,
          error: validationErrors.length ? 'Analytics widget configuration is invalid' : undefined,
        });
      }
    }

    publishSnapshots().catch((error) => {
      console.error('Failed to publish analytics widget snapshots', error);
    });

    return () => {
      cancelled = true;
    };
  }, [analyticsSource, isHydrated, widgetEntries]);

  return null;
}
