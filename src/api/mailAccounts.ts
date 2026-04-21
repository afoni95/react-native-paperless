import apiClient from './client';
import { MailAccount, MailAccountCreatePayload, MailAccountUpdatePayload, PaginatedResponse } from '@/types';

interface ProcessMailAccountResponse {
  result: string;
}

export const mailAccountsApi = {
  getMailAccounts: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<MailAccount>> => {
    const response = await apiClient.get<PaginatedResponse<MailAccount>>('/api/mail_accounts/', {
      params,
    });
    return response.data;
  },

  getAllMailAccounts: async (): Promise<MailAccount[]> => {
    const mailAccountsList: MailAccount[] = [];
    let page = 1;

    while (true) {
      const resp = await mailAccountsApi.getMailAccounts({ page, page_size: 100 });
      mailAccountsList.push(...resp.results);
      if (!resp.next) break;
      page++;
    }

    return mailAccountsList;
  },

  getMailAccount: async (id: number): Promise<MailAccount> => {
    const response = await apiClient.get<MailAccount>(`/api/mail_accounts/${id}/`);
    return response.data;
  },

  createMailAccount: async (data: MailAccountCreatePayload): Promise<MailAccount> => {
    const response = await apiClient.post<MailAccount>('/api/mail_accounts/', data);
    return response.data;
  },

  updateMailAccount: async (id: number, data: MailAccountUpdatePayload): Promise<MailAccount> => {
    const response = await apiClient.patch<MailAccount>(`/api/mail_accounts/${id}/`, data);
    return response.data;
  },

  deleteMailAccount: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/mail_accounts/${id}/`);
  },

  processMailAccount: async (id: number): Promise<ProcessMailAccountResponse> => {
    const response = await apiClient.post<ProcessMailAccountResponse>(
      `/api/mail_accounts/${id}/process/`,
      {},
    );
    return response.data;
  },
};
