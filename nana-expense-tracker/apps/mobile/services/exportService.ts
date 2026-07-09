import { Platform } from 'react-native';
import type { Expense, Category } from '@/types/expense';
import { expensesToCsv, expensesToJson } from './exportFormats';
import { todayString } from './dates';

export { expensesToCsv, expensesToJson, calculateExpenseStats } from './exportFormats';

export interface ExportOptions {
  format: 'csv' | 'json';
}

export async function exportExpenses(
  expenses: Expense[],
  categories: Category[],
  options: ExportOptions = { format: 'csv' }
): Promise<boolean> {
  try {
    const filename = `nana-expenses-${todayString()}.${options.format}`;
    const content = options.format === 'csv'
      ? expensesToCsv(expenses, categories)
      : expensesToJson(expenses, categories);
    const mimeType = options.format === 'csv' ? 'text/csv' : 'application/json';

    if (Platform.OS === 'web') {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }

    // SDK 54 moved the string-path API to expo-file-system/legacy.
    const FileSystem = await import('expo-file-system/legacy');
    const Sharing = await import('expo-sharing');

    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: 'Nana Expenses Export',
      });
    }

    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}
