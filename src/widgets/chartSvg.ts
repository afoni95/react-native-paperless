import type { AnalyticsLineResult, AnalyticsPieResult } from '@/features/analytics/types';

type HexColor = `#${string}`;

const LINE_PALETTE: HexColor[] = ['#2a9d8f', '#e76f51', '#264653', '#f4a261', '#457b9d', '#e9c46a'];
const PIE_PALETTE: HexColor[] = ['#1d3557', '#2a9d8f', '#e76f51', '#f4a261', '#6d597a', '#457b9d', '#e9c46a'];

const CHART_WIDTH = 220;
const LINE_HEIGHT = 96;
const PIE_SIZE = 108;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function clampNumber(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return value;
}

function linePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) {
    return '';
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

function yLabel(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return value >= 1000 ? value.toFixed(0) : value.toFixed(1);
}

export function lineLegendColors(count: number): HexColor[] {
  return Array.from({ length: count }, (_, index) => LINE_PALETTE[index % LINE_PALETTE.length]);
}

export function pieLegendColors(count: number): HexColor[] {
  return Array.from({ length: count }, (_, index) => PIE_PALETTE[index % PIE_PALETTE.length]);
}

export function createLineChartSvg(result: AnalyticsLineResult): string | null {
  const series = result.series.slice(0, 4).filter((item) => item.points.length > 0);
  if (series.length === 0) {
    return null;
  }

  const margin = 24;
  const usableWidth = CHART_WIDTH - margin * 2;
  const usableHeight = LINE_HEIGHT - margin * 2;

  const allYValues = series.flatMap((item) => item.points.map((point) => clampNumber(point.y)));
  const yMax = Math.max(...allYValues, 1);

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, index) => (yMax * index) / yTicks);

  const yTickMarks = yTickValues
    .map((tick) => {
      const y = LINE_HEIGHT - margin - (tick / yMax) * usableHeight;
      return `<line x1="${margin - 4}" y1="${y.toFixed(2)}" x2="${margin}" y2="${y.toFixed(2)}" stroke="#9ca3af" stroke-width="0.8" />`;
    })
    .join('');

  const yTickLabels = yTickValues
    .map((tick) => {
      const y = LINE_HEIGHT - margin - (tick / yMax) * usableHeight;
      return `<text x="${margin - 6}" y="${(y + 2.5).toFixed(2)}" font-size="6" fill="#6b7280" text-anchor="end">${yLabel(tick)}</text>`;
    })
    .join('');

  const axisLines = [
    `<line x1="${margin}" y1="${margin}" x2="${margin}" y2="${LINE_HEIGHT - margin}" stroke="#9ca3af" stroke-width="1" />`,
    `<line x1="${margin}" y1="${LINE_HEIGHT - margin}" x2="${CHART_WIDTH - margin}" y2="${LINE_HEIGHT - margin}" stroke="#9ca3af" stroke-width="1" />`,
    ...yTickValues.map((tick) => {
      const y = LINE_HEIGHT - margin - (tick / yMax) * usableHeight;
      return `<line x1="${margin}" y1="${y.toFixed(2)}" x2="${CHART_WIDTH - margin}" y2="${y.toFixed(2)}" stroke="#e5e7eb" stroke-width="0.7" />`;
    }),
  ];

  const lineLayers = series
    .map((item, seriesIndex) => {
      const color = LINE_PALETTE[seriesIndex % LINE_PALETTE.length];
      const points = item.points.map((point, index) => {
        const x =
          item.points.length <= 1
            ? margin
            : margin + (usableWidth * index) / (item.points.length - 1);
        const y = LINE_HEIGHT - margin - (clampNumber(point.y) / yMax) * usableHeight;
        return { x, y };
      });

      const dots = points
        .map(
          (point) =>
            `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="2.1" fill="${color}" />`,
        )
        .join('');

      return `<path d="${linePath(points)}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />${dots}`;
    })
    .join('');

  const xLabelsSource = series[0]?.points ?? [];
  const xLabels = xLabelsSource.slice(0, 6);

  const xLabelsLayer = xLabels
    .map((point, index, items) => {
      const x =
        items.length <= 1
          ? margin
          : margin + (usableWidth * index) / (items.length - 1);
      return `<text x="${x}" y="${LINE_HEIGHT - 3}" font-size="7" fill="#6b7280" text-anchor="${
        index === 0 ? 'start' : index === items.length - 1 ? 'end' : 'middle'
      }">${escapeXml(String(point.x).slice(0, 10))}</text>`;
    })
    .join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${CHART_WIDTH}" height="${LINE_HEIGHT}" viewBox="0 0 ${CHART_WIDTH} ${LINE_HEIGHT}">
  <rect x="0" y="0" width="${CHART_WIDTH}" height="${LINE_HEIGHT}" fill="#ffffff" rx="8" ry="8" />
  ${axisLines.join('')}
  ${yTickMarks}
  ${yTickLabels}
  ${lineLayers}
  ${xLabelsLayer}
</svg>`.trim();
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const startPoint = polarToCartesian(cx, cy, radius, endAngle);
  const endPoint = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endPoint.x} ${endPoint.y} Z`;
}

export function createPieChartSvg(result: AnalyticsPieResult): string | null {
  const slices = result.slices.filter((slice) => slice.value > 0).slice(0, 7);
  if (slices.length === 0) {
    return null;
  }

  const total = slices.reduce((sum, slice) => sum + clampNumber(slice.value), 0);
  if (total <= 0) {
    return null;
  }

  const center = PIE_SIZE / 2;
  const radius = PIE_SIZE * 0.4;

  let currentAngle = 0;
  const paths = slices
    .map((slice, index) => {
      const sweep = (clampNumber(slice.value) / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweep;
      currentAngle = endAngle;

      return `<path d="${arcPath(center, center, radius, startAngle, endAngle)}" fill="${PIE_PALETTE[index % PIE_PALETTE.length]}" />`;
    })
    .join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${PIE_SIZE}" height="${PIE_SIZE}" viewBox="0 0 ${PIE_SIZE} ${PIE_SIZE}">
  <rect x="0" y="0" width="${PIE_SIZE}" height="${PIE_SIZE}" fill="#ffffff" rx="8" ry="8" />
  ${paths}
</svg>`.trim();
}
