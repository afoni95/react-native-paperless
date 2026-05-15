import apiClient from './client';
import { Statistics } from '@/types';

export const statisticsApi = {
  getStatistics: async (): Promise<Statistics> => {
    const { data } = await apiClient.get<Statistics>('/api/statistics/');
    return data;
  },
};
