// src/components/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true,
}) => {
  const { colors, typography, borderRadius, shadows } = useTheme();

  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';

  // Size configurations
  const height = size === 'sm' ? 38 : size === 'lg' ? 56 : 48;
  const fontSize = size === 'sm' ? typography.fontSize.sm : size === 'lg' ? typography.fontSize.lg : typography.fontSize.md;
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (isPrimary) return colors.white;
    if (isSecondary) return colors.primary;
    if (isOutline) return colors.primary;
    if (isGhost) return colors.textSecondary;
    return colors.white;
  };

  const textColor = getTextColor();

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={iconSize} color={textColor} style={styles.iconLeft} />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize,
                fontWeight: typography.fontWeight.semibold,
                color: textColor,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={iconSize} color={textColor} style={styles.iconRight} />
          )}
        </>
      )}
    </>
  );

  const containerStyle: ViewStyle = {
    height,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    opacity: disabled ? 0.6 : 1,
    alignSelf: fullWidth ? 'stretch' : 'auto',
  };

  if (isPrimary && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={[shadows.primaryGlow, fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={containerStyle}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getBackgroundColor = () => {
    if (isSecondary) return colors.surfaceSubtle;
    if (isOutline) return colors.transparent;
    if (isGhost) return colors.transparent;
    return colors.surfaceSubtle;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        containerStyle,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: isOutline ? 1.5 : 0,
          borderColor: isOutline ? colors.primary : 'transparent',
        },
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
