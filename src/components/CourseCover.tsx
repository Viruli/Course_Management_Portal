import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Icons from 'lucide-react-native';
import { colors, coverPalette } from '../theme/colors';
import type { CourseKind } from '../data/types';

interface Props {
  kind: CourseKind;
  emblem: string;
  tag?: string;
  pct?: number;
  height?: number;
  style?: ViewStyle;
}

export function CourseCover({ kind, emblem, tag, pct, height = 130, style }: Props) {
  const palette = coverPalette(kind);
  const EmblemIcon = (Icons as any)[emblem] ?? Icons.BookOpen;

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg, height }, style]}>
      {tag ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}
      <View style={styles.iconRow}>
        <EmblemIcon size={56} strokeWidth={1.25} color={palette.ico} />
      </View>
      {pct != null ? (
        <View style={styles.pct}>
          <Text style={styles.pctText}>{pct}%</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  iconRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(21,42,36,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 0.3 },
  pct: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(21,42,36,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  pctText: { fontSize: 11, fontWeight: '700', color: colors.accent },
});
