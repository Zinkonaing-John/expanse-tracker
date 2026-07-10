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
      if (!isNaN(parsed) && parsed > 0) {
        return parsed * multiplier;
      }
    }
  }

  for (const pattern of config.amountPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const raw = match[1].replace(/,/g, '');
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return null;
}

function parseSpokenName(
  cleaned: string,
  normalized: string,
  locale: LocaleCode,
  amount: number | null
): string | null {
  const config = getLocalePack(locale).parserConfig;
  let name = cleaned;

  if (amount !== null) {
    for (const { pattern, multiplier } of config.amountMultipliers ?? []) {
      const match = normalized.match(pattern);
      if (match) {
        const parsed = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(parsed) && Math.abs(parsed * multiplier - amount) < 0.001) {
          name = name.replace(match[0], ' ');
          break;
        }
      }
    }

    if (name === cleaned) {
      for (const pattern of config.amountPatterns) {
        const match = normalized.match(pattern);
        if (match) {
          const parsed = parseFloat(match[1].replace(/,/g, ''));
          if (!isNaN(parsed) && Math.abs(parsed - amount) < 0.001) {
            name = name.replace(match[0], ' ');
            break;
          }
        }
      }
    }
  }

  for (const symbols of config.currencySymbols) {
    name = name.replace(new RegExp(symbols.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
  }

  const result = name
    .replace(/\b(?:is|was|costs?|spent|spend|paid|pay|for)\b/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '')
    .trim();

  return result || null;
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
  const description = parseSpokenName(cleaned, normalized, locale, amount);

  const confidence = (amount ? 0.7 : 0) + (description ? 0.2 : 0) + (category ? 0.1 : 0);

  return { amount, category, description, confidence };
}
