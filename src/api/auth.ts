import apiClient from './client';
import { TokenResponse } from '@/types';

export const authApi = {
  login: async (username: string, password: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/api/token/', {
      username,
      password,
    });
    return response.data;
  },
};
