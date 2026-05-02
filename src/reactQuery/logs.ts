import { useQuery } from '@tanstack/react-query';

import { getLog, listLogs } from '@/api';
import { QueryHookOptions } from '@/utils/reactQueryCommon';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';

import { logsQueryKeys } from './queryKeys';

export const useLogs = (
  isEnabled = true,
  options?: QueryHookOptions<string[], typeof logsQueryKeys.all>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: logsQueryKeys.all,
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => listLogs(),
  });
};

export const useLog = (
  logId: string,
  limit?: number,
  isEnabled = true,
  options?: QueryHookOptions<string[], ReturnType<typeof logsQueryKeys.detail>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: logsQueryKeys.detail(logId, limit),
    enabled: isEnabled && networkStatus === NetworkStatus.Online && logId.trim().length > 0,
    queryFn: () => getLog(logId, limit),
  });
};
