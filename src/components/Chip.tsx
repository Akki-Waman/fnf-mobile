// src/components/Chip.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle';
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  variant = 'subtle',
  style,
}) => {
  const { colors, typography, borderRadius, spacing } = useTheme();

  const getColors = () => {
    if (selected) {
      return {
        bg: colors.primary,
        text: colors.white,
        border: colors.primary,
      };
    }
    switch (variant) {
      case 'primary':
        return { bg: colors.surfaceHighlighted, text: colors.primary, border: colors.primaryLight };
      case 'outline':
        return { bg: colors.transparent, text: colors.textSecondary, border: colors.border };
      case 'subtle':
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary, border: colors.surfaceSubtle };
    }
  };

  const currentColors = getColors();

  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: currentColors.bg,
          borderColor: currentColors.border,
          borderRadius: borderRadius.full,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={currentColors.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: currentColors.text,
            fontSize: typography.fontSize.sm,
            fontWeight: selected ? typography.fontWeight.semibold : typography.fontWeight.medium,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  chip: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    textAlign: 'center',
  },
});
