import axios from 'axios';

const DEFAULT_API_URL =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? 'https://school-portal-production-23ee.up.railway.app/api'
    : 'http://localhost:8000/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const normalizeUrl = (url: string) => {
  if (url.startsWith('/api/')) {
    return url.substring(4);
  }
  if (url.startsWith('api/')) {
    return '/' + url.substring(4);
  }
  return url;
};

export const api = {
  get: <T = any>(url: string, params?: any): Promise<T> => apiClient.get<T>(normalizeUrl(url), { params }).then(res => res.data),
  post: <T = any>(url: string, data?: any): Promise<T> => apiClient.post<T>(normalizeUrl(url), data).then(res => res.data),
  put: <T = any>(url: string, data?: any): Promise<T> => apiClient.put<T>(normalizeUrl(url), data).then(res => res.data),
  delete: <T = any>(url: string): Promise<T> => apiClient.delete<T>(normalizeUrl(url)).then(res => res.data),
};

export default api;
