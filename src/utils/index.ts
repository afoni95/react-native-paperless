import type { CustomField, DocumentCustomFieldValue } from '@/types';

type TFunc = (key: string, options?: Record<string, unknown>) => string;

export function formatExpirationRelative(expiration: string | null, t: TFunc): string {
  if (!expiration) return t('shareLinks.noExpiration');

  const now = new Date();
  const exp = new Date(expiration);
  const diffMs = exp.getTime() - now.getTime();

  const dd = String(exp.getDate()).padStart(2, '0');
  const mm = String(exp.getMonth() + 1).padStart(2, '0');
  const yy = String(exp.getFullYear()).slice(-2);
  const dateStr = `${dd}.${mm}.${yy}`;

  if (diffMs <= 0) return dateStr;

  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(diffMs / 3600000);
  const totalDays = Math.floor(diffMs / 86400000);

  let relativeStr: string;
  if (totalDays >= 1) {
    relativeStr = t('shareLinks.inDays', { count: totalDays });
  } else if (totalHours >= 1) {
    const remainingMinutes = totalMinutes % 60;
    if (remainingMinutes > 0) {
      relativeStr = t('shareLinks.inHoursMinutes', {
        hours: totalHours,
        minutes: remainingMinutes,
      });
    } else {
      relativeStr = t('shareLinks.inHours', { count: totalHours });
    }
  } else {
    relativeStr = t('shareLinks.inMinutes', { count: totalMinutes });
  }

  const isToday = exp.toDateString() === now.toDateString();
  if (isToday) {
    return t('shareLinks.expiresRelativeToday', { time: relativeStr });
  }
  return t('shareLinks.expiresRelativeDate', { date: dateStr, time: relativeStr });
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getDefaultCustomFieldValue(field?: CustomField): DocumentCustomFieldValue['value'] {
  if (!field) return '';
  if (field.data_type === 'boolean') return false;
  if (field.data_type === 'select' || field.data_type === 'documentlink') return [];
  return '';
}

export function coerceCustomFieldValueForSubmit(
  value: DocumentCustomFieldValue['value'],
  field?: CustomField,
): DocumentCustomFieldValue['value'] {
  if (!field) return value;

  if (field.data_type === 'boolean') {
    if (typeof value === 'boolean') return value;
    return value === 'true';
  }

  if (field.data_type === 'integer') {
    if (value === '' || value === null) return null;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? value : parsed;
  }

  if (field.data_type === 'float') {
    if (value === '' || value === null) return null;
    const parsed = Number.parseFloat(String(value));
    return Number.isNaN(parsed) ? value : parsed;
  }

  if (field.data_type === 'documentlink') {
    if (Array.isArray(value)) return value;
    const parsedValues = String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => {
        const n = Number.parseInt(v, 10);
        return Number.isNaN(n) ? v : n;
      });
    return parsedValues;
  }

  return value;
}

export function sanitizeColor(color: string | null | undefined, fallback = '#e0e0e0'): string {
  if (!color) return fallback;
  const raw = color.startsWith('#') ? color : '#' + color;
  const digits = raw
    .slice(1)
    .replace(/[^0-9a-fA-F]/g, '')
    .slice(0, 6);
  if (digits.length === 0) return fallback;
  return '#' + digits.padEnd(6, '0');
}

export function getContrastTextColor(hexColor: string): string {
  if (!hexColor) return '#000000';
  const hex = sanitizeColor(hexColor).replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export const pauseAsync = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
