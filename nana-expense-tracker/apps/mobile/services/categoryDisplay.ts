import type { Category } from '@/types/expense';
import type { CategoryKey } from '@/i18n/types';
import { CATEGORY_KEYS } from '@/i18n/types';

export function isCategoryKey(id: string): id is CategoryKey {
  return (CATEGORY_KEYS as string[]).includes(id);
}

export function getCategoryDisplayName(
  category: Category | undefined,
  label: (key: CategoryKey) => string
): string {
  if (!category) return 'Unknown';
  if (isCategoryKey(category.id)) {
    return label(category.id);
  }
  return category.name;
}
