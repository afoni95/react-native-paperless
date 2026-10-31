import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = 'offline_queue';

export type OfflineItemType = 'document' | 'tag' | 'correspondent' | 'documentType';
export type OfflineItemStatus = 'pending' | 'syncing' | 'failed';

export interface OfflineQueueItem {
  id: string;
  type: OfflineItemType;
  status: OfflineItemStatus;
  error?: string;
  createdAt: number;
  data: {
    title?: string;
    tagNames?: string[];
    correspondentName?: string;
    documentTypeName?: string;
    fileUri?: string;
    fileName?: string;
    fileMimeType?: string;
    name?: string;
    color?: string;
    match?: string;
    isInsensitive?: boolean;
  };
}

interface OfflineQueueState {
  items: OfflineQueueItem[];
  addItem: (item: Omit<OfflineQueueItem, 'id' | 'status' | 'createdAt'>) => void;
  updateItemStatus: (id: string, status: OfflineItemStatus, error?: string) => void;
  updateItemData: (id: string, data: Partial<OfflineQueueItem['data']>) => void;
  removeItem: (id: string) => Promise<void>;
  clearFailed: () => void;
  pendingCount: () => number;
  /** True once the stored queue has been loaded (`_hydrate`). */
  hydrated: boolean;
  _hydrate: () => Promise<void>;
  _persist: (items: OfflineQueueItem[]) => Promise<void>;
}

let hydrating: Promise<void> | null = null;

let idCounter = 0;
const generateId = (): string => {
  const ts = Date.now().toString(36);
  idCounter += 1;
  return `${ts}-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
};

export const useOfflineQueueStore = create<OfflineQueueState>((set, get) => ({
  items: [],

  addItem: (item) => {
    if (
      (item.type === 'tag' || item.type === 'correspondent' || item.type === 'documentType') &&
      item.data.name
    ) {
      const nameLower = item.data.name.toLowerCase();
      const exists = get().items.some(
        (i) => i.type === item.type && i.data.name?.toLowerCase() === nameLower,
      );
      if (exists) return;
    }
    const newItem: OfflineQueueItem = {
      ...item,
      id: generateId(),
      status: 'pending',
      createdAt: Date.now(),
    };
    const updated = [...get().items, newItem];
    set({ items: updated });
    get()._persist(updated);
  },

  updateItemStatus: (id, status, error) => {
    const updated = get().items.map((item) =>
      item.id === id ? { ...item, status, error: error ?? item.error } : item,
    );
    set({ items: updated });
    get()._persist(updated);
  },

  updateItemData: (id, data) => {
    const updated = get().items.map((item) =>
      item.id === id ? { ...item, data: { ...item.data, ...data } } : item,
    );
    set({ items: updated });
    get()._persist(updated);
  },

  removeItem: async (id) => {
    const updated = get().items.filter((item) => item.id !== id);
    set({ items: updated });
    await get()._persist(updated);
  },

  clearFailed: () => {
    const updated = get().items.filter((item) => item.status !== 'failed');
    set({ items: updated });
    get()._persist(updated);
  },

  pendingCount: () =>
    get().items.filter((i) => i.status === 'pending' || i.status === 'failed').length,

  hydrated: false,
  // Loads the stored queue. Runs once (App.tsx calls it at start); items added before it finishes are kept, and
  // nothing is written to storage until it has run, so an early addItem cannot overwrite the stored queue.
  _hydrate: () => {
    if (!hydrating) {
      hydrating = (async () => {
        let stored: OfflineQueueItem[] = [];
        let readOk = false;
        // a failed read is retried; it must never be taken for "the stored queue is empty"
        for (let attempt = 0; attempt < 3 && !readOk; attempt++) {
          try {
            const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
            readOk = true;
            if (raw) {
              let parsed: unknown = null;
              try {
                parsed = JSON.parse(raw);
              } catch {
                parsed = null;
              }
              if (Array.isArray(parsed)) {
                stored = parsed as OfflineQueueItem[];
              } else {
                // keep the unreadable value instead of overwriting it with an empty queue
                console.error('Offline queue in storage is unreadable, kept a copy');
                await AsyncStorage.setItem(`${OFFLINE_QUEUE_KEY}.unreadable`, raw).catch(
                  () => undefined,
                );
              }
            }
          } catch (error) {
            console.error('Failed to read the offline queue from storage', error);
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
        const reset = stored.map((item) =>
          item.status === 'syncing' ? { ...item, status: 'pending' as OfflineItemStatus } : item,
        );
        const known = new Set(reset.map((i) => i.id));
        const merged = [...reset, ...get().items.filter((i) => !known.has(i.id))];
        set({ items: merged, hydrated: true });
        // only write after a successful read: an unread queue must not replace the stored one
        if (readOk) await get()._persist(merged);
      })();
    }
    return hydrating;
  },

  _persist: async (items: OfflineQueueItem[]) => {
    if (!get().hydrated) return; // _hydrate writes the merged queue once it has loaded the stored one
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to persist offline queue to storage', error);
    }
  },
}));
