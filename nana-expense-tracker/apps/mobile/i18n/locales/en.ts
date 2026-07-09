import type { LocalePack } from '../types';
import { buildEnglishParserConfig } from '../parser-configs/en';
import { ENGLISH_STRINGS } from './strings-en';

export const enPack: LocalePack = {
  code: 'en',
  currency: 'USD',
  currencyLocale: 'en-US',
  speechLocale: 'en-US',
  strings: ENGLISH_STRINGS,
  parserConfig: buildEnglishParserConfig(),
};
