import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  dark?: boolean;
}

export function Pill({ children, active, onPress, dark }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        active
          ? { backgroundColor: dark ? colors.accent : colors.primary, borderColor: dark ? colors.accent : colors.primary }
          : { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : colors.surface, borderColor: dark ? 'rgba(255,255,255,0.16)' : colors.stroke },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: active
              ? (dark ? colors.primary : colors.white)
              : (dark ? colors.white : colors.primary),
          },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 12, fontWeight: '600' },
});
