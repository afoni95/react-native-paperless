import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tagsApi, correspondentsApi, documentTypesApi } from '@/api';
import type { Tag, Correspondent, DocumentType } from '@/types';

/**
 * Shared hook that fetches + caches tags / correspondents / doc types
 * and returns id->entity maps for quick lookups.
 */
export function useLookupMaps() {
  const { data: allTags } = useQuery({
    queryKey: ['tags-all'],
    queryFn: tagsApi.getAllTags,
    staleTime: 5 * 60_000,
  });

  const { data: allCorrespondents } = useQuery({
    queryKey: ['correspondents-all'],
    queryFn: correspondentsApi.getAllCorrespondents,
    staleTime: 5 * 60_000,
  });

  const { data: allDocTypes } = useQuery({
    queryKey: ['document-types-all'],
    queryFn: documentTypesApi.getAllDocumentTypes,
    staleTime: 5 * 60_000,
  });

  const tagsMap = useMemo(() => {
    const m = new Map<number, Tag>();
    allTags?.forEach((t) => m.set(t.id, t));
    return m;
  }, [allTags]);

  const correspondentsMap = useMemo(() => {
    const m = new Map<number, Correspondent>();
    allCorrespondents?.forEach((c) => m.set(c.id, c));
    return m;
  }, [allCorrespondents]);

  const docTypesMap = useMemo(() => {
    const m = new Map<number, DocumentType>();
    allDocTypes?.forEach((dt) => m.set(dt.id, dt));
    return m;
  }, [allDocTypes]);

  return {
    allTags: allTags ?? [],
    allCorrespondents: allCorrespondents ?? [],
    allDocTypes: allDocTypes ?? [],
    tagsMap,
    correspondentsMap,
    docTypesMap,
  };
}
