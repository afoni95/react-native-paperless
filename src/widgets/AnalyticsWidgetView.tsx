import React from 'react';
import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import type { AnalyticsWidgetResult } from '@/features/analytics/types';
import {
  createLineChartSvg,
  createPieChartSvg,
  lineLegendColors,
  pieLegendColors,
} from './chartSvg';

interface AnalyticsWidgetViewProps {
  data: AnalyticsWidgetResult | null;
  error?: string;
  updatedAt?: number;
  showFetchWarning?: boolean;
}

function formatSummary(data: AnalyticsWidgetResult | null): string {
  if (!data) {
    return 'No data yet';
  }

  if (data.kind === 'infoTile') {
    const first = data.values[0];
    return first ? `${first.label}: ${first.value}` : 'No metrics configured';
  }

  if (data.kind === 'line') {
    const points = data.series.flatMap((s) => s.points);
    const total = points.reduce((acc, p) => acc + p.y, 0);
    return `Series: ${data.series.length} | Total: ${total}`;
  }

  const total = data.slices.reduce((acc, s) => acc + s.value, 0);
  return `Slices: ${data.slices.length} | Total: ${total}`;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  if (Number.isInteger(value)) {
    return `${value}`;
  }

  if (Math.abs(value) >= 1000) {
    return value.toFixed(0);
  }

  return value.toFixed(2);
}

function renderInfoTile(data: Extract<AnalyticsWidgetResult, { kind: 'infoTile' }>) {
  const values = data.values.slice(0, 4);
  const cardColors: `#${string}`[] = ['#eaf7f2', '#e9f2fb', '#fff5e9', '#f6eefc'];

  if (values.length === 0) {
    return (
      <TextWidget
        text="No metrics configured"
        style={{ fontSize: 12, color: '#6b7280' }}
        maxLines={2}
        truncate="END"
      />
    );
  }

  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'column' }}>
      {values.map((value, index) => (
        <FlexWidget
          key={value.id}
          style={{
            width: 'match_parent',
            marginBottom: index === values.length - 1 ? 0 : 5,
            backgroundColor: cardColors[index % cardColors.length],
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 6,
          }}
        >
          <TextWidget
            text={value.label}
            style={{ fontSize: 10, color: '#4b5563' }}
            maxLines={1}
            truncate="END"
          />
          <TextWidget
            text={formatNumber(value.value)}
            style={{ fontSize: 16, color: '#111827', fontWeight: 'bold' }}
            maxLines={1}
            truncate="END"
          />
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}

function renderLineChart(data: Extract<AnalyticsWidgetResult, { kind: 'line' }>) {
  const svg = createLineChartSvg(data);
  const colors = lineLegendColors(Math.min(data.series.length, 4));

  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'column' }}>
      {svg ? (
        <SvgWidget
          svg={svg}
          style={{ width: 'match_parent', height: 98, borderRadius: 8, backgroundColor: '#ffffff' }}
        />
      ) : (
        <TextWidget
          text={formatSummary(data)}
          style={{ fontSize: 12, color: '#374151' }}
          maxLines={2}
          truncate="END"
        />
      )}

      <FlexWidget style={{ width: 'match_parent', marginTop: 6, flexDirection: 'column' }}>
        {data.series.slice(0, 4).map((series, index) => (
          <FlexWidget
            key={series.key}
            style={{
              width: 'match_parent',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <FlexWidget
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginRight: 5,
                backgroundColor: colors[index],
              }}
            />
            <TextWidget
              text={series.label}
              style={{ fontSize: 10, color: '#4b5563' }}
              maxLines={1}
              truncate="END"
            />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}

function renderPieChart(data: Extract<AnalyticsWidgetResult, { kind: 'pie' }>) {
  const sortedSlices = [...data.slices].sort((a, b) => b.value - a.value);
  const legendSlices = sortedSlices.slice(0, 5);
  const total = sortedSlices.reduce((acc, slice) => acc + slice.value, 0);
  const colors = pieLegendColors(legendSlices.length);
  const svg = createPieChartSvg({ kind: 'pie', slices: sortedSlices });

  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'column' }}>
      {svg ? (
        <FlexWidget
          style={{ width: 'match_parent', justifyContent: 'center', alignItems: 'center' }}
        >
          <SvgWidget svg={svg} style={{ width: 120, height: 110, marginBottom: 2 }} />
        </FlexWidget>
      ) : (
        <TextWidget
          text={formatSummary(data)}
          style={{ fontSize: 12, color: '#374151' }}
          maxLines={2}
          truncate="END"
        />
      )}

      <FlexWidget style={{ width: 'match_parent', flexDirection: 'column' }}>
        {legendSlices.map((slice, index) => {
          const percentage = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0.0';

          return (
            <FlexWidget
              key={slice.key}
              style={{
                width: 'match_parent',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <FlexWidget
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginRight: 5,
                  backgroundColor: colors[index],
                }}
              />
              <TextWidget
                text={`${slice.label}: ${formatNumber(slice.value)} (${percentage}%)`}
                style={{ fontSize: 10, color: '#4b5563' }}
                maxLines={1}
                truncate="END"
              />
            </FlexWidget>
          );
        })}
      </FlexWidget>
    </FlexWidget>
  );
}

function renderContent(data: AnalyticsWidgetResult | null, error?: string) {
  if (!data) {
    return (
      <TextWidget
        text={error ? 'No data available yet' : 'No data yet'}
        style={{
          fontSize: 12,
          color: '#374151',
          marginBottom: 8,
        }}
        maxLines={2}
        truncate="END"
      />
    );
  }

  if (data.kind === 'infoTile') {
    return renderInfoTile(data);
  }

  if (data.kind === 'line') {
    return renderLineChart(data);
  }

  return renderPieChart(data);
}

function formatTimestamp(updatedAt?: number): string {
  if (!updatedAt) {
    return 'Never';
  }

  return new Date(updatedAt).toLocaleString();
}

export function AnalyticsWidgetView({
  data,
  error,
  updatedAt,
  showFetchWarning,
}: AnalyticsWidgetViewProps) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        flexDirection: 'column',
      }}
    >
      <TextWidget
        text="Paperless Analytics"
        style={{
          fontSize: 15,
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: 6,
        }}
      />

      {renderContent(data, error)}

      <FlexWidget style={{ width: 'match_parent', marginTop: 6, flexDirection: 'row' }}>
        <TextWidget
          text={`Updated: ${formatTimestamp(updatedAt)}`}
          style={{
            fontSize: 9,
            color: '#6b7280',
          }}
          maxLines={1}
          truncate="END"
        />
      </FlexWidget>

      {showFetchWarning && error ? (
        <FlexWidget
          style={{
            width: 'match_parent',
            marginTop: 6,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fef2f2',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: '#fecaca',
          }}
        >
          <TextWidget
            text="⚠"
            style={{
              fontSize: 12,
              color: '#b91c1c',
              marginRight: 6,
              fontWeight: 'bold',
            }}
          />
          <TextWidget
            text="Could not refresh data. Showing last cached values."
            style={{
              fontSize: 10,
              color: '#991b1b',
            }}
            maxLines={2}
            truncate="END"
          />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}
