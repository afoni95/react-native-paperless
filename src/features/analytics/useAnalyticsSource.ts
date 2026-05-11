import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDocuments } from '@/reactQuery/documents';
import { useDocumentMetadata } from '@/hooks';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import type { Document } from '@/types';
import type { AnalyticsDataDocument, AnalyticsDataSource } from './types';

function parseNumeric(
  value: string | number | boolean | null | (string | number)[] | Record<string, unknown>,
): number | null {
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  if (typeof value === 'string') {
    const cleaned = value.trim().replace(/[^0-9,.-]/g, '');
    if (!cleaned || cleaned === '-' || cleaned === ',' || cleaned === '.') return null;

    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');

    let normalized = cleaned;
    if (lastComma > -1 && lastDot > -1) {
      normalized =
        lastComma > lastDot
          ? cleaned.replace(/\./g, '').replace(',', '.')
          : cleaned.replace(/,/g, '');
    } else if (lastComma > -1) {
      normalized = cleaned.replace(',', '.');
    }

    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const candidates = ['value', 'amount', 'number', 'numeric', 'decimal'];

    for (const key of candidates) {
      const candidate = record[key];
      if (typeof candidate === 'number') return Number.isNaN(candidate) ? null : candidate;
      if (typeof candidate === 'string') {
        const parsed = parseNumeric(candidate);
        if (parsed !== null) return parsed;
      }
    }

    for (const candidate of Object.values(record)) {
      if (typeof candidate === 'number') return Number.isNaN(candidate) ? null : candidate;
      if (typeof candidate === 'string') {
        const parsed = parseNumeric(candidate);
        if (parsed !== null) return parsed;
      }
    }
  }
  return null;
}

export const useAnalyticsSource = (): AnalyticsDataSource => {
  const queryClient = useQueryClient();
  const { status } = useNetworkStore();
  const isOnline = status === NetworkStatus.Online;
  const { data: fetchedPage } = useDocuments({ page_size: 500, ordering: '-created' }, isOnline);
  const metadata = useDocumentMetadata();

  const documents = useMemo(() => {
    const fromFetch = fetchedPage?.results ?? [];
    const cachedQueries = queryClient.getQueriesData({ queryKey: ['documents'] });
    const cachedDocs = cachedQueries.flatMap((entry) => {
      const data = entry[1] as { results?: Document[] } | undefined;
      return data?.results ?? [];
    });

    const mergedById = new Map<number, Document>();
    [...cachedDocs, ...fromFetch].forEach((doc) => {
      if (doc?.id) mergedById.set(doc.id, doc);
    });

    const numericTypes = new Set(['integer', 'float', 'monetary']);
    return Array.from(mergedById.values()).map((doc): AnalyticsDataDocument => {
      const numericCustomFields: Record<number, number> = {};
      const customFieldStrings: Record<number, string> = {};

      (doc.custom_fields ?? []).forEach((fieldValue: { field: number; value: unknown }) => {
        const field = metadata.customFieldsMap.get(fieldValue.field);
        if (!field) return;
        if (numericTypes.has(field.data_type)) {
          const parsed = parseNumeric(
            fieldValue.value as
              | string
              | number
              | boolean
              | null
              | (string | number)[]
              | Record<string, unknown>,
          );
          if (parsed !== null) numericCustomFields[field.id] = parsed;
          return;
        }
        if (typeof fieldValue.value === 'string') {
          customFieldStrings[field.id] = fieldValue.value;
        }
      });

      return {
        id: doc.id,
        date: doc.created_date ?? doc.created ?? doc.added,
        correspondentId: doc.correspondent,
        documentTypeId: doc.document_type,
        tagIds: Array.isArray(doc.tags) ? doc.tags : [],
        numericCustomFields,
        customFieldStrings,
      };
    });
  }, [fetchedPage?.results, metadata.customFieldsMap, queryClient]);

  const dataVersion = useMemo(() => {
    const lastId = documents[0]?.id ?? 'none';
    return `${documents.length}:${lastId}:${status}`;
  }, [documents, status]);

  return {
    documents,
    correspondentsMap: metadata.correspondentsMap,
    docTypesMap: metadata.docTypesMap,
    tagsMap: metadata.tagsMap,
    customFieldsMap: metadata.customFieldsMap,
    dataVersion,
  };
};
