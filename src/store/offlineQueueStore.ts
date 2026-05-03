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
  removeItem: (id: string) => void;
  clearFailed: () => void;
  pendingCount: () => number;
  _hydrate: () => Promise<void>;
  _persist: (items: OfflineQueueItem[]) => Promise<void>;
}

let idCounter = 0;
function generateId(): string {
  const ts = Date.now().toString(36);
  idCounter += 1;
  return `${ts}-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

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

  removeItem: (id) => {
    const updated = get().items.filter((item) => item.id !== id);
    set({ items: updated });
    get()._persist(updated);
  },

  clearFailed: () => {
    const updated = get().items.filter((item) => item.status !== 'failed');
    set({ items: updated });
    get()._persist(updated);
  },

  pendingCount: () =>
    get().items.filter((i) => i.status === 'pending' || i.status === 'failed').length,

  _hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OfflineQueueItem[];
        const reset = parsed.map((item) =>
          item.status === 'syncing' ? { ...item, status: 'pending' as OfflineItemStatus } : item,
        );
        set({ items: reset });
      }
    } catch (error) {
      console.error('Failed to hydrate offline queue from storage', error);
    }
  },

  _persist: async (items: OfflineQueueItem[]) => {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to persist offline queue to storage', error);
    }
  },
}));
