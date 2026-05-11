import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  title?: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  transparent?: boolean;
  dark?: boolean;
}

export function AppBar({ title, subtitle, leading, trailing, transparent, dark }: Props) {
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: transparent ? 'transparent' : dark ? colors.primary : colors.surface,
          borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.stroke,
        },
      ]}
    >
      <View style={styles.side}>{leading}</View>
      <View style={styles.center}>
        {title ? (
          <Text
            numberOfLines={1}
            style={[styles.title, { color: dark ? colors.white : colors.primary }]}
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={[styles.subtitle, { color: dark ? 'rgba(255,255,255,0.6)' : colors.bodyGreen }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.right]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 56,
  },
  side: {
    minWidth: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  right: { justifyContent: 'flex-end' },
  center: {
    flex: 1,
    paddingHorizontal: 8,
  },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  subtitle: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});
