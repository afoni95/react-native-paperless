import apiClient from './client';
import { Workflow, WorkflowCreatePayload, WorkflowUpdatePayload, PaginatedResponse } from '@/types';

export const workflowsApi = {
  getWorkflows: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Workflow>> => {
    const response = await apiClient.get<PaginatedResponse<Workflow>>('/api/workflows/', {
      params,
    });
    return response.data;
  },

  getAllWorkflows: async (): Promise<Workflow[]> => {
    const workflowsList: Workflow[] = [];
    let page = 1;

    while (true) {
      const resp = await workflowsApi.getWorkflows({ page, page_size: 100 });
      workflowsList.push(...resp.results);
      if (!resp.next) break;
      page++;
    }

    return workflowsList;
  },

  getWorkflow: async (id: number): Promise<Workflow> => {
    const response = await apiClient.get<Workflow>(`/api/workflows/${id}/`);
    return response.data;
  },

  createWorkflow: async (data: WorkflowCreatePayload): Promise<Workflow> => {
    const response = await apiClient.post<Workflow>('/api/workflows/', data);
    return response.data;
  },

  updateWorkflow: async (id: number, data: WorkflowUpdatePayload): Promise<Workflow> => {
    const response = await apiClient.patch<Workflow>(`/api/workflows/${id}/`, data);
    return response.data;
  },

  deleteWorkflow: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/workflows/${id}/`);
  },
};
