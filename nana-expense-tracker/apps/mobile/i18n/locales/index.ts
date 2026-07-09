import type { LocaleCode, LocalePack } from '../types';
import { enPack } from './en';
import { koPack } from './ko';
import { myPack } from './my';
import { kmPack } from './km';
import { zhPack } from './zh';

const PACKS: Record<LocaleCode, LocalePack> = {
  en: enPack,
  ko: koPack,
  my: myPack,
  km: kmPack,
  zh: zhPack,
};

export function getLocalePack(code: LocaleCode): LocalePack {
  return PACKS[code] ?? enPack;
}

export function getAllLocalePacks(): LocalePack[] {
  return Object.values(PACKS);
}

export { enPack, koPack, myPack, kmPack, zhPack };
