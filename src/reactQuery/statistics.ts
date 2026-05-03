import { useQuery } from '@tanstack/react-query';

import { statisticsApi } from '@/api';
import { Statistics } from '@/types';
import { QueryHookOptions } from '@/utils/reactQueryCommon';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';

import { statisticsQueryKeys } from './queryKeys';

export const useStatistics = (
  isEnabled = true,
  options?: QueryHookOptions<Statistics, typeof statisticsQueryKeys.all>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: statisticsQueryKeys.all,
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => statisticsApi.getStatistics(),
  });
};
