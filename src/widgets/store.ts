/**
 * Zustand store for home screen widget state management
 * Persists to AsyncStorage for offline support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  HomeScreenWidget,
  WidgetDataSnapshot,
  WidgetSyncConfig,
  WidgetStoreState,
} from './types';

const STORAGE_KEY = 'widget_store';

const defaultSyncConfig: WidgetSyncConfig = {
  enabled: true,
  intervalMinutes: 30,
  wifiOnly: false,
};

interface WidgetStoreActions {
  // Widget management
  addWidget: (widget: HomeScreenWidget) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<HomeScreenWidget>) => void;
  reorderWidgets: (widgetIds: string[]) => void;

  // Sync configuration
  updateSyncConfig: (config: Partial<WidgetSyncConfig>) => void;

  // Data caching
  setCachedData: (snapshot: WidgetDataSnapshot) => void;
  getCachedData: (widgetId: string) => WidgetDataSnapshot | undefined;
  clearCachedData: (widgetId?: string) => void;

  // Sync status
  setSyncStatus: (status: 'idle' | 'syncing' | 'error', error?: string) => void;
  setWidgetSyncStatus: (
    widgetId: string,
    status: 'idle' | 'syncing' | 'error',
    error?: string
  ) => void;
  setLastSyncTime: (timestamp: number) => void;

  // Full state reset
  reset: () => void;
}

const initialState: WidgetStoreState = {
  widgets: {},
  widgetOrder: [],
  syncConfig: defaultSyncConfig,
  dataCache: {},
  globalSyncStatus: 'idle',
  lastGlobalSyncAt: undefined,
};

export const useWidgetStore = create<WidgetStoreState & WidgetStoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Widget management
      addWidget: (widget) => {
        set((state) => ({
          widgets: {
            ...state.widgets,
            [widget.id]: widget,
          },
          widgetOrder: [...state.widgetOrder, widget.id],
        }));
      },

      removeWidget: (widgetId) => {
        set((state) => {
          const { [widgetId]: _, ...remainingWidgets } = state.widgets;
          const { [widgetId]: __, ...remainingCache } = state.dataCache;

          return {
            widgets: remainingWidgets,
            widgetOrder: state.widgetOrder.filter((id) => id !== widgetId),
            dataCache: remainingCache,
          };
        });
      },

      updateWidget: (widgetId, updates) => {
        set((state) => ({
          widgets: {
            ...state.widgets,
            [widgetId]: {
              ...state.widgets[widgetId],
              ...updates,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      reorderWidgets: (widgetIds) => {
        set({ widgetOrder: widgetIds });
      },

      // Sync configuration
      updateSyncConfig: (config) => {
        set((state) => ({
          syncConfig: {
            ...state.syncConfig,
            ...config,
          },
        }));
      },

      // Data caching
      setCachedData: (snapshot) => {
        set((state) => ({
          dataCache: {
            ...state.dataCache,
            [snapshot.widgetId]: snapshot,
          },
        }));
      },

      getCachedData: (widgetId) => {
        return get().dataCache[widgetId];
      },

      clearCachedData: (widgetId) => {
        set((state) => {
          if (widgetId) {
            const { [widgetId]: _, ...remaining } = state.dataCache;
            return { dataCache: remaining };
          }
          return { dataCache: {} };
        });
      },

      // Sync status
      setSyncStatus: (status, error) => {
        set({
          globalSyncStatus: status,
          globalSyncError: error,
          lastGlobalSyncAt: Date.now(),
        });
      },

      setWidgetSyncStatus: (widgetId, status, error) => {
        const widget = get().widgets[widgetId];
        if (widget) {
          set((state) => ({
            widgets: {
              ...state.widgets,
              [widgetId]: {
                ...widget,
                syncStatus: status,
                syncError: error,
              },
            },
          }));
        }
      },

      setLastSyncTime: (timestamp) => {
        set({ lastGlobalSyncAt: timestamp });
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields (not transient sync status)
      partialize: (state) => ({
        widgets: state.widgets,
        widgetOrder: state.widgetOrder,
        syncConfig: state.syncConfig,
        dataCache: state.dataCache,
      }),
    }
  )
);
