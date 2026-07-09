/**
 * Web implementation of the expense store, backed by localStorage.
 *
 * expo-sqlite's web backend requires SharedArrayBuffer/OPFS (cross-origin
 * isolation headers) which the Expo dev server and most static hosts do not
 * provide, so writes silently fail to persist. localStorage is universally
 * available and more than sufficient for this dataset size.
 *
 * This module mirrors the public API of ./database.ts exactly; Metro resolves
 * the `.web.ts` variant automatically for web builds.
 */
import type { Expense, Category, CreateExpenseInput, UpdateExpenseInput, ExpenseFilter, ExpenseSummary } from '@/types/expense';
import { DEFAULT_CATEGORIES } from './defaultCategories';
import { todayString, weekStartString, monthStartString } from './dates';

const EXPENSES_KEY = 'nana.expenses.v1';
const CATEGORIES_KEY = 'nana.categories.v1';

// In-memory fallback so static rendering (Node, no localStorage) never crashes.
const memoryStore = new Map<string, string>();

function storageGet(key: string): string | null {
  if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
  return memoryStore.get(key) ?? null;
}

function storageSet(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  } else {
    memoryStore.set(key, value);
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readExpenses(): Expense[] {
  try {
    const raw = storageGet(EXPENSES_KEY);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  } catch {
    return [];
  }
}

function writeExpenses(expenses: Expense[]): void {
  storageSet(EXPENSES_KEY, JSON.stringify(expenses));
}

function readCategories(): Category[] {
  try {
    const raw = storageGet(CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Category[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fall through to seeding
  }
  const seeded = DEFAULT_CATEGORIES.map((c) => ({
    id: c.slug,
    name: c.name,
    icon: c.icon,
    color: c.color,
    isDefault: c.isDefault,
  }));
  storageSet(CATEGORIES_KEY, JSON.stringify(seeded));
  return seeded;
}

export async function getAllCategories(): Promise<Category[]> {
  return [...readCategories()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCategoryByName(name: string): Promise<Category | null> {
  const match = readCategories().find((c) => c.name.toLowerCase() === name.toLowerCase());
  return match ?? null;
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const now = new Date().toISOString();
  const expense: Expense = {
    id: generateId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  const expenses = readExpenses();
  expenses.push(expense);
  writeExpenses(expenses);
  return expense;
}

export async function updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense | null> {
  const expenses = readExpenses();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updated: Expense = {
    ...expenses[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  expenses[index] = updated;
  writeExpenses(expenses);
  return updated;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const expenses = readExpenses();
  const next = expenses.filter((e) => e.id !== id);
  if (next.length === expenses.length) return false;
  writeExpenses(next);
  return true;
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  return readExpenses().find((e) => e.id === id) ?? null;
}

export async function getExpenses(filter?: ExpenseFilter): Promise<Expense[]> {
  let result = readExpenses();

  if (filter?.startDate) result = result.filter((e) => e.date >= filter.startDate!);
  if (filter?.endDate) result = result.filter((e) => e.date <= filter.endDate!);
  if (filter?.category) result = result.filter((e) => e.category === filter.category);
  if (filter?.minAmount !== undefined) result = result.filter((e) => e.amount >= filter.minAmount!);
  if (filter?.maxAmount !== undefined) result = result.filter((e) => e.amount <= filter.maxAmount!);

  return result.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getExpenseSummary(startDate: string, endDate: string): Promise<ExpenseSummary> {
  const filtered = readExpenses().filter((e) => e.date >= startDate && e.date <= endDate);

  const byCategory: Record<string, { total: number; count: number }> = {};
  let total = 0;
  for (const expense of filtered) {
    total += expense.amount;
    if (!byCategory[expense.category]) {
      byCategory[expense.category] = { total: 0, count: 0 };
    }
    byCategory[expense.category].total += expense.amount;
    byCategory[expense.category].count += 1;
  }

  return { total, count: filtered.length, byCategory };
}

export async function getTodayTotal(): Promise<number> {
  const today = todayString();
  return (await getExpenseSummary(today, today)).total;
}

export async function getWeekTotal(): Promise<number> {
  return (await getExpenseSummary(weekStartString(), todayString())).total;
}

export async function getMonthTotal(): Promise<number> {
  return (await getExpenseSummary(monthStartString(), todayString())).total;
}

export async function clearAllData(): Promise<void> {
  writeExpenses([]);
}
