const tintColorLight = '#0ea5e9';
const tintColorDark = '#38bdf8';

export default {
  light: {
    text: '#1f2937',
    background: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffffff',
    background: '#111827',
    tint: tintColorDark,
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
  },
} as const;
