// src/theme/colors.ts

export const colors = {
  // Brand Primary & Gradients
  primary: '#FF5F6D',
  primaryDark: '#E04856',
  primaryLight: '#FF808C',
  accent: '#FFC371',
  accentPurple: '#7C3AED',
  accentBlue: '#3B82F6',

  // Gradients
  gradientPrimary: ['#FF5F6D', '#FFC371'] as const,
  gradientPurple: ['#8B5CF6', '#EC4899'] as const,
  gradientDark: ['#1F2937', '#111827'] as const,
  gradientGlass: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.75)'] as const,

  // Background & Surfaces
  background: '#F8FAFC',
  backgroundPure: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceHighlighted: '#FFF5F5',
  cardBackground: '#FFFFFF',

  // Typography & Text Colors
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textLight: '#F8FAFC',
  textOnPrimary: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderFocus: '#FF5F6D',
  divider: '#F1F5F9',

  // Status & Feedback
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.5)',
};

export type Colors = typeof colors;