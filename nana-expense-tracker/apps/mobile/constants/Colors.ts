const tintColorLight = '#3398ff';
const tintColorDark = '#59b8ff';

export default {
  light: {
    text: '#0f172a',
    textSecondary: '#64748b',
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    border: '#e2e8f0',
    tint: tintColorLight,
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    cardShadow: 'rgba(15, 23, 42, 0.08)',
  },
  dark: {
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    border: '#334155',
    tint: tintColorDark,
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    cardShadow: 'rgba(0, 0, 0, 0.3)',
  },
} as const;
