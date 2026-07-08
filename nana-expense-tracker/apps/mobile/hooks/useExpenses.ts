import { useState, useEffect, useCallback } from 'react';
import type { Expense, Category, CreateExpenseInput, ExpenseFilter, ExpenseSummary } from '@/types/expense';
import * as db from '@/services/database';

export function useExpenses(filter?: ExpenseFilter) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.getExpenses(filter);
      setExpenses(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load expenses'));
    } finally {
      setLoading(false);
    }
  }, [filter?.startDate, filter?.endDate, filter?.category, filter?.minAmount, filter?.maxAmount]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = useCallback(async (input: CreateExpenseInput): Promise<Expense | null> => {
    try {
      const expense = await db.createExpense(input);
      setExpenses(prev => [expense, ...prev]);
      return expense;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to add expense'));
      return null;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, input: Partial<CreateExpenseInput>): Promise<boolean> => {
    try {
      const updated = await db.updateExpense(id, input);
      if (updated) {
        setExpenses(prev => prev.map(e => e.id === id ? updated : e));
        return true;
      }
      return false;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to update expense'));
      return false;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await db.deleteExpense(id);
      if (success) {
        setExpenses(prev => prev.filter(e => e.id !== id));
      }
      return success;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to delete expense'));
      return false;
    }
  }, []);

  return {
    expenses,
    loading,
    error,
    refresh: loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load categories'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refresh: loadCategories,
  };
}

export function useExpenseSummary(startDate: string, endDate: string) {
  const [summary, setSummary] = useState<ExpenseSummary>({ total: 0, count: 0, byCategory: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.getExpenseSummary(startDate, endDate);
      setSummary(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load summary'));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    summary,
    loading,
    error,
    refresh: loadSummary,
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    todayTotal: 0,
    weekTotal: 0,
    monthTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [todayTotal, weekTotal, monthTotal] = await Promise.all([
        db.getTodayTotal(),
        db.getWeekTotal(),
        db.getMonthTotal(),
      ]);
      setStats({ todayTotal, weekTotal, monthTotal });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    ...stats,
    loading,
    error,
    refresh: loadStats,
  };
}
