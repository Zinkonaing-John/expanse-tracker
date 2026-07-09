import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import type { LocaleCode, LocalePack, LocaleStrings, CategoryKey } from './types';
import { getLocalePack } from './locales';
import { formatCurrency as formatCurrencyForLocale, getCurrencySymbol } from './formatCurrency';
import { parseExpenseCommand, type ParsedExpenseCommand } from './parser';
import { usePersistedLocale } from '@/hooks/usePersistedLocale';

type LocaleContextValue = {
  locale: LocaleCode;
  pack: LocalePack;
  setLocale: (code: LocaleCode) => void;
  t: (key: keyof LocaleStrings, replacements?: Record<string, string>) => string;
  formatCurrency: (amount: number) => string;
  currencySymbol: string;
  parseCommand: (text: string) => ParsedExpenseCommand;
  categoryLabel: (key: CategoryKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = usePersistedLocale('en');
  const pack = useMemo(() => getLocalePack(locale), [locale]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
  }, [setLocaleState]);

  const t = useCallback(
    (key: keyof LocaleStrings, replacements?: Record<string, string>) => {
      let value = pack.strings[key];
      if (typeof value !== 'string') {
        return String(key);
      }
      if (replacements) {
        for (const [k, v] of Object.entries(replacements)) {
          value = value.replace(`{${k}}`, v);
        }
      }
      return value;
    },
    [pack]
  );

  const formatCurrency = useCallback(
    (amount: number) => formatCurrencyForLocale(amount, locale),
    [locale]
  );

  const currencySymbol = useMemo(() => getCurrencySymbol(locale), [locale]);

  const parseCommand = useCallback((text: string) => parseExpenseCommand(text, locale), [locale]);

  const categoryLabel = useCallback(
    (key: CategoryKey) => pack.strings.categories[key],
    [pack]
  );

  const value = useMemo(
    () => ({
      locale,
      pack,
      setLocale,
      t,
      formatCurrency,
      currencySymbol,
      parseCommand,
      categoryLabel,
    }),
    [locale, pack, setLocale, t, formatCurrency, currencySymbol, parseCommand, categoryLabel]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
