// src/components/Header.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  rightIcon,
  onRightIconPress,
  rightComponent,
  style,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.md }, style]}>
      <View style={styles.left}>
        {onBackPress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: colors.surfaceSubtle }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            numberOfLines={1}
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSize.xs,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        {rightComponent}
        {rightIcon && !rightComponent && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRightIconPress}
            style={[styles.actionButton, { backgroundColor: colors.surfaceSubtle }]}
          >
            <Ionicons name={rightIcon} size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 2,
  },
});
