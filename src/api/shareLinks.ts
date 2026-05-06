import apiClient from './client';
import { PaginatedResponse, ShareLink, ShareLinkCreatePayload } from '@/types';

export const shareLinksApi = {
  getShareLinks: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<ShareLink>> => {
    const response = await apiClient.get<PaginatedResponse<ShareLink>>('/api/share_links/', {
      params,
    });
    return response.data;
  },

  getAllShareLinks: async (): Promise<ShareLink[]> => {
    const linksList: ShareLink[] = [];
    let page = 1;

    while (true) {
      const resp = await shareLinksApi.getShareLinks({ page, page_size: 100 });
      linksList.push(...resp.results);
      if (!resp.next) break;
      page++;
    }

    return linksList;
  },

  createShareLink: async (data: ShareLinkCreatePayload): Promise<ShareLink> => {
    const response = await apiClient.post<ShareLink>('/api/share_links/', data);
    return response.data;
  },

  deleteShareLink: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/share_links/${id}/`);
  },
};
