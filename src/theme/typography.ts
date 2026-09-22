// src/theme/typography.ts
import { TextStyle } from 'react-native';

export const typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  fontWeight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    heavy: '800' as TextStyle['fontWeight'],
  },
  lineHeight: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
    xxl: 36,
    display: 42,
  },
};

export type Typography = typeof typography;
