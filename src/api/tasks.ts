import apiClient from './client';
import { TaskStatus } from '@/types';

export const tasksApi = {
  getTask: async (taskId: string): Promise<TaskStatus[]> => {
    const response = await apiClient.get<TaskStatus[]>('/api/tasks/', {
      params: { task_id: taskId },
    });
    return response.data;
  },

  getAllTasks: async (): Promise<TaskStatus[]> => {
    const response = await apiClient.get<TaskStatus[]>('/api/tasks/');

    return response.data.filter((x) => x.acknowledged === false);
  },

  acknowledgeTasks: async (taskIds: number[]): Promise<void> => {
    await apiClient.post('/api/tasks/acknowledge/', { tasks: taskIds });
  },
};
