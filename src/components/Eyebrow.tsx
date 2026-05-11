import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  dark?: boolean;
  lime?: boolean;
  icon?: React.ReactNode;
}

export function Eyebrow({ children, dark, lime, icon }: Props) {
  const bg = lime ? colors.accent
    : dark ? 'rgba(255,255,255,0.08)'
    : colors.lightGray;
  const fg = lime ? colors.primary
    : dark ? colors.white
    : colors.bodyGreen;
  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: lime ? colors.accentHover : (dark ? 'rgba(255,255,255,0.16)' : colors.stroke) }]}>
      {icon}
      <Text style={[styles.text, { color: fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
