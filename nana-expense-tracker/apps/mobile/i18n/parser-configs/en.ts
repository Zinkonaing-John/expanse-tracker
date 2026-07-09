import type { ParserConfig } from '../types';

export function buildEnglishParserConfig(): ParserConfig {
  return {
    wakeWordPattern: /^\s*(?:hey|ok|okay)?[,\s]*nana[,\s]*/i,
    currencySymbols: ['$', 'USD', 'dollar', 'dollars', 'buck', 'bucks'],
    amountPatterns: [
      /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?|usd)/i,
      /(?:is|was|costs?|spent|spend|paid|pay|for)\s+(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?!\s*(?:am|pm|st|nd|rd|th))/i,
      /(?:^|\s)(\d{1,3}(?:,\d{3})*\.\d{1,2}|\d+\.\d{1,2}|\d{1,4})(?:\s|$)/,
    ],
    categoryKeywords: {
      food: ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'snack', 'eat', 'eating', 'restaurant', 'groceries', 'grocery', 'pizza', 'burger'],
      coffee: ['coffee', 'cafe', 'latte', 'espresso', 'cappuccino', 'starbucks', 'tea', 'boba'],
      transport: ['transport', 'uber', 'lyft', 'taxi', 'cab', 'bus', 'train', 'subway', 'gas', 'fuel', 'parking', 'toll'],
      shopping: ['shopping', 'shop', 'clothes', 'clothing', 'shoes', 'amazon', 'store', 'mall'],
      entertainment: ['entertainment', 'movie', 'movies', 'concert', 'show', 'game', 'games', 'netflix', 'spotify', 'ticket', 'tickets'],
      bills: ['bill', 'bills', 'rent', 'electricity', 'electric', 'water', 'internet', 'wifi', 'phone', 'utility', 'utilities', 'insurance', 'subscription'],
      health: ['health', 'doctor', 'dentist', 'medicine', 'meds', 'pharmacy', 'hospital', 'gym', 'fitness', 'vitamins'],
      other: [],
    },
  };
}
