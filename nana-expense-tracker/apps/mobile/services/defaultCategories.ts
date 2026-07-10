import type { Category } from '@/types/expense';
import type { CategoryKey } from '@/i18n/types';
import type { ParsedExpenseCommand } from '@/i18n/parser';

/**
 * Default categories seeded on first launch. IDs are stable slugs so voice
 * parsing and i18n can resolve categories across languages.
 */
export const DEFAULT_CATEGORIES: (Omit<Category, 'id'> & { slug: CategoryKey })[] = [
  { slug: 'food', name: 'Food', icon: 'silverware-fork-knife', color: '#f97316', isDefault: true },
  { slug: 'coffee', name: 'Coffee', icon: 'coffee', color: '#92400e', isDefault: true },
  { slug: 'transport', name: 'Transport', icon: 'car', color: '#3b82f6', isDefault: true },
  { slug: 'shopping', name: 'Shopping', icon: 'shopping', color: '#ec4899', isDefault: true },
  { slug: 'entertainment', name: 'Entertainment', icon: 'movie-open', color: '#a855f7', isDefault: true },
  { slug: 'bills', name: 'Bills', icon: 'file-document-outline', color: '#ef4444', isDefault: true },
  { slug: 'health', name: 'Health', icon: 'pill', color: '#22c55e', isDefault: true },
  { slug: 'other', name: 'Other', icon: 'package-variant-closed', color: '#6b7280', isDefault: true },
];

export function resolveCategoryIdByKey(
  key: CategoryKey,
  categories: Category[]
): string | null {
  const bySlug = categories.find((c) => c.id === key);
  if (bySlug) return bySlug.id;
  const englishName = DEFAULT_CATEGORIES.find((c) => c.slug === key)?.name;
  if (englishName) {
    const byName = categories.find((c) => c.name.toLowerCase() === englishName.toLowerCase());
    if (byName) return byName.id;
  }
  return null;
}

/** Pick a category for voice input — keyword match is optional; defaults to Other. */
export function resolveCategoryFromVoice(
  parsed: ParsedExpenseCommand,
  categories: Category[]
): string {
  if (parsed.category) {
    const byKey = resolveCategoryIdByKey(parsed.category, categories);
    if (byKey) return byKey;
  }

  const spoken = parsed.description?.trim().toLowerCase();
  if (spoken) {
    const byId = categories.find((c) => c.id.toLowerCase() === spoken);
    if (byId) return byId.id;
    const byName = categories.find((c) => c.name.toLowerCase() === spoken);
    if (byName) return byName.id;
  }

  return categories.find((c) => c.id === 'other')?.id ?? categories[0]?.id ?? 'other';
}
