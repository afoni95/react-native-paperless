import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

import { syncAll } from '@/services/syncService';
import { useAuthStore } from '@/store/authStore';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { useOfflineQueueStore } from '@/store/offlineQueueStore';

/**
 * Uploads what is waiting in the offline queue (documents created offline, new tags, correspondents, document
 * types) automatically: when the app starts or the user logs in, when it comes back to the foreground, when the
 * connection returns, and when something new is queued. Items the server refused are left for "Sync now".
 * It deliberately does not react to every queue change: a sync that finds the server unreachable puts its items
 * back to pending, and that must not trigger another attempt straight away.
 */
const runSync = (queryClient: QueryClient) => {
  const q = useOfflineQueueStore.getState();
  const a = useAuthStore.getState();
  if (!q.hydrated || !a.isAuthenticated || !a.token) return;
  if (useNetworkStore.getState().status !== NetworkStatus.Online) return;
  if (!q.items.some((i) => i.status === 'pending')) return;
  syncAll({ includeFailed: false })
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-all'] });
    })
    .catch(() => undefined);
};

export const AutoSync: React.FC = () => {
  const queryClient = useQueryClient();
  const hydrated = useOfflineQueueStore((s) => s.hydrated);
  const count = useOfflineQueueStore((s) => s.items.length);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const online = useNetworkStore((s) => s.status === NetworkStatus.Online);
  const lastCount = useRef(0);

  // start, login, connection back
  useEffect(() => {
    runSync(queryClient);
  }, [hydrated, isAuthenticated, token, online, queryClient]);

  // something new queued
  useEffect(() => {
    if (count > lastCount.current) runSync(queryClient);
    lastCount.current = count;
  }, [count, queryClient]);

  // back on the screen
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') runSync(queryClient);
    });
    return () => sub.remove();
  }, [queryClient]);

  return null;
};
