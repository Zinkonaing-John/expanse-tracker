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

export function getCurrencySymbol(localeCode: LocaleCode): string {
  const { currency, locale } = CURRENCY_BY_LOCALE[localeCode];
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).formatToParts(0);
  return parts.find((p) => p.type === 'currency')?.value ?? '$';
}
