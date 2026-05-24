import apiClient from './client';
import {
  MailAccount,
  MailAccountCreatePayload,
  MailAccountUpdatePayload,
  PaginatedResponse,
} from '@/types';

interface ProcessMailAccountResponse {
  result: string;
}

export const mailAccountsApi = {
  getMailAccounts: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<MailAccount>> => {
    const { data } = await apiClient.get<PaginatedResponse<MailAccount>>('/api/mail_accounts/', {
      params,
    });
    return data;
  },

  getAllMailAccounts: async (): Promise<MailAccount[]> => {
    const mailAccountsList: MailAccount[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { results, next } = await mailAccountsApi.getMailAccounts({ page, page_size: 100 });
      mailAccountsList.push(...results);
      hasMore = Boolean(next);
      page += 1;
    }

    return mailAccountsList;
  },

  getMailAccount: async (id: number): Promise<MailAccount> => {
    const { data } = await apiClient.get<MailAccount>(`/api/mail_accounts/${id}/`);
    return data;
  },

  createMailAccount: async (data: MailAccountCreatePayload): Promise<MailAccount> => {
    const { data: created } = await apiClient.post<MailAccount>('/api/mail_accounts/', data);
    return created;
  },

  updateMailAccount: async (id: number, data: MailAccountUpdatePayload): Promise<MailAccount> => {
    const { data: updated } = await apiClient.patch<MailAccount>(`/api/mail_accounts/${id}/`, data);
    return updated;
  },

  deleteMailAccount: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/mail_accounts/${id}/`);
  },

  processMailAccount: async (id: number): Promise<ProcessMailAccountResponse> => {
    const { data } = await apiClient.post<ProcessMailAccountResponse>(
      `/api/mail_accounts/${id}/process/`,
      {},
    );
    return data;
  },
};
