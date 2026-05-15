import client from './client';

export const listLogs = async (): Promise<string[]> => {
  const { data } = await client.get<string[]>('/api/logs/');
  return data.reverse();
};

export const getLog = async (logId: string, limit?: number): Promise<string[]> => {
  const { data } = await client.get<string[]>(`/api/logs/${logId}/`, {
    params: limit ? { limit } : undefined,
  });
  return data.reverse();
};
