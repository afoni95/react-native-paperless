import apiClient from './client';
import { PaginatedResponse, ProcessedMail } from '@/types';

interface DeleteProcessedMailResponse {
  result: string;
  deleted_mail_ids: number[];
}

export const processedMailApi = {
  getProcessedMail: async (params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<ProcessedMail>> => {
    const { data } = await apiClient.get<PaginatedResponse<ProcessedMail>>('/api/processed_mail/', {
      params,
    });
    return data;
  },

  deleteProcessedMail: async (mailIds: number[]): Promise<DeleteProcessedMailResponse> => {
    const { data } = await apiClient.post<DeleteProcessedMailResponse>(
      '/api/processed_mail/delete/',
      { mail_ids: mailIds },
    );
    return data;
  },
};
