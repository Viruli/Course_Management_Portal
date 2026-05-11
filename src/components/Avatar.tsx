import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  name?: string;
  size?: number;
  variant?: 'default' | 'lime' | 'dark';
}

export function Avatar({ name = '?', size = 36, variant = 'default' }: Props) {
  const initials = name
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const palette = (() => {
    switch (variant) {
      case 'lime': return { bg: colors.accent, fg: colors.primary };
      case 'dark': return { bg: colors.primary, fg: colors.accent };
      default:     return { bg: colors.lightGray, fg: colors.primary };
    }
  })();

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.bg,
        },
      ]}
    >
      <Text style={[styles.initials, { color: palette.fg, fontSize: Math.max(11, size * 0.36) }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700' },
});
