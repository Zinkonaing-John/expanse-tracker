import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocaleCode } from '@/i18n/types';
import { LOCALE_CODES } from '@/i18n/types';

const STORAGE_KEY = 'nana.settings.locale';

function isLocaleCode(value: string): value is LocaleCode {
  return (LOCALE_CODES as string[]).includes(value);
}

export function usePersistedLocale(defaultLocale: LocaleCode = 'en') {
  const [locale, setLocale] = useState<LocaleCode>(defaultLocale);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && stored && isLocaleCode(stored)) {
          setLocale(stored);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((next: LocaleCode) => {
    setLocale(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  return [locale, update, hydrated] as const;
}
