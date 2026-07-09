import type { CategoryKey, LocaleCode, ParserConfig } from './types';
import { getLocalePack } from './locales/index';

export interface ParsedExpenseCommand {
  amount: number | null;
  /** Canonical category key (food, coffee, …). */
  category: CategoryKey | null;
  description: string | null;
  confidence: number;
}

function normalizeDigits(text: string): string {
  const myanmarDigits = '၀၁၂၃၄၅၆၇၈၉';
  return text.replace(/[၀-၉]/g, (ch) => String(myanmarDigits.indexOf(ch)));
}

export function parseAmount(text: string, locale: LocaleCode = 'en'): number | null {
  const normalized = normalizeDigits(text);
  const config = getLocalePack(locale).parserConfig;

  for (const { pattern, multiplier } of config.amountMultipliers ?? []) {
    const match = normalized.match(pattern);
    if (match) {
      const parsed = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0 && parsed * multiplier < 100000000) {
        return parsed * multiplier;
      }
    }
  }

  for (const pattern of config.amountPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const raw = match[1].replace(/,/g, '');
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000000) {
        return parsed;
      }
    }
  }
  return null;
}

export function parseCategory(text: string, locale: LocaleCode = 'en'): CategoryKey | null {
  const lower = text.toLowerCase();
  let best: { category: CategoryKey; index: number } | null = null;
  const config = getLocalePack(locale).parserConfig;

  for (const [category, keywords] of Object.entries(config.categoryKeywords) as [CategoryKey, string[]][]) {
    for (const keyword of keywords) {
      const pattern = new RegExp(keyword, 'i');
      const match = lower.match(pattern) ?? text.match(pattern);
      if (match && match.index !== undefined) {
        if (!best || match.index < best.index) {
          best = { category, index: match.index };
        }
      }
    }
  }

  return best?.category ?? null;
}

export function parseExpenseCommand(text: string, locale: LocaleCode = 'en'): ParsedExpenseCommand {
  const config = getLocalePack(locale).parserConfig;
  const cleaned = text.replace(config.wakeWordPattern, '').trim();
  const normalized = normalizeDigits(cleaned);

  const amount = parseAmount(normalized, locale);
  const category = parseCategory(cleaned, locale);

  let descWork = cleaned;
  for (const pattern of config.amountPatterns) {
    descWork = descWork.replace(pattern, ' ');
  }
  for (const symbols of config.currencySymbols) {
    descWork = descWork.replace(new RegExp(symbols.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
  }
  const description: string | null =
    descWork
      .replace(/\b(?:is|was|costs?|spent|spend|paid|pay|for)\b/gi, ' ')
      .replace(/\b\d+(?:\.\d{1,2})?\b/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '')
      .trim() || null;

  const confidence = (amount ? 0.6 : 0) + (category ? 0.3 : 0) + (description ? 0.1 : 0);

  return { amount, category, description, confidence };
}
