import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { AnalyticsWidgetResult } from '@/features/analytics/types';

interface AnalyticsWidgetViewProps {
  data: AnalyticsWidgetResult | null;
  error?: string;
  updatedAt?: number;
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

function formatTimestamp(updatedAt?: number): string {
  if (!updatedAt) {
    return 'Never';
  }

  return new Date(updatedAt).toLocaleString();
}

export function AnalyticsWidgetView({ data, error, updatedAt }: AnalyticsWidgetViewProps) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        flexDirection: 'column',
      }}
    >
      <TextWidget
        text='Paperless Analytics'
        style={{
          fontSize: 15,
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: 6,
        }}
      />

      <TextWidget
        text={error ?? formatSummary(data)}
        style={{
          fontSize: 12,
          color: error ? '#b91c1c' : '#374151',
          marginBottom: 8,
        }}
        maxLines={3}
        truncate='END'
      />

      <FlexWidget style={{ width: 'match_parent', marginTop: 8, flexDirection: 'row' }}>
        <TextWidget
          text={`Updated: ${formatTimestamp(updatedAt)}`}
          style={{
            fontSize: 10,
            color: '#6b7280',
          }}
          maxLines={1}
          truncate='END'
        />
      </FlexWidget>

      <FlexWidget
        clickAction='REFRESH'
        style={{
          marginTop: 6,
          backgroundColor: '#e5f3ea',
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}
      >
        <TextWidget text='Refresh' style={{ fontSize: 11, color: '#166534', fontWeight: 'bold' }} />
      </FlexWidget>
    </FlexWidget>
  );
}
