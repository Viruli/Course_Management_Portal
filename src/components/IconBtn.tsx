import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  dark?: boolean;
  dot?: boolean;
  size?: number;
}

export function IconBtn({ children, onPress, dark, dot, size = 38 }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          backgroundColor: dark ? 'rgba(255,255,255,0.06)' : colors.lightGray,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {children}
      {dot && (
        <View style={[styles.dot, { backgroundColor: dark ? colors.accent : colors.error }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
