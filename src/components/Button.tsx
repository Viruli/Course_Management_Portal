import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ghost-on-dark' | 'lime';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

const sizeMap: Record<Size, { h: number; px: number; fs: number }> = {
  sm: { h: 36, px: 14, fs: 13 },
  md: { h: 44, px: 18, fs: 14 },
  lg: { h: 52, px: 24, fs: 15 },
};

export function Button({
  children, variant = 'primary', size = 'md', full, loading, disabled,
  onPress, leftIcon, rightIcon, style,
}: Props) {
  const s = sizeMap[size];

  const palette = (() => {
    switch (variant) {
      case 'primary':       return { bg: colors.primary, fg: colors.white, border: colors.primary };
      case 'secondary':     return { bg: colors.surface, fg: colors.primary, border: colors.stroke };
      case 'ghost':         return { bg: 'transparent', fg: colors.primary, border: 'transparent' };
      case 'ghost-on-dark': return { bg: 'rgba(255,255,255,0.06)', fg: colors.white, border: 'rgba(255,255,255,0.16)' };
      case 'lime':          return { bg: colors.accent, fg: colors.primary, border: colors.accent };
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          height: s.h,
          paddingHorizontal: s.px,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          width: full ? '100%' : undefined,
          opacity: disabled ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {leftIcon}
          {children !== undefined && (
            <Text style={[styles.label, { color: palette.fg, fontSize: s.fs }]}>{children}</Text>
          )}
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...typography.h5,
  },
});
