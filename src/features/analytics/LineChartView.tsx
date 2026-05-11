import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Polyline, Line, Text as SvgText, Circle } from 'react-native-svg';
import type { AnalyticsLineResult } from './types';

const PALETTE = ['#2a9d8f', '#e76f51', '#264653', '#f4a261', '#457b9d', '#e9c46a'];

interface LineChartViewProps {
  result: AnalyticsLineResult;
}

export const LineChartView: React.FC<LineChartViewProps> = ({ result }) => {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(Math.max(windowWidth - 40, 260), 720);
  const height = Math.min(Math.max(width * 0.58, 180), 320);
  const margin = 34;

  const xLabels = result.series[0]?.points.map((point) => point.x) ?? [];
  const yValues = result.series.flatMap((series) => series.points.map((point) => point.y));
  const yMax = Math.max(...yValues, 1);

  const xForIndex = (index: number, total: number) => {
    if (total <= 1) return margin;
    const usableWidth = width - margin * 2;
    return margin + (usableWidth * index) / (total - 1);
  };

  const yForValue = (value: number) => {
    const usableHeight = height - margin * 2;
    return height - margin - (value / yMax) * usableHeight;
  };

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, index) => (yMax * index) / yTicks);
  const yLabel = (value: number) => (value >= 1000 ? value.toFixed(0) : value.toFixed(1));

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line
          x1={margin}
          y1={margin}
          x2={margin}
          y2={height - margin}
          stroke={theme.colors.outline}
        />
        <Line
          x1={margin}
          y1={height - margin}
          x2={width - margin}
          y2={height - margin}
          stroke={theme.colors.outline}
        />

        {yTickValues.map((tickValue) => {
          const y = yForValue(tickValue);
          return (
            <React.Fragment key={`y-${tickValue}`}>
              <Line x1={margin - 4} y1={y} x2={margin} y2={y} stroke={theme.colors.outline} />
              <SvgText
                x={margin - 7}
                y={y + 3}
                fontSize={8}
                textAnchor="end"
                fill={theme.colors.onSurfaceVariant}
              >
                {yLabel(tickValue)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {result.series.map((series, seriesIndex) => {
          const points = series.points
            .map(
              (point, index) => `${xForIndex(index, series.points.length)},${yForValue(point.y)}`,
            )
            .join(' ');
          const color = PALETTE[seriesIndex % PALETTE.length];

          return (
            <React.Fragment key={series.key}>
              <Polyline fill="none" stroke={color} strokeWidth={2.5} points={points} />
              {series.points.map((point, index) => (
                <Circle
                  key={`${series.key}-${point.x}`}
                  cx={xForIndex(index, series.points.length)}
                  cy={yForValue(point.y)}
                  r={2.8}
                  fill={color}
                />
              ))}
            </React.Fragment>
          );
        })}

        {xLabels.slice(0, 6).map((label, index, items) => (
          <SvgText
            key={label}
            x={xForIndex(index, items.length)}
            y={height - 8}
            fontSize={8}
            textAnchor="middle"
            fill={theme.colors.onSurfaceVariant}
          >
            {label}
          </SvgText>
        ))}
      </Svg>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {result.series.map((series, index) => (
          <View key={series.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: PALETTE[index % PALETTE.length],
              }}
            />
            <Text variant="labelSmall">{series.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
