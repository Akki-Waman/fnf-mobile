// src/components/Avatar.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

export interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  online?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  online,
  style,
}) => {
  const { colors, typography, borderRadius } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 36;
      case 'lg':
        return 64;
      case 'xl':
        return 88;
      case 'md':
      default:
        return 48;
    }
  };

  const dim = getDimension();
  const radius = dim / 2;
  const fontSize = dim * 0.4;

  const getInitials = () => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const showImage = Boolean(source) && !imageError;

  return (
    <View style={[{ width: dim, height: dim, borderRadius: radius, overflow: 'hidden' }, style]}>
      {showImage ? (
        <>
          <Image
            source={{ uri: source! }}
            style={{ width: dim, height: dim, borderRadius: radius }}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
          {imageLoading && (
            <View style={[styles.loadingOverlay, { width: dim, height: dim, borderRadius: radius }]}>
              <ActivityIndicator size="small" color={colors.primary || '#FF6B8A'} />
            </View>
          )}
        </>
      ) : (
        <LinearGradient
          colors={colors.gradientPrimary}
          style={[
            styles.fallback,
            { width: dim, height: dim, borderRadius: radius },
          ]}
        >
          <Text
            style={{
              color: colors.white,
              fontSize,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            {getInitials()}
          </Text>
        </LinearGradient>
      )}

      {online !== undefined && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: online ? colors.success : colors.textMuted,
              borderColor: colors.white,
              borderWidth: 2,
              width: Math.max(12, dim * 0.28),
              height: Math.max(12, dim * 0.28),
              borderRadius: borderRadius.full,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
