import type { LocalePack } from '../types';
import { MYANMAR_STRINGS } from './strings-my';

export const myPack: LocalePack = {
  code: 'my',
  currency: 'MMK',
  currencyLocale: 'my-MM',
  speechLocale: 'my-MM',
  strings: MYANMAR_STRINGS,
  parserConfig: {
    wakeWordPattern: /^\s*(?:hey|ok|okay)?[,\s]*nana[,\s]*/i,
    currencySymbols: ['ကျပ်', 'ks', 'mmk', 'ထောင်'],
    amountMultipliers: [
      { pattern: /([၀-၉\d]+(?:\.\d+)?)\s*ထောင်/i, multiplier: 1000 },
    ],
    amountPatterns: [
      /([၀-၉\d]{1,3}(?:,\d{3})*(?:\.\d{1,2})?|[၀-၉\d]+(?:\.\d{1,2})?)\s*(?:ကျပ်|ks)/i,
      /(?:သည်|မှာ|သုံးခဲ့|ပေးခဲ့|အတွက်)\s*([၀-၉\d]+(?:\.\d+)?)/,
      /(?:^|\s)([၀-၉\d]{1,3}(?:,\d{3})*(?:\.\d{1,2})?|[၀-၉\d]+(?:\.\d{1,2})?|[၀-၉\d]{1,6})(?:\s|$)/,
    ],
    categoryKeywords: {
      food: ['အစား', 'နေ့လည်စာ', 'ညစာ', 'မနက်စာ', 'ထမင်း', 'စားသောက်', 'စားဖိုယ်', 'restaurant', 'lunch', 'dinner'],
      coffee: ['ကော်ဖီ', 'လက်ဖက်ရည်', 'နှစ်သက်ရာ', 'coffee', 'cafe', 'tea'],
      transport: ['ကား', 'ဘတ်စ်', 'ရထား', 'ယာဉ်', 'သယ်ယူ', 'ဆီဖိုး', 'taxi', 'uber', 'gas'],
      shopping: ['ဈေး', 'ဝယ်', 'ဈေးဝယ်', 'shopping', 'clothes', 'shoes'],
      entertainment: ['ရုပ်ရှင်', 'ဖျော်ဖြေ', 'ဂိမ်း', 'movie', 'netflix', 'concert'],
      bills: ['ငွေတန်း', 'လျှပ်စစ်', 'ရေ', 'အင်တာနက်', 'ဖုန်း', 'bill', 'rent', 'utility'],
      health: ['ကျန်းမာ', 'ဆေး', 'ဆေးရုံ', 'ဆရာဝန်', 'doctor', 'pharmacy', 'gym'],
      other: [],
    },
  },
};
