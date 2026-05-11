import { useMemo } from 'react';
import { analyticsWidgetRegistry } from './registry';
import type { AnalyticsDataSource, AnalyticsWidget } from './types';

export function useWidgetResult(widget: AnalyticsWidget, source: AnalyticsDataSource) {
  return useMemo(() => {
    const definition = analyticsWidgetRegistry.get(widget.type);
    const validationErrors = definition.validate(widget.config as never, source);
    if (validationErrors.length > 0) {
      return {
        result: null,
        validationErrors,
      };
    }

    return {
      result: definition.transform(widget.config as never, source),
      validationErrors: [] as string[],
    };
  }, [source, widget]);
}
