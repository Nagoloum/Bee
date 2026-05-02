// Design tokens partagés entre web et mobile.
// Source de vérité : bee-design-system.md à la racine.
// Les composants concrets vivent dans chaque app (HTML web vs RN mobile).

export const colors = {
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  secondary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  semantic: {
    success: '#10B981',
    successBg: '#D1FAE5',
    error: '#EF4444',
    errorBg: '#FEE2E2',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    info: '#3B82F6',
    infoBg: '#DBEAFE',
  },
  light: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
  },
  dark: {
    bg: '#0F172A',
    surface: '#1E293B',
    surfaceMuted: '#334155',
    border: '#334155',
    borderStrong: '#475569',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const;

export const typography = {
  fonts: {
    display: 'Poppins',
    body: 'Inter',
  },
  weights: {
    body: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(15, 23, 42, 0.04)',
  md: '0 4px 12px rgba(15, 23, 42, 0.06)',
  lg: '0 10px 32px rgba(15, 23, 42, 0.08)',
} as const;

export const tokens = {
  colors,
  radius,
  spacing,
  typography,
  shadows,
} as const;

export type BeeTokens = typeof tokens;
