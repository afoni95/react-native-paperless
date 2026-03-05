import { useQuery } from '@tanstack/react-query';

import { statisticsApi } from '@/api';
import { Statistics } from '@/types';
import { QueryHookOptions } from '@/utils/reactQueryCommon';

import { statisticsQueryKeys } from './queryKeys';

export const useStatistics = (
  isEnabled = true,
  options?: QueryHookOptions<Statistics, typeof statisticsQueryKeys.all>,
) => {
  return useQuery({
    ...options,
    queryKey: statisticsQueryKeys.all,
    enabled: isEnabled,
    queryFn: () => statisticsApi.getStatistics(),
  });
};
