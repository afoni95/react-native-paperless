/**
 * Hook for managing widget lifecycle operations
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWidgetStore } from '@/widgets/store';
import {
  useSyncWidget,
  useSyncAllWidgets,
  useAddWidget,
  useRemoveWidget,
  useHomeScreenWidgets,
  useWidgetSyncStatus,
  useWidgetSyncConfig,
} from '@/reactQuery/widgetQueries';
import {
  updateNativeWidget,
  removeNativeWidget,
  requestWidgetRefresh,
} from '@/widgets/nativeBridge';
import { validateWidgetConfig } from '@/widgets/api';
import type { AnalyticsWidget } from '@/features/analytics/types';
import type { AnalyticsWidgetResult } from '@/features/analytics/types';
import type { HomeScreenWidget } from '@/widgets/types';
import { v4 as uuidv4 } from 'uuid';

export function useWidgetManagement() {
  const queryClient = useQueryClient();
  const store = useWidgetStore();
  const { widgets, widgetOrder } = useHomeScreenWidgets();
  const { status: syncStatus, error: syncError } = useWidgetSyncStatus();
  const { config: syncConfig, updateConfig: updateSyncConfig } = useWidgetSyncConfig();

  const syncWidgetMutation = useSyncWidget();
  const syncAllMutation = useSyncAllWidgets();
  const addWidget = useAddWidget();
  const removeWidgetMutation = useRemoveWidget();

  /**
   * Add a new widget to home screen
   */
  const addHomeScreenWidget = useCallback(
    async (analyticsWidget: AnalyticsWidget) => {
      try {
        // Validate widget config
        const customFields = new Map();
        const customFieldsData = queryClient.getQueryData(['customFields']);
        if (Array.isArray(customFieldsData)) {
          customFieldsData.forEach((field: any) => {
            customFields.set(field.id, field);
          });
        }

        const validation = validateWidgetConfig(analyticsWidget, new Set(customFields.keys()));
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Create home screen widget
        const homeWidget: HomeScreenWidget = {
          id: uuidv4(),
          analyticsWidgetId: analyticsWidget.id,
          title: analyticsWidget.title,
          type: analyticsWidget.type,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'idle',
        };

        // Add to store
        addWidget(homeWidget);

        // Sync data immediately
        const data = await queryClient.fetchQuery<AnalyticsWidgetResult | null>({
          queryKey: ['widget', analyticsWidget.id],
        });

        // Update native layer
        if (data) {
          await updateNativeWidget({
            widgetId: homeWidget.id,
            data,
          });
        }

        return homeWidget;
      } catch (error) {
        console.error('Error adding widget:', error);
        throw error;
      }
    },
    [queryClient, addWidget],
  );

  /**
   * Remove a widget from home screen
   */
  const removeHomeScreenWidget = useCallback(
    async (widgetId: string) => {
      try {
        // Remove from native layer
        await removeNativeWidget(widgetId);

        // Remove from store
        removeWidgetMutation(widgetId);
      } catch (error) {
        console.error('Error removing widget:', error);
        // Still remove from store even if native removal fails
        removeWidgetMutation(widgetId);
      }
    },
    [removeWidgetMutation],
  );

  /**
   * Sync a single widget
   */
  const syncSingleWidget = useCallback(
    async (widgetId: string) => {
      try {
        await syncWidgetMutation.mutateAsync(widgetId);

        // Update native layer with new data
        const cached = store.getCachedData(widgetId);
        if (cached?.data) {
          await updateNativeWidget({
            widgetId,
            data: cached.data,
          });
        }
      } catch (error) {
        console.error('Error syncing widget:', error);
        throw error;
      }
    },
    [syncWidgetMutation, store],
  );

  /**
   * Sync all widgets
   */
  const syncAllWidgets = useCallback(async () => {
    try {
      await syncAllMutation.mutateAsync();
    } catch (error) {
      console.error('Error syncing all widgets:', error);
      throw error;
    }
  }, [syncAllMutation]);

  /**
   * Refresh a widget (request native to update UI)
   */
  const refreshWidget = useCallback(async (widgetId: string) => {
    try {
      await requestWidgetRefresh(widgetId);
    } catch (error) {
      console.error('Error refreshing widget:', error);
    }
  }, []);

  /**
   * Update sync configuration
   */
  const updateSyncSettings = useCallback(
    (updates: Partial<typeof syncConfig>) => {
      updateSyncConfig(updates);
    },
    [updateSyncConfig],
  );

  return {
    // Widget management
    widgets,
    widgetOrder,
    addHomeScreenWidget,
    removeHomeScreenWidget,
    syncSingleWidget,
    syncAllWidgets,
    refreshWidget,

    // Sync configuration
    syncConfig,
    updateSyncSettings,
    syncStatus,
    syncError,

    // Widget details
    getWidget: (widgetId: string) => widgets[widgetId],
    getWidgetCachedData: (widgetId: string) => store.getCachedData(widgetId),

    // Loading states
    isSyncing: syncWidgetMutation.isPending || syncAllMutation.isPending,
  };
}
