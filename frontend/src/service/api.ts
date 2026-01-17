// src/services/api.ts
import axios, { AxiosResponse } from 'axios';
import {
  User,
  Debt,
  AuthResponse,
  RegisterData,
  LoginData,
  CreateDebtData,
  UpdateDebtData,
  DebtSummary,
  DebtStatus,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
    return response.data;
  },
};

// Debts API
export const debtsAPI = {
  getAll: async (status?: DebtStatus): Promise<Debt[]> => {
    const params = status ? { status } : {};
    const response: AxiosResponse<Debt[]> = await api.get('/debts', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Debt> => {
    const response: AxiosResponse<Debt> = await api.get(`/debts/${id}`);
    return response.data;
  },

  create: async (data: CreateDebtData): Promise<Debt> => {
    const response: AxiosResponse<Debt> = await api.post('/debts', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDebtData): Promise<Debt> => {
    const response: AxiosResponse<Debt> = await api.patch(`/debts/${id}`, data);
    return response.data;
  },

  markAsPaid: async (id: string): Promise<Debt> => {
    const response: AxiosResponse<Debt> = await api.patch(`/debts/${id}/pay`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/debts/${id}`);
  },

  getSummary: async (): Promise<DebtSummary> => {
    const response: AxiosResponse<DebtSummary> = await api.get('/debts/summary');
    return response.data;
  },
};