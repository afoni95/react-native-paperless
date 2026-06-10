/**
 * API layer for fetching and transforming widget analytics data
 * Uses analytics aggregation engine and caches results
 */

import type { AnalyticsWidget, AnalyticsWidgetResult } from '@/features/analytics/types';
import type { QueryClient } from '@tanstack/react-query';
import { analyticsWidgetRegistry } from '@/features/analytics/registry';
import type { AnalyticsDataSource } from '@/features/analytics/types';

/**
 * Fetch widget data for a given analytics widget configuration
 * Uses React Query client cache for efficiency
 */
export async function fetchWidgetData(
  widget: AnalyticsWidget,
  queryClient: QueryClient
): Promise<AnalyticsWidgetResult | null> {
  try {
    // Build analytics source from cached queries.
    const analyticsData = queryClient.getQueryData<AnalyticsDataSource>(['analyticsDataSource']);

    if (!analyticsData) {
      console.warn('Analytics data not available for widget:', widget.id);
      return null;
    }

    const definition = analyticsWidgetRegistry.get(widget.type);
    const validationErrors = definition.validate(widget.config as never, analyticsData);
    if (validationErrors.length > 0) {
      return null;
    }

    const result = definition.transform(widget.config as never, analyticsData);

    return result;
  } catch (error) {
    console.error('Error fetching widget data:', error);
    throw error;
  }
}

/**
 * Check if widget data is stale based on timestamp
 * Data older than 15 minutes is considered stale
 */
export function isWidgetDataStale(lastSyncAt?: number, staleTimeMs: number = 15 * 60 * 1000): boolean {
  if (!lastSyncAt) return true;

  const age = Date.now() - lastSyncAt;
  return age > staleTimeMs;
}

/**
 * Format widget error message for display
 */
export function formatWidgetError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Failed to load widget data';
}

/**
 * Validate that a widget configuration is still valid
 * (e.g., referenced custom fields still exist)
 */
export function validateWidgetConfig(
  widget: AnalyticsWidget,
  customFieldIds: Set<number>
): { valid: boolean; error?: string } {
  const config = widget.config;

  // Check custom field references for info tiles
  if (config.type === 'infoTile') {
    for (const metric of config.metrics) {
      if (
        metric.metric.mode === 'customField' &&
        metric.metric.customFieldId &&
        !customFieldIds.has(metric.metric.customFieldId)
      ) {
        return {
          valid: false,
          error: `Custom field for metric "${metric.label}" no longer exists`,
        };
      }
    }
  }

  // Check custom field references for line charts
  if (config.type === 'line') {
    if (
      config.metric.mode === 'customField' &&
      config.metric.customFieldId &&
      !customFieldIds.has(config.metric.customFieldId)
    ) {
      return {
        valid: false,
        error: 'Custom field for metric no longer exists',
      };
    }
    if (
      config.groupBy === 'customField' &&
      config.groupByCustomFieldId &&
      !customFieldIds.has(config.groupByCustomFieldId)
    ) {
      return {
        valid: false,
        error: 'Custom field for grouping no longer exists',
      };
    }
  }

  // Check custom field references for pie charts
  if (config.type === 'pie') {
    if (
      config.metric.mode === 'customField' &&
      config.metric.customFieldId &&
      !customFieldIds.has(config.metric.customFieldId)
    ) {
      return {
        valid: false,
        error: 'Custom field for metric no longer exists',
      };
    }
    if (
      config.dimension === 'customField' &&
      config.dimensionCustomFieldId &&
      !customFieldIds.has(config.dimensionCustomFieldId)
    ) {
      return {
        valid: false,
        error: 'Custom field for dimension no longer exists',
      };
    }
  }

  return { valid: true };
}
