import type { Category } from '@/types/expense';

/**
 * Default categories seeded on first launch. The `icon` values are Material
 * Community Icons glyph names (the UI resolves icons via CategoryIcon).
 */
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food', icon: 'silverware-fork-knife', color: '#f97316', isDefault: true },
  { name: 'Coffee', icon: 'coffee', color: '#92400e', isDefault: true },
  { name: 'Transport', icon: 'car', color: '#3b82f6', isDefault: true },
  { name: 'Shopping', icon: 'shopping', color: '#ec4899', isDefault: true },
  { name: 'Entertainment', icon: 'movie-open', color: '#a855f7', isDefault: true },
  { name: 'Bills', icon: 'file-document-outline', color: '#ef4444', isDefault: true },
  { name: 'Health', icon: 'pill', color: '#22c55e', isDefault: true },
  { name: 'Other', icon: 'package-variant-closed', color: '#6b7280', isDefault: true },
];
