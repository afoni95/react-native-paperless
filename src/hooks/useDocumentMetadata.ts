import { useMemo } from 'react';
import {
  useAllTags,
  useAllCorrespondents,
  useAllDocumentTypes,
  useAllStoragePaths,
  useAllCustomFields,
} from '@/reactQuery';
import type { Tag, Correspondent, DocumentType, StoragePath, CustomField } from '@/types';

export const useDocumentMetadata = () => {
  const { data: allTags } = useAllTags(true, { staleTime: 5 * 60 * 1000 });
  const { data: allCorrespondents } = useAllCorrespondents(true, { staleTime: 5 * 60 * 1000 });
  const { data: allDocTypes } = useAllDocumentTypes(true, { staleTime: 5 * 60 * 1000 });
  const { data: allStoragePaths } = useAllStoragePaths(true, { staleTime: 5 * 60 * 1000 });
  const { data: allCustomFields } = useAllCustomFields(true, { staleTime: 5 * 60 * 1000 });

  const tagsMap = useMemo(() => {
    const map = new Map<number, Tag>();
    allTags?.forEach((tag) => map.set(tag.id, tag));
    return map;
  }, [allTags]);

  const correspondentsMap = useMemo(() => {
    const map = new Map<number, Correspondent>();
    allCorrespondents?.forEach((c) => map.set(c.id, c));
    return map;
  }, [allCorrespondents]);

  const docTypesMap = useMemo(() => {
    const map = new Map<number, DocumentType>();
    allDocTypes?.forEach((dt) => map.set(dt.id, dt));
    return map;
  }, [allDocTypes]);

  const storagePathsMap = useMemo(() => {
    const map = new Map<number, StoragePath>();
    allStoragePaths?.forEach((sp) => map.set(sp.id, sp));
    return map;
  }, [allStoragePaths]);

  const customFieldsMap = useMemo(() => {
    const map = new Map<number, CustomField>();
    allCustomFields?.forEach((field) => map.set(field.id, field));
    return map;
  }, [allCustomFields]);

  return {
    allTags,
    allCorrespondents,
    allDocTypes,
    allStoragePaths,
    allCustomFields,
    tagsMap,
    correspondentsMap,
    docTypesMap,
    storagePathsMap,
    customFieldsMap,
  };
};
