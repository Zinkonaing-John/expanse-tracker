/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Electric cyan — primary futuristic accent
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Violet — secondary accent
        accent: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Deep-space neutrals
        space: {
          50: '#eef2f9',
          100: '#e4eaf4',
          200: '#cdd8e9',
          300: '#a4b4cd',
          400: '#7d8ca6',
          500: '#5b6b83',
          600: '#3d4c66',
          700: '#26334b',
          800: '#131d33',
          850: '#0d1526',
          900: '#0a1122',
          950: '#050a16',
        },
        mint: {
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          900: '#064e3b',
        },
        coral: {
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          900: '#7c2d12',
        },
        success: {
          light: '#dcfce7',
          DEFAULT: '#22c55e',
          dark: '#15803d',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
        error: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
