// Futuristic palette: electric cyan primary, violet accent, deep-space neutrals.
const tintColorLight = '#0891b2';
const tintColorDark = '#22d3ee';

export const Accent = {
  cyan: '#22d3ee',
  cyanDark: '#0891b2',
  violet: '#8b5cf6',
  violetDark: '#7c3aed',
  glow: 'rgba(34, 211, 238, 0.45)',
};

export default {
  light: {
    text: '#0b1220',
    textSecondary: '#5b6b83',
    background: '#eef2f9',
    backgroundSecondary: '#e4eaf4',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5fb',
    border: 'rgba(11, 18, 32, 0.08)',
    tint: tintColorLight,
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    cardShadow: 'rgba(11, 18, 32, 0.10)',
  },
  dark: {
    text: '#e8f0ff',
    textSecondary: '#7d8ca6',
    background: '#050a16',
    backgroundSecondary: '#0a1122',
    surface: '#0d1526',
    surfaceSecondary: '#131d33',
    border: 'rgba(148, 163, 184, 0.10)',
    tint: tintColorDark,
    tabIconDefault: '#54627e',
    tabIconSelected: tintColorDark,
    cardShadow: 'rgba(0, 0, 0, 0.5)',
  },
} as const;
