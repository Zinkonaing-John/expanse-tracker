/**
 * Parses natural-language expense commands like:
 *   "Lunch is $12.50"
 *   "Hey Nana, coffee 4.75"
 *   "spent 20 bucks on gas"
 *
 * Pure module (no react-native imports) so it can be unit tested in Node.
 */

export interface ParsedExpenseCommand {
  amount: number | null;
  /** Canonical category name matching the seeded defaults (e.g. "Coffee"). */
  category: string | null;
  description: string | null;
  confidence: number;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'snack', 'eat', 'eating', 'restaurant', 'groceries', 'grocery', 'pizza', 'burger'],
  Coffee: ['coffee', 'cafe', 'latte', 'espresso', 'cappuccino', 'starbucks', 'tea', 'boba'],
  Transport: ['transport', 'uber', 'lyft', 'taxi', 'cab', 'bus', 'train', 'subway', 'gas', 'fuel', 'parking', 'toll'],
  Shopping: ['shopping', 'shop', 'clothes', 'clothing', 'shoes', 'amazon', 'store', 'mall'],
  Entertainment: ['entertainment', 'movie', 'movies', 'concert', 'show', 'game', 'games', 'netflix', 'spotify', 'ticket', 'tickets'],
  Bills: ['bill', 'bills', 'rent', 'electricity', 'electric', 'water', 'internet', 'wifi', 'phone', 'utility', 'utilities', 'insurance', 'subscription'],
  Health: ['health', 'doctor', 'dentist', 'medicine', 'meds', 'pharmacy', 'hospital', 'gym', 'fitness', 'vitamins'],
  Other: [],
};

const WAKE_WORD_PATTERN = /^\s*(?:hey|ok|okay)?[,\s]*nana[,\s]*/i;

const AMOUNT_PATTERNS: RegExp[] = [
  // "$12.50", "$ 1,200"
  /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/,
  // "12.50 dollars", "20 bucks"
  /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?|usd)/i,
  // "is 12.50", "cost 20", "spent 15 on ..."
  /(?:is|was|costs?|spent|spend|paid|pay|for)\s+(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?!\s*(?:am|pm|st|nd|rd|th))/i,
  // bare number as a last resort: "coffee 4.75"
  /(?:^|\s)(\d{1,3}(?:,\d{3})*\.\d{1,2}|\d+\.\d{1,2}|\d{1,4})(?:\s|$)/,
];

export function parseAmount(text: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const parsed = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
        return parsed;
      }
    }
  }
  return null;
}

export function parseCategory(text: string): string | null {
  const lower = text.toLowerCase();
  let best: { category: string; index: number } | null = null;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      const match = lower.match(pattern);
      if (match && match.index !== undefined) {
        // Prefer the keyword that appears earliest in the sentence.
        if (!best || match.index < best.index) {
          best = { category, index: match.index };
        }
      }
    }
  }

  return best?.category ?? null;
}

export function parseExpenseCommand(text: string): ParsedExpenseCommand {
  const cleaned = text.replace(WAKE_WORD_PATTERN, '').trim();

  const amount = parseAmount(cleaned);
  const category = parseCategory(cleaned);

  const description =
    cleaned
      .replace(/\$\s*\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/g, '')
      .replace(/\b\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\s*(?:dollars?|bucks?|usd)\b/gi, '')
      .replace(/\b(?:is|was|costs?|spent|spend|paid|pay)\b/gi, '')
      .replace(/\b\d+(?:\.\d{1,2})?\b/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '')
      .trim() || null;

  const confidence = (amount ? 0.6 : 0) + (category ? 0.3 : 0) + (description ? 0.1 : 0);

  return { amount, category, description, confidence };
}
