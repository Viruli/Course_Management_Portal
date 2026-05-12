import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Layers, Clock } from 'lucide-react-native';
import type { Colors } from '../theme/colors';
import { shadows } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';
import { Avatar } from './Avatar';
import { Progress } from './Progress';
import { CourseCover } from './CourseCover';
import type { Course } from '../data/types';

interface Props {
  course: Course;
  onPress?: () => void;
  compact?: boolean;
}

export function CourseCard({ course, onPress, compact }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.9 : 1 }]}
    >
      <CourseCover
        kind={course.kind}
        emblem={course.emblem}
        tag={course.tag}
        height={compact ? 100 : 130}
      />
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>{course.title}</Text>
        <View style={styles.meta}>
          <Layers size={11} color={colors.bodyGreen} />
          <Text style={styles.metaText}>{course.lessons} lessons</Text>
          <View style={styles.dot} />
          <Clock size={11} color={colors.bodyGreen} />
          <Text style={styles.metaText}>{course.time}</Text>
        </View>
        {course.progress > 0 ? (
          <View style={{ marginTop: 8 }}>
            <Progress pct={course.progress} />
          </View>
        ) : course.instructor ? (
          <View style={styles.instructor}>
            <Avatar size={20} name={course.instructor} />
            <Text style={styles.instructorText} numberOfLines={1}>{course.instructor}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.xs,
  },
  body: { padding: 12, gap: 6 },
  title: { fontSize: 14, fontWeight: '700', color: colors.primary, letterSpacing: -0.2, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 11, fontWeight: '500', color: colors.bodyGreen },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted, marginHorizontal: 2 },
  instructor: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  instructorText: { fontSize: 11, fontWeight: '500', color: colors.bodyGreen, flex: 1 },
});
