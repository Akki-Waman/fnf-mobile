// src/theme/ThemeContext.tsx
import React, { createContext, useContext } from 'react';
import { colors, Colors } from './colors';
import { typography, Typography } from './typography';
import { spacing, borderRadius, Spacing, BorderRadius } from './spacing';
import { shadows, Shadows } from './shadows';

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

export const theme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

const ThemeContext = createContext<Theme>(theme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
