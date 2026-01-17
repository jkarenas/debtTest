// src/types/index.ts
export enum DebtStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  amount: number;
  description: string;
  status: DebtStatus;
  createdAt: string;
  paidAt?: string;
  user: User;
}

export interface AuthResponse {
  access_token: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateDebtData {
  amount: number;
  description: string;
}

export interface UpdateDebtData {
  amount?: number;
  description?: string;
}

export interface DebtSummary {
  totalDebts: number;
  pendingDebts: number;
  paidDebts: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}