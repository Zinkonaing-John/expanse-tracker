import type { LocalePack } from '../types';
import { KOREAN_STRINGS } from './strings-ko';

export const koPack: LocalePack = {
  code: 'ko',
  currency: 'KRW',
  currencyLocale: 'ko-KR',
  speechLocale: 'ko-KR',
  strings: KOREAN_STRINGS,
  parserConfig: {
    wakeWordPattern: /^\s*(?:hey|ok|okay)?[,\s]*nana[,\s]*/i,
    currencySymbols: ['원', '₩', 'krw', '달러'],
    amountPatterns: [
      /₩\s*(\d{1,3}(?:,\d{3})*|\d+)/,
      /(\d{1,3}(?:,\d{3})*|\d+)\s*원/,
      /(?:은|는|이|가|에|으로)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*원?/,
      /(?:^|\s)(\d{1,3}(?:,\d{3})*|\d{1,7})(?:\s*원|\s|$)/,
    ],
    categoryKeywords: {
      food: ['음식', '점심', '저녁', '아침', '식사', '밥', '식당', 'lunch', 'dinner', 'food'],
      coffee: ['커피', '카페', '라떼', '스타벅스', '차', 'coffee', 'cafe'],
      transport: ['교통', '택시', '버스', '지하철', '기름', '주차', 'uber', 'taxi', 'gas'],
      shopping: ['쇼핑', '옷', '신발', '마트', 'shopping', 'amazon'],
      entertainment: ['영화', '공연', '게임', '넷플릭스', 'movie', 'netflix', 'concert'],
      bills: ['청구서', '월세', '전기', '수도', '인터넷', '전화', 'bill', 'rent'],
      health: ['건강', '병원', '약', '의사', '헬스', 'doctor', 'pharmacy', 'gym'],
      other: [],
    },
  },
};
