export type InputMethod = 'voice' | 'camera' | 'manual';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receiptUri?: string;
  inputMethod: InputMethod;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseSummary {
  total: number;
  count: number;
  byCategory: Record<string, { total: number; count: number }>;
}

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseInput = Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>;
