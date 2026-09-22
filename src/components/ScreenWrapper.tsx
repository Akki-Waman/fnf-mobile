// src/components/ScreenWrapper.tsx
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  useGradient?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  keyboardAvoiding?: boolean;
  statusBarColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  useGradient = false,
  style,
  contentContainerStyle,
  keyboardAvoiding = true,
  statusBarStyle = 'dark-content',
}) => {
  const { colors } = useTheme();

  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flexOne, contentContainerStyle]}>{children}</View>
  );

  const inner = (
    <SafeAreaView style={[styles.flexOne, style]}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flexOne}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );

  if (useGradient) {
    return (
      <LinearGradient colors={colors.gradientPrimary} style={styles.flexOne}>
        <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent />
        {inner}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.flexOne, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent />
      {inner}
    </View>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
