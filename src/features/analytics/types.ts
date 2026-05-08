import type { CustomField } from '@/types';

export const ANALYTICS_WIDGET_TYPES = {
  line: 'line',
  pie: 'pie',
  infoTile: 'infoTile',
} as const;

export type AnalyticsWidgetType = keyof typeof ANALYTICS_WIDGET_TYPES;

export const ANALYTICS_DIMENSIONS = {
  date: 'date',
  dateQuarter: 'dateQuarter',
  dateMonth: 'dateMonth',
  dateYear: 'dateYear',
  correspondent: 'correspondent',
  tag: 'tag',
  documentType: 'documentType',
  customField: 'customField',
} as const;

export type AnalyticsDimension = keyof typeof ANALYTICS_DIMENSIONS;

export const ANALYTICS_DATE_BUCKETS = {
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
} as const;

export type AnalyticsDateBucket = keyof typeof ANALYTICS_DATE_BUCKETS;

export const ANALYTICS_AGGREGATIONS = {
  count: 'count',
  sum: 'sum',
  avg: 'avg',
  min: 'min',
  max: 'max',
} as const;

export type AnalyticsAggregation = keyof typeof ANALYTICS_AGGREGATIONS;

export const ANALYTICS_TIME_RANGES = {
  all: 'all',
  last30d: 'last30d',
  last90d: 'last90d',
  last365d: 'last365d',
  thisYear: 'thisYear',
  thisYearQ1: 'thisYearQ1',
  thisYearQ2: 'thisYearQ2',
  thisYearQ3: 'thisYearQ3',
  thisYearQ4: 'thisYearQ4',
  custom: 'custom',
} as const;

export type AnalyticsTimeRange = keyof typeof ANALYTICS_TIME_RANGES;

export interface AnalyticsFilter {
  timeRange: AnalyticsTimeRange;
  startDate?: string;
  endDate?: string;
  correspondentIds?: number[];
  tagIds?: number[];
  documentTypeIds?: number[];
}

export interface AnalyticsMetric {
  mode: 'count' | 'customField';
  customFieldId?: number;
  aggregation: AnalyticsAggregation;
}

export interface AnalyticsLineWidgetConfig {
  type: 'line';
  xDimension: Extract<AnalyticsDimension, 'date'>;
  dateBucket: AnalyticsDateBucket;
  metric: AnalyticsMetric;
  groupBy: Extract<AnalyticsDimension, 'correspondent' | 'documentType' | 'tag' | 'customField'>;
  groupByCustomFieldId?: number;
  filters: AnalyticsFilter;
}

export interface AnalyticsPieWidgetConfig {
  type: 'pie';
  dimension: Extract<
    AnalyticsDimension,
    | 'correspondent'
    | 'documentType'
    | 'tag'
    | 'customField'
    | 'dateQuarter'
    | 'dateMonth'
    | 'dateYear'
  >;
  dimensionCustomFieldId?: number;
  metric: AnalyticsMetric;
  filters: AnalyticsFilter;
}

export interface AnalyticsInfoTileMetric {
  id: string;
  label: string;
  metric: AnalyticsMetric;
  filters: AnalyticsFilter;
}

export interface AnalyticsInfoTileWidgetConfig {
  type: 'infoTile';
  metrics: AnalyticsInfoTileMetric[];
}

export type AnalyticsWidgetConfig =
  | AnalyticsLineWidgetConfig
  | AnalyticsPieWidgetConfig
  | AnalyticsInfoTileWidgetConfig;

export interface AnalyticsWidgetBase {
  id: string;
  title: string;
  type: AnalyticsWidgetType;
  createdAt: number;
  updatedAt: number;
}

export interface AnalyticsWidget extends AnalyticsWidgetBase {
  config: AnalyticsWidgetConfig;
}

export interface AnalyticsDashboardStateShape {
  widgetOrder: string[];
  widgets: Record<string, AnalyticsWidget>;
}

export interface AnalyticsDataDocument {
  id: number;
  date: string;
  correspondentId: number | null;
  documentTypeId: number | null;
  tagIds: number[];
  numericCustomFields: Record<number, number>;
  customFieldStrings: Record<number, string>;
}

export interface AnalyticsDataSource {
  documents: AnalyticsDataDocument[];
  correspondentsMap: Map<number, { id: number; name: string }>;
  docTypesMap: Map<number, { id: number; name: string }>;
  tagsMap: Map<number, { id: number; name: string }>;
  customFieldsMap: Map<number, CustomField>;
  dataVersion: string;
}

export interface AnalyticsSeriesPoint {
  x: string;
  y: number;
}

export interface AnalyticsLineResult {
  kind: 'line';
  series: { key: string; label: string; points: AnalyticsSeriesPoint[] }[];
}

export interface AnalyticsPieResult {
  kind: 'pie';
  slices: { key: string; label: string; value: number }[];
}

export interface AnalyticsInfoTileResult {
  kind: 'infoTile';
  values: { id: string; label: string; value: number }[];
}

export type AnalyticsWidgetResult =
  | AnalyticsLineResult
  | AnalyticsPieResult
  | AnalyticsInfoTileResult;

export interface AnalyticsWidgetDefinition<
  TConfig extends AnalyticsWidgetConfig = AnalyticsWidgetConfig,
> {
  type: AnalyticsWidgetType;
  titleKey: string;
  createDefaultConfig: () => TConfig;
  validate: (config: TConfig, source: AnalyticsDataSource) => string[];
  transform: (config: TConfig, source: AnalyticsDataSource) => AnalyticsWidgetResult;
}
