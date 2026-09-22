// src/components/Card.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'subtle';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 16,
}) => {
  const { colors, borderRadius, shadows } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'subtle':
        return {
          backgroundColor: colors.surfaceSubtle,
          borderWidth: 0,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surface,
          ...shadows.sm,
        };
    }
  };

  const cardStyle: ViewStyle = {
    borderRadius: borderRadius.xl,
    padding,
    ...getVariantStyles(),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.container, cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.container, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
});
