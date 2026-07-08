import * as FileSystem from 'expo-file-system';
import { Platform, Share } from 'react-native';
import type { Expense, Category } from '@/types/expense';

export interface ExportOptions {
  format: 'csv' | 'json';
  includeReceiptUris?: boolean;
}

export function expensesToCsv(expenses: Expense[], categories: Category[]): string {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const headers = ['Date', 'Amount', 'Category', 'Description', 'Input Method', 'Created At'];
  const rows = expenses.map(expense => [
    expense.date,
    expense.amount.toFixed(2),
    getCategoryName(expense.category),
    `"${expense.description.replace(/"/g, '""')}"`,
    expense.inputMethod,
    expense.createdAt,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function expensesToJson(expenses: Expense[], categories: Category[]): string {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const exportData = expenses.map(expense => ({
    date: expense.date,
    amount: expense.amount,
    category: getCategoryName(expense.category),
    categoryId: expense.category,
    description: expense.description,
    inputMethod: expense.inputMethod,
    createdAt: expense.createdAt,
  }));

  return JSON.stringify(exportData, null, 2);
}

export async function exportExpenses(
  expenses: Expense[],
  categories: Category[],
  options: ExportOptions = { format: 'csv' }
): Promise<boolean> {
  try {
    const filename = `nana-expenses-${new Date().toISOString().split('T')[0]}.${options.format}`;
    const content = options.format === 'csv'
      ? expensesToCsv(expenses, categories)
      : expensesToJson(expenses, categories);

    if (Platform.OS === 'web') {
      const blob = new Blob([content], { type: options.format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }

    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Share.share({
      url: fileUri,
      title: `Nana Expenses Export`,
      message: `Nana expense data exported on ${new Date().toLocaleDateString()}`,
    });

    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}

export function calculateExpenseStats(expenses: Expense[]) {
  if (expenses.length === 0) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      count: 0,
    };
  }

  const amounts = expenses.map(e => e.amount);
  const total = amounts.reduce((sum, a) => sum + a, 0);

  return {
    total,
    average: total / expenses.length,
    highest: Math.max(...amounts),
    lowest: Math.min(...amounts),
    count: expenses.length,
  };
}
