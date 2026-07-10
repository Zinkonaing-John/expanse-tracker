import type { LocalePack } from '../types';
import { CHINESE_STRINGS } from './strings-zh';

export const zhPack: LocalePack = {
  code: 'zh',
  currency: 'CNY',
  currencyLocale: 'zh-CN',
  speechLocale: 'zh-CN',
  strings: CHINESE_STRINGS,
  parserConfig: {
    wakeWordPattern: /^\s*(?:hey|ok|okay)?[,\s]*nana[,\s]*/i,
    currencySymbols: ['元', '¥', '块', 'rmb', 'cny', '美元'],
    amountPatterns: [
      /¥\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*元/,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*块/,
      /(?:花了|用了|付了|是)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/,
      /(?:^|\s)(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?:\s*元|\s|$)/,
    ],
    categoryKeywords: {
      food: ['午餐', '晚餐', '早餐', '吃饭', '餐饮', '外卖', '饭', 'food', 'lunch', 'dinner'],
      coffee: ['咖啡', '奶茶', '茶', '星巴克', 'coffee', 'cafe', 'tea'],
      transport: ['交通', '打车', '地铁', '公交', '出租车', '油', '停车', 'uber', 'taxi', 'gas'],
      shopping: ['购物', '买', '衣服', '鞋', 'shopping', 'amazon'],
      entertainment: ['电影', '娱乐', '游戏', '票', 'movie', 'netflix', 'concert'],
      bills: ['账单', '房租', '水电', '网费', '电话', 'bill', 'rent', 'utility'],
      health: ['健康', '医院', '药', '医生', '健身', 'doctor', 'pharmacy', 'gym'],
      other: [],
    },
  },
};
