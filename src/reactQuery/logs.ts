import { useQuery } from '@tanstack/react-query';

import { getLog, listLogs } from '@/api';
import { QueryHookOptions } from '@/utils/reactQueryCommon';

import { logsQueryKeys } from './queryKeys';

export const useLogs = (
  isEnabled = true,
  options?: QueryHookOptions<string[], typeof logsQueryKeys.all>,
) => {
  return useQuery({
    ...options,
    queryKey: logsQueryKeys.all,
    enabled: isEnabled,
    queryFn: () => listLogs(),
  });
};

export const useLog = (
  logId: string,
  limit?: number,
  isEnabled = true,
  options?: QueryHookOptions<string[], ReturnType<typeof logsQueryKeys.detail>>,
) => {
  return useQuery({
    ...options,
    queryKey: logsQueryKeys.detail(logId, limit),
    enabled: isEnabled && logId.trim().length > 0,
    queryFn: () => getLog(logId, limit),
  });
};
