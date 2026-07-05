/**
 * Background sync service for widgets
 * Manages sync lifecycle, network status, and app state
 */

import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoSubscription } from '@react-native-community/netinfo';
import type { QueryClient } from '@tanstack/react-query';
import { useWidgetStore } from '@/widgets/store';
import { syncAllWidgets, shouldSync, createSyncScheduler } from '@/widgets/sync';
import { updateNativeWidget } from '@/widgets/nativeBridge';
import type { AnalyticsWidget } from '@/features/analytics/types';

type WidgetSyncConfig = ReturnType<typeof useWidgetStore.getState>['syncConfig'];

interface WidgetSyncServiceConfig {
  queryClient: QueryClient;
}

class WidgetSyncService {
  private syncScheduler: ReturnType<typeof createSyncScheduler> | null = null;
  private appStateSubscription: { remove: () => void } | null = null;
  private networkSubscription: NetInfoSubscription | null = null;
  private isActive = true;
  private isOnline = true;
  private config: WidgetSyncServiceConfig | null = null;

  private getAnalyticsWidgets = (): Record<string, AnalyticsWidget> => {
    if (!this.config) {
      return {};
    }

    return (
      this.config.queryClient.getQueryData<Record<string, AnalyticsWidget>>(['analyticsWidgets']) ??
      {}
    );
  };

  /**
   * Initialize the sync service
   */
  initialize(config: WidgetSyncServiceConfig) {
    // Prevent duplicate listeners/schedulers across auth/navigation transitions.
    this.destroy();

    console.log('[WidgetSyncService] Initializing');
    this.config = config;

    // Setup app state listener
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    // Setup network listener
    this.networkSubscription = NetInfo.addEventListener((state) => {
      this.isOnline = !!state.isConnected;
      console.log(
        '[WidgetSyncService] Network status changed:',
        state.isConnected ? 'online' : 'offline',
      );

      if (this.isOnline && this.isActive) {
        this.performSync(true);
      }
    });

    // Create sync scheduler
    const store = useWidgetStore.getState();
    this.syncScheduler = createSyncScheduler({
      queryClient: config.queryClient,
      widgets: this.getAnalyticsWidgets,
      intervalMs: store.syncConfig.intervalMinutes * 60 * 1000,
    });

    // Start scheduler if app is active
    if (this.isActive) {
      this.syncScheduler.start();
    }
  }

  /**
   * Handle app state changes (foreground/background)
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    const isActive = nextAppState === 'active';

    if (isActive && !this.isActive) {
      console.log('[WidgetSyncService] App came to foreground, resuming sync');
      this.isActive = true;
      if (this.syncScheduler) {
        this.syncScheduler.start();
      }
      // Perform sync immediately when app comes to foreground
      this.performSync(true);
    } else if (!isActive && this.isActive) {
      console.log('[WidgetSyncService] App went to background, pausing sync');
      this.isActive = false;
      if (this.syncScheduler) {
        this.syncScheduler.stop();
      }
    }
  };

  /**
   * Perform widget sync
   */
  private performSync = async (force = false) => {
    if (!this.config) return;

    const store = useWidgetStore.getState();

    // Check if sync is needed
    if (!force && !shouldSync(store.syncConfig)) {
      return;
    }

    // Check WiFi-only setting
    if (store.syncConfig.wifiOnly && !this.isOnline) {
      console.log('[WidgetSyncService] WiFi-only mode enabled, but offline');
      return;
    }

    console.log('[WidgetSyncService] Starting sync');

    try {
      const analyticsWidgets = this.getAnalyticsWidgets();
      if (Object.keys(analyticsWidgets).length === 0) {
        return;
      }

      const result = await syncAllWidgets({
        queryClient: this.config.queryClient,
        widgets: analyticsWidgets,
        force,
        onProgress: (widgetId, status) => {
          // Send updates to native layer
          if (status === 'done') {
            const cached = store.getCachedData(widgetId);
            if (cached?.data) {
              updateNativeWidget({
                widgetId,
                data: cached.data,
              }).catch((e) => console.error('Failed to update native widget:', e));
            }
          } else if (status === 'error') {
            const widget = store.widgets[widgetId];
            updateNativeWidget({
              widgetId,
              data: null,
              error: widget?.syncError || 'Sync failed',
            }).catch((e) => console.error('Failed to update native widget error:', e));
          }
        },
      });

      console.log(
        '[WidgetSyncService] Sync complete:',
        `${result.success} succeeded, ${result.failed} failed`,
      );
    } catch (error) {
      console.error('[WidgetSyncService] Sync error:', error);
      store.setSyncStatus('error', 'Sync failed');
    }
  };

  /**
   * Force immediate sync
   */
  forceSync = async () => {
    console.log('[WidgetSyncService] Force sync requested');
    if (this.syncScheduler) {
      await this.syncScheduler.forceSync();
    }
  };

  /**
   * Update sync configuration
   */
  updateConfig = (updates: Partial<WidgetSyncConfig>) => {
    console.log('[WidgetSyncService] Updating config:', updates);

    // Restart scheduler with new interval if it changed
    if (updates.intervalMinutes && this.syncScheduler) {
      this.syncScheduler.stop();
      this.syncScheduler = createSyncScheduler({
        queryClient: this.config!.queryClient,
        widgets: this.getAnalyticsWidgets,
        intervalMs: updates.intervalMinutes * 60 * 1000,
      });
      if (this.isActive) {
        this.syncScheduler.start();
      }
    }
  };

  /**
   * Destroy the service and clean up listeners
   */
  destroy = () => {
    console.log('[WidgetSyncService] Destroying');
    if (this.syncScheduler) {
      this.syncScheduler.stop();
      this.syncScheduler = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    if (this.networkSubscription) {
      this.networkSubscription();
      this.networkSubscription = null;
    }
    this.config = null;
  };
}

// Singleton instance
let serviceInstance: WidgetSyncService | null = null;

/**
 * Get or create the widget sync service singleton
 */
export function getWidgetSyncService(): WidgetSyncService {
  if (!serviceInstance) {
    serviceInstance = new WidgetSyncService();
  }
  return serviceInstance;
}

/**
 * Initialize the widget sync service
 * Should be called once in app initialization
 */
export function initializeWidgetSync(config: WidgetSyncServiceConfig) {
  const service = getWidgetSyncService();
  service.initialize(config);
  return service;
}

/**
 * Cleanup widget sync service
 * Should be called on app shutdown
 */
export function cleanupWidgetSync() {
  if (serviceInstance) {
    serviceInstance.destroy();
    serviceInstance = null;
  }
}
