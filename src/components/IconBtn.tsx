import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  dark?: boolean;
  dot?: boolean;
  badge?: number;  // small numeric badge in top-right
  size?: number;
}

export function IconBtn({ children, onPress, dark, dot, badge, size = 38 }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
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
      {badge && badge > 0 ? (
        <View style={[styles.numBadge, { backgroundColor: colors.error }]}>
          <Text style={styles.numBadgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : dot ? (
        <View style={[styles.dot, { backgroundColor: dark ? colors.accent : colors.error }]} />
      ) : null}
    </Pressable>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
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
  numBadge: {
    position: 'absolute',
    top: 4, right: 4,
    minWidth: 14, height: 14, borderRadius: 7,
    paddingHorizontal: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  numBadgeText: { color: colors.white, fontSize: 9, fontWeight: '700' },
});
