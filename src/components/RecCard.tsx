import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, Layers, Star } from 'lucide-react-native';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';
import { CourseCover } from './CourseCover';
import type { Course } from '../data/types';

interface Props {
  course: Course;
  onPress?: () => void;
}

export function RecCard({ course, onPress }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={styles.coverWrap}>
        <CourseCover kind={course.kind} emblem={course.emblem} height={92} />
      </View>
      <View style={styles.body}>
        <View>
          <Text style={styles.tag}>{course.tag.toUpperCase()}</Text>
          <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
          <View style={styles.meta}>
            <Layers size={11} color={colors.bodyGreen} />
            <Text style={styles.metaText}>{course.lessons} lessons</Text>
            <View style={styles.dot} />
            <Star size={11} color={colors.warning} />
            <Text style={styles.metaText}>{course.rating}</Text>
          </View>
        </View>
        <View style={styles.foot}>
          <Text style={styles.students}>{course.students.toLocaleString()} students</Text>
          <View style={styles.arrow}>
            <ArrowRight size={14} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    backgroundColor: colors.surface,
    borderColor: colors.stroke,
    borderWidth: 1,
    borderRadius: 16,
  },
  coverWrap: { width: 90 },
  body: { flex: 1, justifyContent: 'space-between' },
  tag: { fontSize: 9, fontWeight: '700', color: colors.bodyGreen, letterSpacing: 0.6 },
  title: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 4, letterSpacing: -0.2, lineHeight: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  metaText: { fontSize: 11, fontWeight: '500', color: colors.bodyGreen },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted, marginHorizontal: 2 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  students: { fontSize: 11, color: colors.bodyGreen, fontWeight: '500' },
  arrow: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
});
