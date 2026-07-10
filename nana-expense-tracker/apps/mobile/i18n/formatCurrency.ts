import type { LocaleCode } from './types';

const CURRENCY_BY_LOCALE: Record<LocaleCode, { currency: string; locale: string }> = {
  en: { currency: 'USD', locale: 'en-US' },
  ko: { currency: 'KRW', locale: 'ko-KR' },
  my: { currency: 'MMK', locale: 'my-MM' },
  km: { currency: 'KHR', locale: 'km-KH' },
  zh: { currency: 'CNY', locale: 'zh-CN' },
};

export function formatCurrency(amount: number, localeCode: LocaleCode): string {
  const { currency, locale } = CURRENCY_BY_LOCALE[localeCode];
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: localeCode === 'ko' || localeCode === 'km' || localeCode === 'my' ? 0 : 2,
  }).format(amount);
}

const CURRENCY_SYMBOL_FALLBACK: Record<LocaleCode, string> = {
  en: '$',
  ko: '₩',
  my: 'K',
  km: '៛',
  zh: '¥',
};

export function getCurrencySymbol(localeCode: LocaleCode): string {
  const { currency, locale } = CURRENCY_BY_LOCALE[localeCode];
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });

  if (typeof formatter.formatToParts === 'function') {
    const parts = formatter.formatToParts(0);
    const symbol = parts.find((p) => p.type === 'currency')?.value;
    if (symbol) return symbol;
  }

  return CURRENCY_SYMBOL_FALLBACK[localeCode];
}
