import { t } from 'i18next';
import {
  AnalyticsAggregation,
  AnalyticsDataDocument,
  AnalyticsDataSource,
  AnalyticsDateBucket,
  AnalyticsDimension,
  AnalyticsFilter,
  AnalyticsWidgetConfig,
} from './types';

const HIGH_CARDINALITY_LIMIT = 12;

export const NONE_KEY = -1;

export function defaultFilter(): AnalyticsFilter {
  return { timeRange: 'all' };
}

function toDateSafe(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function bucketDate(date: Date, bucket: AnalyticsDateBucket): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');

  if (bucket === 'day') return `${year}-${month}-${day}`;
  if (bucket === 'month') return `${year}-${month}`;
  if (bucket === 'quarter') return `${year}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
  if (bucket === 'year') return `${year}`;

  const jan1 = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - jan1.getTime()) / 86400000) + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function rangeBounds(filter: AnalyticsFilter): { start?: number; end?: number } {
  const now = Date.now();
  const nowDate = new Date(now);
  const currentYear = nowDate.getUTCFullYear();

  const quarterRange = (quarter: 1 | 2 | 3 | 4) => {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    return {
      start: Date.UTC(currentYear, startMonth, 1),
      end: Date.UTC(currentYear, endMonth + 1, 0, 23, 59, 59, 999),
    };
  };

  if (filter.timeRange === 'all') return {};
  if (filter.timeRange === 'last30d') return { start: now - 30 * 86400000, end: now };
  if (filter.timeRange === 'last90d') return { start: now - 90 * 86400000, end: now };
  if (filter.timeRange === 'last365d') return { start: now - 365 * 86400000, end: now };
  if (filter.timeRange === 'thisYear') {
    return {
      start: Date.UTC(currentYear, 0, 1),
      end: Date.UTC(currentYear, 11, 31, 23, 59, 59, 999),
    };
  }
  if (filter.timeRange === 'thisYearQ1') return quarterRange(1);
  if (filter.timeRange === 'thisYearQ2') return quarterRange(2);
  if (filter.timeRange === 'thisYearQ3') return quarterRange(3);
  if (filter.timeRange === 'thisYearQ4') return quarterRange(4);

  const start = filter.startDate ? toDateSafe(filter.startDate)?.getTime() : undefined;
  const end = filter.endDate ? toDateSafe(filter.endDate)?.getTime() : undefined;
  return { start, end };
}

export function applyFilters(
  documents: AnalyticsDataDocument[],
  filter: AnalyticsFilter,
): AnalyticsDataDocument[] {
  const { start, end } = rangeBounds(filter);
  return documents.filter((doc) => {
    const date = toDateSafe(doc.date);
    if (date) {
      const time = date.getTime();
      if (start !== undefined && time < start) return false;
      if (end !== undefined && time > end) return false;
    } else if (start !== undefined || end !== undefined) {
      return false;
    }

    if (
      filter.correspondentIds?.length &&
      !filter.correspondentIds.includes(doc.correspondentId ?? NONE_KEY)
    ) {
      return false;
    }

    if (
      filter.documentTypeIds?.length &&
      !filter.documentTypeIds.includes(doc.documentTypeId ?? NONE_KEY)
    ) {
      return false;
    }

    if (filter.tagIds?.length && !filter.tagIds.some((tagId) => doc.tagIds.includes(tagId))) {
      return false;
    }

    return true;
  });
}

export function aggregate(values: number[], aggregation: AnalyticsAggregation): number {
  if (!values.length) return 0;
  if (aggregation === 'count') return values.length;
  if (aggregation === 'sum') return values.reduce((sum, value) => sum + value, 0);
  if (aggregation === 'avg') return values.reduce((sum, value) => sum + value, 0) / values.length;
  if (aggregation === 'min') return Math.min(...values);
  if (aggregation === 'max') return Math.max(...values);
  return 0;
}

export function labelForDimensionValue(
  dimension: AnalyticsDimension,
  value: number | string,
  source: AnalyticsDataSource,
): string {
  if (dimension === 'correspondent') {
    if (Number(value) === NONE_KEY) return t('documents.noCorrespondent');
    return (
      source.correspondentsMap.get(Number(value))?.name ?? t('analytics.unknown.correspondent')
    );
  }
  if (dimension === 'documentType') {
    if (Number(value) === NONE_KEY) return t('documents.noDocumentType');
    return source.docTypesMap.get(Number(value))?.name ?? t('analytics.unknown.documentType');
  }
  if (dimension === 'tag') {
    if (Number(value) === NONE_KEY) return t('documents.noTags');
    return source.tagsMap.get(Number(value))?.name ?? t('analytics.unknown.tag');
  }
  if (dimension === 'dateQuarter' || dimension === 'dateMonth' || dimension === 'dateYear') {
    return String(value);
  }
  return String(value);
}

export function groupKeyForDocument(
  doc: AnalyticsDataDocument,
  dimension: AnalyticsDimension,
  customFieldId?: number,
): (number | string)[] {
  if (dimension === 'correspondent') return [doc.correspondentId ?? NONE_KEY];
  if (dimension === 'documentType') return [doc.documentTypeId ?? NONE_KEY];
  if (dimension === 'tag') return doc.tagIds.length ? doc.tagIds : [NONE_KEY];
  if (dimension === 'dateQuarter') return [bucketLabel(doc.date, 'quarter')];
  if (dimension === 'dateMonth') return [bucketLabel(doc.date, 'month')];
  if (dimension === 'dateYear') return [bucketLabel(doc.date, 'year')];
  if (dimension === 'customField') {
    if (!customFieldId) return ['unknown'];
    return [doc.customFieldStrings[customFieldId] ?? 'unknown'];
  }
  return [doc.date ?? 'unknown'];
}

export function bucketLabel(date: string | undefined, bucket: AnalyticsDateBucket): string {
  const parsed = toDateSafe(date);
  if (!parsed) return 'unknown';
  return bucketDate(parsed, bucket);
}

export function topNWithOther<T extends { value: number; label: string; key: string }>(
  items: T[],
): T[] {
  if (items.length <= HIGH_CARDINALITY_LIMIT) return items;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, HIGH_CARDINALITY_LIMIT - 1);
  const otherValue = sorted
    .slice(HIGH_CARDINALITY_LIMIT - 1)
    .reduce((sum, item) => sum + item.value, 0);
  return [...top, { key: 'other', label: t('analytics.other'), value: otherValue } as T];
}

export function filtersSummary(config: AnalyticsWidgetConfig): string {
  const ranges =
    config.type === 'infoTile'
      ? config.metrics.map((metric) => metric.filters.timeRange)
      : [config.filters.timeRange];

  return Array.from(new Set(ranges))
    .map((range) => t(`analytics.timeRange.${range}`))
    .join(' · ');
}
