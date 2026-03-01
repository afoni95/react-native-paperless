import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { matchDemoRoute } from './demoData';

const apiClient = axios.create({
  timeout: 30000,
  headers: {
    Accept: 'application/json; version=9',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token, serverUrl, isDemo } = useAuthStore.getState();

    if (serverUrl) {
      config.baseURL = serverUrl.replace(/\/+$/, '');
    }

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // In demo mode, intercept every request and return mock data
    if (isDemo) {
      const method = (config.method ?? 'GET').toUpperCase();
      const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
      const params = config.params as Record<string, unknown> | undefined;
      const demo = matchDemoRoute(method, fullUrl, params);

      if (demo) {
        // Build a fake adapter that resolves with our mock response
        config.adapter = () =>
          Promise.resolve({
            data: demo.data,
            status: demo.status,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
            config,
          });
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const { logout, isDemo } = useAuthStore.getState();
      if (!isDemo) logout();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
