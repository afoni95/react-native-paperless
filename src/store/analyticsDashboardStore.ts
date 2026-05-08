import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AnalyticsDashboardStateShape,
  AnalyticsWidget,
  AnalyticsWidgetConfig,
  AnalyticsWidgetType,
} from '@/features/analytics/types';
import { ANALYTICS_DASHBOARD_KEY } from './constants';
import { analyticsWidgetRegistry } from '@/features/analytics/registry';

interface AnalyticsDashboardState extends AnalyticsDashboardStateShape {
  isHydrated: boolean;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  addWidget: (type: AnalyticsWidgetType) => string;
  updateWidget: (
    widgetId: string,
    patch: { title?: string; config?: AnalyticsWidgetConfig },
  ) => void;
  removeWidget: (widgetId: string) => void;
  moveWidgetUp: (widgetId: string) => void;
  moveWidgetDown: (widgetId: string) => void;
  hydrate: () => Promise<void>;
  _persist: (state: AnalyticsDashboardStateShape & { editMode: boolean }) => Promise<void>;
}

let widgetCounter = 0;

function nextWidgetId() {
  widgetCounter += 1;
  return `widget-${Date.now().toString(36)}-${widgetCounter.toString(36)}`;
}

function snapshotForPersistence(
  state: AnalyticsDashboardState,
): AnalyticsDashboardStateShape & { editMode: boolean } {
  return {
    widgetOrder: state.widgetOrder,
    widgets: state.widgets,
    editMode: state.editMode,
  };
}

export const useAnalyticsDashboardStore = create<AnalyticsDashboardState>((set, get) => ({
  widgetOrder: [],
  widgets: {},
  isHydrated: false,
  editMode: false,

  setEditMode: (value) => {
    set({ editMode: value });
    get()._persist(snapshotForPersistence(get()));
  },

  addWidget: (type) => {
    const definition = analyticsWidgetRegistry.get(type);
    const id = nextWidgetId();
    const now = Date.now();
    const widget: AnalyticsWidget = {
      id,
      title: '',
      type,
      createdAt: now,
      updatedAt: now,
      config: definition.createDefaultConfig(),
    };

    const nextWidgets = { ...get().widgets, [id]: widget };
    const nextOrder = [...get().widgetOrder, id];
    set({ widgets: nextWidgets, widgetOrder: nextOrder });
    get()._persist({ widgets: nextWidgets, widgetOrder: nextOrder, editMode: get().editMode });
    return id;
  },

  updateWidget: (widgetId, patch) => {
    const current = get().widgets[widgetId];
    if (!current) return;
    const next: AnalyticsWidget = {
      ...current,
      title: patch.title ?? current.title,
      config: patch.config ?? current.config,
      updatedAt: Date.now(),
    };
    const nextWidgets = { ...get().widgets, [widgetId]: next };
    set({ widgets: nextWidgets });
    get()._persist({
      widgets: nextWidgets,
      widgetOrder: get().widgetOrder,
      editMode: get().editMode,
    });
  },

  removeWidget: (widgetId) => {
    if (!get().widgets[widgetId]) return;
    const nextWidgets = { ...get().widgets };
    delete nextWidgets[widgetId];
    const nextOrder = get().widgetOrder.filter((id) => id !== widgetId);
    set({ widgets: nextWidgets, widgetOrder: nextOrder });
    get()._persist({ widgets: nextWidgets, widgetOrder: nextOrder, editMode: get().editMode });
  },

  moveWidgetUp: (widgetId) => {
    const index = get().widgetOrder.indexOf(widgetId);
    if (index <= 0) return;
    const nextOrder = [...get().widgetOrder];
    const prev = nextOrder[index - 1];
    nextOrder[index - 1] = widgetId;
    nextOrder[index] = prev;
    set({ widgetOrder: nextOrder });
    get()._persist({ widgets: get().widgets, widgetOrder: nextOrder, editMode: get().editMode });
  },

  moveWidgetDown: (widgetId) => {
    const index = get().widgetOrder.indexOf(widgetId);
    if (index < 0 || index >= get().widgetOrder.length - 1) return;
    const nextOrder = [...get().widgetOrder];
    const nextId = nextOrder[index + 1];
    nextOrder[index + 1] = widgetId;
    nextOrder[index] = nextId;
    set({ widgetOrder: nextOrder });
    get()._persist({ widgets: get().widgets, widgetOrder: nextOrder, editMode: get().editMode });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(ANALYTICS_DASHBOARD_KEY);
      if (!raw) {
        set({ isHydrated: true });
        return;
      }
      const parsed = JSON.parse(raw) as AnalyticsDashboardStateShape & { editMode?: boolean };
      set({
        widgetOrder: parsed.widgetOrder ?? [],
        widgets: parsed.widgets ?? {},
        editMode: parsed.editMode ?? false,
        isHydrated: true,
      });
    } catch (error) {
      console.error('Failed to hydrate analytics dashboard state', error);
      set({ isHydrated: true });
    }
  },

  _persist: async (state) => {
    try {
      await AsyncStorage.setItem(ANALYTICS_DASHBOARD_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist analytics dashboard state', error);
    }
  },
}));
