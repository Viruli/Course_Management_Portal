import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useColors } from '../theme/useThemedStyles';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  dark?: boolean;
}

export function SectionHeader({ title, actionLabel, onAction, dark }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: dark ? colors.white : colors.primary }]}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} style={styles.action}>
          <Text style={[styles.actionText, { color: dark ? colors.accent : colors.primary }]}>{actionLabel}</Text>
          <ArrowRight size={12} color={dark ? colors.accent : colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '700' },
});
