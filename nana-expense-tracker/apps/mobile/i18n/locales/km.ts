import type { LocalePack } from '../types';
import { KHMER_STRINGS } from './strings-km';

export const kmPack: LocalePack = {
  code: 'km',
  currency: 'KHR',
  currencyLocale: 'km-KH',
  speechLocale: 'km-KH',
  strings: KHMER_STRINGS,
  parserConfig: {
    wakeWordPattern: /^\s*(?:hey|ok|okay)?[,\s]*nana[,\s]*/i,
    currencySymbols: ['រៀល', '៛', 'khr', 'riel'],
    amountPatterns: [
      /៛\s*(\d{1,3}(?:,\d{3})*|\d+)/,
      /(\d{1,3}(?:,\d{3})*|\d+)\s*រៀល/,
      /(\d{1,3}(?:,\d{3})*|\d+)\s*៛/,
      /(?:^|\s)([០-៩\d]{1,3}(?:,\d{3})*|[០-៩\d]{1,8})(?:\s*រៀល|\s|$)/,
    ],
    categoryKeywords: {
      food: ['អាហារ', 'បាយ', 'ម្ហូប', 'អាហារថ្ងៃត្រង់', 'អាហារពេលល្ងាច', 'food', 'lunch', 'dinner'],
      coffee: ['កាហ្វេ', 'តែ', 'coffee', 'cafe'],
      transport: ['ដឹកជញ្ជូន', 'តាក់ស៊ី', 'ឡានក្រុង', 'សាំង', 'taxi', 'uber', 'bus'],
      shopping: ['ទិញ', 'ផ្សារ', 'shopping', 'clothes'],
      entertainment: ['កម្សាន្ត', 'ភាពយន្ត', 'ហ្គេម', 'movie', 'netflix'],
      bills: ['វិក្កយបត្រ', 'ភ្លើង', 'ទឹក', 'អ៊ីនធឺណិត', 'bill', 'rent'],
      health: ['សុខភាព', 'ពេទ្យ', 'ថ្នាំ', 'មន្ទីរពេទ្យ', 'doctor', 'pharmacy'],
      other: [],
    },
  },
};
