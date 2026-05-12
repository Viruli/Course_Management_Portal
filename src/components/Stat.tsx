import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Icons from 'lucide-react-native';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';

interface Props {
  label: string;
  value: string | number;
  icon: string;
  dark?: boolean;
  delta?: string;
}

export function Stat({ label, value, icon, dark, delta }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const IconCmp = (Icons as any)[icon] ?? Icons.Activity;
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: dark ? colors.brand : colors.surface,
          borderColor: dark ? 'rgba(255,255,255,0.08)' : colors.stroke,
        },
      ]}
    >
      <View style={styles.head}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: dark ? 'rgba(255,255,255,0.10)' : colors.lightGray },
          ]}
        >
          <IconCmp size={14} color={dark ? colors.accent : colors.primary} />
        </View>
        {delta ? (
          <Text style={[styles.delta, { color: dark ? colors.accent : colors.successDeep }]}>{delta}</Text>
        ) : null}
      </View>
      <View>
        <Text style={[styles.value, { color: dark ? colors.white : colors.primary }]}>{value}</Text>
        <Text style={[styles.label, { color: dark ? 'rgba(255,255,255,0.65)' : colors.bodyGreen }]}>{label}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: 0,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delta: { fontSize: 10, fontWeight: '700' },
  value: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, lineHeight: 24 },
  label: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
