import {
  AnalyticsInfoTileResult,
  AnalyticsInfoTileWidgetConfig,
  AnalyticsLineResult,
  AnalyticsLineWidgetConfig,
  AnalyticsPieResult,
  AnalyticsPieWidgetConfig,
  AnalyticsWidgetDefinition,
  AnalyticsWidgetType,
} from './types';
import {
  aggregate,
  applyFilters,
  bucketLabel,
  groupKeyForDocument,
  labelForDimensionValue,
  topNWithOther,
} from './utils';

function defaultFilter() {
  return { timeRange: 'last90d' as const };
}

const lineWidget: AnalyticsWidgetDefinition<AnalyticsLineWidgetConfig> = {
  type: 'line',
  titleKey: 'analytics.widget.line',
  createDefaultConfig: () => ({
    type: 'line',
    xDimension: 'date',
    dateBucket: 'month',
    metric: {
      mode: 'count',
      aggregation: 'count',
    },
    groupBy: 'correspondent',
    filters: defaultFilter(),
  }),
  validate: (config, source) => {
    const errors: string[] = [];
    if (config.metric.mode === 'customField' && !config.metric.customFieldId) {
      errors.push('analytics.validation.metricFieldRequired');
    }
    if (config.groupBy === 'customField' && !config.groupByCustomFieldId) {
      errors.push('analytics.validation.groupCustomFieldRequired');
    }
    if (config.metric.mode === 'customField' && config.metric.customFieldId) {
      const field = source.customFieldsMap.get(config.metric.customFieldId);
      if (!field || !['integer', 'float', 'monetary'].includes(field.data_type)) {
        errors.push('analytics.validation.numericFieldRequired');
      }
    }
    return errors;
  },
  transform: (config, source) => {
    const docs = applyFilters(source.documents, config.filters);
    const bySeries = new Map<string, Map<string, number[]>>();

    docs.forEach((doc) => {
      const x = bucketLabel(doc.date, config.dateBucket);
      const metricValue =
        config.metric.mode === 'count'
          ? 1
          : doc.numericCustomFields[config.metric.customFieldId ?? -1];
      if (metricValue === undefined || metricValue === null || Number.isNaN(metricValue)) return;

      const groupValues = groupKeyForDocument(doc, config.groupBy, config.groupByCustomFieldId);
      groupValues.forEach((groupValue) => {
        const groupKey = String(groupValue);
        if (!bySeries.has(groupKey)) bySeries.set(groupKey, new Map());
        const bucket = bySeries.get(groupKey)!;
        if (!bucket.has(x)) bucket.set(x, []);
        bucket.get(x)!.push(Number(metricValue));
      });
    });

    const orderedX = Array.from(
      new Set(Array.from(bySeries.values()).flatMap((bucketMap) => Array.from(bucketMap.keys()))),
    ).sort();

    const series: AnalyticsLineResult['series'] = Array.from(bySeries.entries()).map(
      ([key, values]) => ({
        key,
        label: labelForDimensionValue(config.groupBy, key, source),
        points: orderedX.map((x) => ({
          x,
          y: aggregate(values.get(x) ?? [], config.metric.aggregation),
        })),
      }),
    );

    return {
      kind: 'line',
      series,
    };
  },
};

const pieWidget: AnalyticsWidgetDefinition<AnalyticsPieWidgetConfig> = {
  type: 'pie',
  titleKey: 'analytics.widget.pie',
  createDefaultConfig: () => ({
    type: 'pie',
    dimension: 'tag',
    metric: {
      mode: 'count',
      aggregation: 'count',
    },
    filters: defaultFilter(),
  }),
  validate: (config, source) => {
    const errors: string[] = [];
    if (config.dimension === 'customField' && !config.dimensionCustomFieldId) {
      errors.push('analytics.validation.dimensionCustomFieldRequired');
    }
    if (config.metric.mode === 'customField' && !config.metric.customFieldId) {
      errors.push('analytics.validation.metricFieldRequired');
    }
    if (config.metric.mode === 'customField' && config.metric.customFieldId) {
      const field = source.customFieldsMap.get(config.metric.customFieldId);
      if (!field || !['integer', 'float', 'monetary'].includes(field.data_type)) {
        errors.push('analytics.validation.numericFieldRequired');
      }
    }
    return errors;
  },
  transform: (config, source) => {
    const docs = applyFilters(source.documents, config.filters);
    const buckets = new Map<string, number[]>();

    docs.forEach((doc) => {
      const metricValue =
        config.metric.mode === 'count'
          ? 1
          : doc.numericCustomFields[config.metric.customFieldId ?? -1];
      if (metricValue === undefined || metricValue === null || Number.isNaN(metricValue)) return;

      const groupValues = groupKeyForDocument(doc, config.dimension, config.dimensionCustomFieldId);
      groupValues.forEach((groupValue) => {
        const key = String(groupValue);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key)!.push(Number(metricValue));
      });
    });

    const slices = Array.from(buckets.entries()).map(([key, values]) => ({
      key,
      label: labelForDimensionValue(config.dimension, key, source),
      value: aggregate(values, config.metric.aggregation),
    }));

    return {
      kind: 'pie',
      slices: topNWithOther(slices),
    } as AnalyticsPieResult;
  },
};

const infoTileWidget: AnalyticsWidgetDefinition<AnalyticsInfoTileWidgetConfig> = {
  type: 'infoTile',
  titleKey: 'analytics.widget.infoTile',
  createDefaultConfig: () => ({
    type: 'infoTile',
    metrics: [
      {
        id: 'metric-1',
        label: 'KPI 1',
        metric: {
          mode: 'count',
          aggregation: 'count',
        },
        filters: defaultFilter(),
      },
    ],
  }),
  validate: (config) => {
    const errors: string[] = [];
    if (config.metrics.length === 0 || config.metrics.length > 4) {
      errors.push('analytics.validation.infoTileMetricRange');
    }
    return errors;
  },
  transform: (config, source) => {
    const values: AnalyticsInfoTileResult['values'] = config.metrics.map((metric) => {
      const docs = applyFilters(source.documents, metric.filters);
      const candidates = docs
        .map((doc) => {
          if (metric.metric.mode === 'count') return 1;
          return doc.numericCustomFields[metric.metric.customFieldId ?? -1];
        })
        .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));

      return {
        id: metric.id,
        label: metric.label,
        value: aggregate(candidates, metric.metric.aggregation),
      };
    });

    return {
      kind: 'infoTile',
      values,
    };
  },
};

const definitions: {
  line: AnalyticsWidgetDefinition<AnalyticsLineWidgetConfig>;
  pie: AnalyticsWidgetDefinition<AnalyticsPieWidgetConfig>;
  infoTile: AnalyticsWidgetDefinition<AnalyticsInfoTileWidgetConfig>;
} = {
  line: lineWidget,
  pie: pieWidget,
  infoTile: infoTileWidget,
};

export const analyticsWidgetRegistry = {
  get: <T extends AnalyticsWidgetType>(type: T) => definitions[type],
  all: () => Object.values(definitions),
};
