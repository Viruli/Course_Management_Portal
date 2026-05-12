import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useColors } from '../theme/useThemedStyles';

interface Props {
  name?: string;
  size?: number;
  variant?: 'default' | 'lime' | 'dark';
  photoUri?: string;
}

export function Avatar({ name = '?', size = 36, variant = 'default', photoUri }: Props) {
  const colors = useColors();
  const initials = name
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const palette = (() => {
    switch (variant) {
      // Lime brand chip: dark-green text always (lime requires dark text for contrast).
      case 'lime': return { bg: colors.accent, fg: colors.brand };
      // Dark brand chip: the dark-green brand bg is constant in both modes.
      case 'dark': return { bg: colors.brand,  fg: colors.accent };
      // Default: surface-coloured chip with adaptive text.
      default:     return { bg: colors.lightGray, fg: colors.primary };
    }
  })();

  const wrapStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: palette.bg,
  };

  if (photoUri) {
    return (
      <View style={[styles.wrap, wrapStyle, { overflow: 'hidden' }]}>
        <Image source={{ uri: photoUri }} style={{ width: size, height: size }} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, wrapStyle]}>
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
