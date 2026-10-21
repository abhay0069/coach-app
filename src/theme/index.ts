export const lightTheme = {
  dark: false,
  colors: {
    background: '#F7F8FB',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F2F7',
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    borderAlt: '#CBD5E1',
    cardShadow: 'rgba(15, 23, 42, 0.06)',
    progressBg: '#E2E8F0',
    streak: '#F59E0B',
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: '#0B0F19',
    surface: '#151A2B',
    surfaceAlt: '#1E2338',
    primary: '#818CF8',
    primaryDark: '#6366F1',
    primaryLight: '#A5B4FC',
    accent: '#F472B6',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: '#2A3147',
    borderAlt: '#3B435F',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    progressBg: '#2A3147',
    streak: '#FBBF24',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '700' as const },
  h4: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '500' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
};

export type Theme = typeof lightTheme;
