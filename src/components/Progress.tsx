import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';

interface Props {
  pct: number;
  onDark?: boolean;
  showLabel?: boolean;
  height?: number;
}

export function Progress({ pct, onDark, showLabel = true, height = 6 }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: onDark ? 'rgba(255,255,255,0.12)' : colors.lightGray,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${Math.max(0, Math.min(100, pct))}%`,
              backgroundColor: onDark ? colors.accent : colors.brand,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.pct, { color: onDark ? colors.accent : colors.primary }]}>{pct}%</Text>
      )}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, borderRadius: 9999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 9999 },
  pct: { fontSize: 11, fontWeight: '700', minWidth: 30, textAlign: 'right' },
});
