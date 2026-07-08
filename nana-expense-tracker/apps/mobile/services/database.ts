import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import type { Expense, Category, CreateExpenseInput, UpdateExpenseInput, ExpenseFilter, ExpenseSummary } from '@/types/expense';

const DB_NAME = 'nana.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      isDefault INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      receiptUri TEXT,
      inputMethod TEXT NOT NULL CHECK (inputMethod IN ('voice', 'camera', 'manual')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category) REFERENCES categories(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  `);

  const existingCategories = await database.getAllAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );

  if (existingCategories[0].count === 0) {
    await seedDefaultCategories(database);
  }
}

async function seedDefaultCategories(database: SQLite.SQLiteDatabase): Promise<void> {
  const defaultCategories: Omit<Category, 'id'>[] = [
    { name: 'Food', icon: '🍔', color: '#f97316', isDefault: true },
    { name: 'Coffee', icon: '☕', color: '#92400e', isDefault: true },
    { name: 'Transport', icon: '🚗', color: '#3b82f6', isDefault: true },
    { name: 'Shopping', icon: '🛍️', color: '#ec4899', isDefault: true },
    { name: 'Entertainment', icon: '🎬', color: '#a855f7', isDefault: true },
    { name: 'Bills', icon: '📄', color: '#ef4444', isDefault: true },
    { name: 'Health', icon: '💊', color: '#22c55e', isDefault: true },
    { name: 'Other', icon: '📦', color: '#6b7280', isDefault: true },
  ];

  for (const category of defaultCategories) {
    await database.runAsync(
      `INSERT INTO categories (id, name, icon, color, isDefault) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), category.name, category.icon, category.color, category.isDefault ? 1 : 0]
    );
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Category & { isDefault: number }>(
    'SELECT * FROM categories ORDER BY name'
  );
  return rows.map(row => ({ ...row, isDefault: Boolean(row.isDefault) }));
}

export async function getCategoryByName(name: string): Promise<Category | null> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Category & { isDefault: number }>(
    'SELECT * FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1',
    [name]
  );
  if (rows.length === 0) return null;
  return { ...rows[0], isDefault: Boolean(rows[0].isDefault) };
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const database = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  await database.runAsync(
    `INSERT INTO expenses (id, amount, category, description, date, receiptUri, inputMethod, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.amount, input.category, input.description, input.date, input.receiptUri || null, input.inputMethod, now, now]
  );

  return {
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense | null> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  const setClauses: string[] = ['updatedAt = ?'];
  const values: any[] = [now];

  if (input.amount !== undefined) {
    setClauses.push('amount = ?');
    values.push(input.amount);
  }
  if (input.category !== undefined) {
    setClauses.push('category = ?');
    values.push(input.category);
  }
  if (input.description !== undefined) {
    setClauses.push('description = ?');
    values.push(input.description);
  }
  if (input.date !== undefined) {
    setClauses.push('date = ?');
    values.push(input.date);
  }
  if (input.receiptUri !== undefined) {
    setClauses.push('receiptUri = ?');
    values.push(input.receiptUri);
  }
  if (input.inputMethod !== undefined) {
    setClauses.push('inputMethod = ?');
    values.push(input.inputMethod);
  }

  values.push(id);

  await database.runAsync(
    `UPDATE expenses SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );

  return getExpenseById(id);
}

export async function deleteExpense(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getExpenses(filter?: ExpenseFilter): Promise<Expense[]> {
  const database = await getDatabase();
  let query = 'SELECT * FROM expenses WHERE 1=1';
  const params: any[] = [];

  if (filter?.startDate) {
    query += ' AND date >= ?';
    params.push(filter.startDate);
  }
  if (filter?.endDate) {
    query += ' AND date <= ?';
    params.push(filter.endDate);
  }
  if (filter?.category) {
    query += ' AND category = ?';
    params.push(filter.category);
  }
  if (filter?.minAmount !== undefined) {
    query += ' AND amount >= ?';
    params.push(filter.minAmount);
  }
  if (filter?.maxAmount !== undefined) {
    query += ' AND amount <= ?';
    params.push(filter.maxAmount);
  }

  query += ' ORDER BY date DESC, createdAt DESC';

  return database.getAllAsync<Expense>(query, params);
}

export async function getExpenseSummary(startDate: string, endDate: string): Promise<ExpenseSummary> {
  const database = await getDatabase();

  const totalResult = await database.getAllAsync<{ total: number; count: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count 
     FROM expenses 
     WHERE date >= ? AND date <= ?`,
    [startDate, endDate]
  );

  const byCategoryResult = await database.getAllAsync<{ category: string; total: number; count: number }>(
    `SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count 
     FROM expenses 
     WHERE date >= ? AND date <= ?
     GROUP BY category`,
    [startDate, endDate]
  );

  const byCategory: Record<string, { total: number; count: number }> = {};
  for (const row of byCategoryResult) {
    byCategory[row.category] = { total: row.total, count: row.count };
  }

  return {
    total: totalResult[0]?.total || 0,
    count: totalResult[0]?.count || 0,
    byCategory,
  };
}

export async function getTodayTotal(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const summary = await getExpenseSummary(today, today);
  return summary.total;
}

export async function getWeekTotal(): Promise<number> {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  const summary = await getExpenseSummary(
    weekStart.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  );
  return summary.total;
}

export async function getMonthTotal(): Promise<number> {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const summary = await getExpenseSummary(
    monthStart.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  );
  return summary.total;
}

export async function clearAllData(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync('DELETE FROM expenses');
}
