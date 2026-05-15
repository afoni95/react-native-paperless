import { tagsApi } from '@/api/tags';
import { correspondentsApi } from '@/api/correspondents';
import { documentTypesApi } from '@/api/documentTypes';
import { documentsApi } from '@/api/documents';
import { useOfflineQueueStore, OfflineQueueItem } from '@/store/offlineQueueStore';
import { Alert } from 'react-native';

type NameIdMap = Map<string, number>;

const syncTags = async (items: OfflineQueueItem[], tagMap: NameIdMap): Promise<void> => {
  for (const item of items) {
    const { updateItemStatus, removeItem } = useOfflineQueueStore.getState();
    const name = item.data.name ?? '';
    updateItemStatus(item.id, 'syncing');
    try {
      const existing = tagMap.get(name.toLowerCase());
      if (existing === undefined) {
        const created = await tagsApi.createTag({
          name,
          color: item.data.color ?? '#a6cee3',
        });
        if (typeof created.id !== 'number' || created.id <= 0) {
          Alert.alert('Sync Error', `Server returned invalid ID for tag: ${name}`);
        }
        tagMap.set(name.toLowerCase(), created.id);
      }
      removeItem(item.id);
    } catch (err) {
      updateItemStatus(item.id, 'failed', err instanceof Error ? err.message : 'Unknown error');
    }
  }
};

const syncCorrespondents = async (
  items: OfflineQueueItem[],
  corrMap: NameIdMap,
): Promise<void> => {
  for (const item of items) {
    const { updateItemStatus, removeItem } = useOfflineQueueStore.getState();
    const name = item.data.name ?? '';
    updateItemStatus(item.id, 'syncing');
    try {
      const existing = corrMap.get(name.toLowerCase());
      if (existing === undefined) {
        const created = await correspondentsApi.createCorrespondent({ name });
        if (typeof created.id !== 'number' || created.id <= 0) {
          Alert.alert('Sync Error', `Server returned invalid ID for correspondent: ${name}`);
        }
        corrMap.set(name.toLowerCase(), created.id);
      }
      removeItem(item.id);
    } catch (err) {
      updateItemStatus(item.id, 'failed', err instanceof Error ? err.message : 'Unknown error');
    }
  }
};

const syncDocumentTypes = async (
  items: OfflineQueueItem[],
  dtMap: NameIdMap,
): Promise<void> => {
  for (const item of items) {
    const { updateItemStatus, removeItem } = useOfflineQueueStore.getState();
    const name = item.data.name ?? '';
    updateItemStatus(item.id, 'syncing');
    try {
      const existing = dtMap.get(name.toLowerCase());
      if (existing === undefined) {
        const created = await documentTypesApi.createDocumentType({ name });
        if (typeof created.id !== 'number' || created.id <= 0) {
          Alert.alert('Sync Error', `Server returned invalid ID for document type: ${name}`);
        }
        dtMap.set(name.toLowerCase(), created.id);
      }
      removeItem(item.id);
    } catch (err) {
      updateItemStatus(item.id, 'failed', err instanceof Error ? err.message : 'Unknown error');
    }
  }
};

const syncDocuments = async (
  items: OfflineQueueItem[],
  tagMap: NameIdMap,
  corrMap: NameIdMap,
  dtMap: NameIdMap,
): Promise<void> => {
  for (const item of items) {
    const { updateItemStatus, removeItem } = useOfflineQueueStore.getState();
    updateItemStatus(item.id, 'syncing');

    try {
      const { data } = item;

      if (!data.fileUri || !data.fileName) {
        throw new Error('Missing file information');
      }

      const unresolvedEntities: string[] = [];
      for (const name of data.tagNames ?? []) {
        const id = tagMap.get(name.toLowerCase());
        if (typeof id !== 'number' || id <= 0) unresolvedEntities.push(name);
      }
      if (
        data.correspondentName &&
        (() => {
          const id = corrMap.get(data.correspondentName.toLowerCase());
          return typeof id !== 'number' || id <= 0;
        })()
      ) {
        unresolvedEntities.push(data.correspondentName);
      }
      if (
        data.documentTypeName &&
        (() => {
          const id = dtMap.get(data.documentTypeName.toLowerCase());
          return typeof id !== 'number' || id <= 0;
        })()
      ) {
        unresolvedEntities.push(data.documentTypeName);
      }
      if (unresolvedEntities.length > 0) {
        throw new Error(`Entity sync pending: ${unresolvedEntities.join(', ')}`);
      }

      const tagIds = [
        ...new Set(
          (data.tagNames ?? [])
            .map((name) => tagMap.get(name.toLowerCase()))
            .filter((id): id is number => typeof id === 'number' && id > 0),
        ),
      ];

      const correspondentId = data.correspondentName
        ? corrMap.get(data.correspondentName.toLowerCase())
        : undefined;
      const validCorrespondentId =
        typeof correspondentId === 'number' && correspondentId > 0 ? correspondentId : undefined;

      const documentTypeId = data.documentTypeName
        ? dtMap.get(data.documentTypeName.toLowerCase())
        : undefined;
      const validDocumentTypeId =
        typeof documentTypeId === 'number' && documentTypeId > 0 ? documentTypeId : undefined;

      await documentsApi.uploadDocument({
        document: {
          uri: data.fileUri,
          name: data.fileName,
          type: data.fileMimeType ?? 'application/octet-stream',
        },
        title: data.title,
        tags: tagIds.length > 0 ? tagIds : undefined,
        correspondent: validCorrespondentId,
        document_type: validDocumentTypeId,
      });

      removeItem(item.id);
    } catch (err) {
      updateItemStatus(item.id, 'failed', err instanceof Error ? err.message : 'Unknown error');
    }
  }
};

export const syncAll = async (): Promise<void> => {
  const { items } = useOfflineQueueStore.getState();
  const pending = items.filter((i) => i.status === 'pending' || i.status === 'failed');

  if (pending.length === 0) return;

  const tagMap: NameIdMap = new Map();
  const corrMap: NameIdMap = new Map();
  const dtMap: NameIdMap = new Map();

  const [serverTags, serverCorrs, serverDts] = await Promise.all([
    tagsApi.getAllTags(),
    correspondentsApi.getAllCorrespondents(),
    documentTypesApi.getAllDocumentTypes(),
  ]);
  serverTags.forEach((t) => tagMap.set(t.name.toLowerCase(), t.id));
  serverCorrs.forEach((c) => corrMap.set(c.name.toLowerCase(), c.id));
  serverDts.forEach((d) => dtMap.set(d.name.toLowerCase(), d.id));

  const docTypeItems = pending.filter((i) => i.type === 'documentType');
  const corrItems = pending.filter((i) => i.type === 'correspondent');
  const tagItems = pending.filter((i) => i.type === 'tag');
  const docItems = pending.filter((i) => i.type === 'document');

  if (docTypeItems.length > 0) await syncDocumentTypes(docTypeItems, dtMap);
  if (corrItems.length > 0) await syncCorrespondents(corrItems, corrMap);
  if (tagItems.length > 0) await syncTags(tagItems, tagMap);

  if (docItems.length > 0) await syncDocuments(docItems, tagMap, corrMap, dtMap);
};
