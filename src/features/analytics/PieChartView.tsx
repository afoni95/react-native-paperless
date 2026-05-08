import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import type { AnalyticsPieResult } from './types';

const PALETTE = ['#1d3557', '#2a9d8f', '#e76f51', '#f4a261', '#6d597a', '#457b9d', '#e9c46a'];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const startPoint = polarToCartesian(cx, cy, r, end);
  const endPoint = polarToCartesian(cx, cy, r, start);
  const largeArcFlag = end - start > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${startPoint.x} ${startPoint.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${endPoint.x} ${endPoint.y}`,
    'Z',
  ].join(' ');
}

interface PieChartViewProps {
  result: AnalyticsPieResult;
}

export const PieChartView: React.FC<PieChartViewProps> = ({ result }) => {
  const total = result.slices.reduce((sum, slice) => sum + slice.value, 0);
  const size = 180;
  const radius = 70;
  const center = size / 2;

  const arcs = result.slices.map((slice) => {
    const portion = total > 0 ? slice.value / total : 0;
    return portion * 360;
  });

  return (
    <View>
      <Svg width={size} height={size}>
        {result.slices.map((slice, index) => {
          const startAngle = arcs.slice(0, index).reduce((sum, value) => sum + value, 0);
          const endAngle = startAngle + arcs[index];
          const path = arcPath(center, center, radius, startAngle, endAngle);
          return <Path key={slice.key} d={path} fill={PALETTE[index % PALETTE.length]} />;
        })}
      </Svg>

      <View style={{ gap: 6 }}>
        {result.slices.map((slice, index) => {
          const percent = total ? ((slice.value / total) * 100).toFixed(1) : '0.0';
          return (
            <View key={slice.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: PALETTE[index % PALETTE.length],
                }}
              />
              <Text variant="bodySmall">{`${slice.label}: ${slice.value.toFixed(2)} (${percent}%)`}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
