/**
 * React Query hooks for widget data fetching and synchronization
 * Reuses analytics aggregation engine
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useWidgetStore } from '@/widgets/store';
import { syncWidget, syncAllWidgets, shouldSync, createSyncScheduler } from '@/widgets/sync';
import { isWidgetDataStale } from '@/widgets/api';
import { useAnalyticsSource } from '@/features/analytics/useAnalyticsSource';
import type { AnalyticsWidget } from '@/features/analytics/types';
import { analyticsWidgetRegistry } from '@/features/analytics/registry';

/**
 * Hook to fetch and cache widget data
 * Automatically uses cached data if available and not stale
 */
export function useWidgetData(widget: AnalyticsWidget | null, enabled = true) {
  const store = useWidgetStore();
  const analyticsSource = useAnalyticsSource();

  return useQuery({
    queryKey: ['widget', widget?.id],
    enabled: enabled && !!widget && !!analyticsSource,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    queryFn: async () => {
      if (!widget || !analyticsSource) {
        return null;
      }

      try {
        // Use cached data if available
        const cached = store.getCachedData(widget.id);
        if (cached && !isWidgetDataStale(cached.timestamp)) {
          return cached.data;
        }

        // Fetch fresh data
        const definition = analyticsWidgetRegistry.get(widget.type);
        const validationErrors = definition.validate(widget.config as never, analyticsSource);
        const data = validationErrors.length
          ? null
          : definition.transform(widget.config as never, analyticsSource);

        // Update cache
        store.setCachedData({
          widgetId: widget.id,
          data,
          timestamp: Date.now(),
          isCached: false,
        });

        return data;
      } catch (error) {
        console.error('Error fetching widget data:', error);
        throw error;
      }
    },
  });
}

/**
 * Hook to sync a single widget
 */
export function useSyncWidget() {
  const queryClient = useQueryClient();
  const store = useWidgetStore();

  return useMutation({
    mutationFn: async (widgetId: string) => {
      const widget = store.widgets[widgetId];
      if (!widget) {
        throw new Error(`Widget ${widgetId} not found`);
      }

      const analyticsWidgets = queryClient.getQueryData<Record<string, AnalyticsWidget>>([
        'analyticsWidgets',
      ]);
      const analyticsWidget = analyticsWidgets?.[widget.analyticsWidgetId];

      if (!analyticsWidget) {
        throw new Error(`Analytics widget ${widget.analyticsWidgetId} not found`);
      }

      const success = await syncWidget(widgetId, analyticsWidget, queryClient);
      if (!success) {
        throw new Error(`Failed to sync widget ${widgetId}`);
      }
    },
    onSuccess: () => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['widget'] });
    },
  });
}

/**
 * Hook to sync all widgets
 */
export function useSyncAllWidgets() {
  const queryClient = useQueryClient();
  const store = useWidgetStore();

  return useMutation({
    mutationFn: async () => {
      const analyticsWidgets = queryClient.getQueryData<Record<string, AnalyticsWidget>>([
        'analyticsWidgets',
      ]);

      if (!analyticsWidgets) {
        throw new Error('Analytics widgets not loaded');
      }

      const result = await syncAllWidgets({
        queryClient,
        widgets: analyticsWidgets,
      });

      return result;
    },
    onSuccess: () => {
      // Invalidate widget queries
      queryClient.invalidateQueries({ queryKey: ['widget'] });
    },
  });
}

/**
 * Hook to add a new widget to home screen
 */
export function useAddWidget() {
  const store = useWidgetStore();

  return useCallback(
    (widget: any) => {
      store.addWidget(widget);
    },
    [store],
  );
}

/**
 * Hook to remove a widget from home screen
 */
export function useRemoveWidget() {
  const store = useWidgetStore();

  return useCallback(
    (widgetId: string) => {
      store.removeWidget(widgetId);
    },
    [store],
  );
}

/**
 * Hook to get all home screen widgets
 */
export function useHomeScreenWidgets() {
  const store = useWidgetStore();

  return {
    widgets: store.widgets,
    widgetOrder: store.widgetOrder,
    loading: false, // Data is loaded from AsyncStorage immediately
  };
}

/**
 * Hook to get widget sync status
 */
export function useWidgetSyncStatus() {
  const store = useWidgetStore();

  return {
    status: store.globalSyncStatus,
    error: store.globalSyncError,
    lastSyncAt: store.lastGlobalSyncAt,
  };
}

/**
 * Hook to update widget sync configuration
 */
export function useWidgetSyncConfig() {
  const store = useWidgetStore();

  return {
    config: store.syncConfig,
    updateConfig: (updates: Partial<typeof store.syncConfig>) => {
      store.updateSyncConfig(updates);
    },
  };
}

/**
 * Hook to initialize background sync scheduler
 * Should be called once in the app initialization
 */
export function useWidgetSyncScheduler(enabled = true) {
  const queryClient = useQueryClient();
  const store = useWidgetStore();

  return useQuery({
    queryKey: ['widgetSyncScheduler'],
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: () => {
      const analyticsWidgets = queryClient.getQueryData<Record<string, AnalyticsWidget>>([
        'analyticsWidgets',
      ]);

      if (!analyticsWidgets) {
        return null;
      }

      const scheduler = createSyncScheduler({
        queryClient,
        widgets: analyticsWidgets,
        intervalMs: store.syncConfig.intervalMinutes * 60 * 1000,
      });

      // Start scheduler
      scheduler.start();

      // Return cleanup function
      return scheduler;
    },
  });
}
