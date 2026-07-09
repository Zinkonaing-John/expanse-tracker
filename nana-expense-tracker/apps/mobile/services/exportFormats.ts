import type { Expense, Category } from '@/types/expense';

/**
 * Pure CSV/JSON export formatting (no react-native imports) so it can be
 * unit tested in Node.
 */

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
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
    csvEscape(getCategoryName(expense.category)),
    csvEscape(expense.description || ''),
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
    description: expense.description || '',
    inputMethod: expense.inputMethod,
    createdAt: expense.createdAt,
  }));

  return JSON.stringify(exportData, null, 2);
}

export function calculateExpenseStats(expenses: Expense[]) {
  if (expenses.length === 0) {
    return { total: 0, average: 0, highest: 0, lowest: 0, count: 0 };
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
