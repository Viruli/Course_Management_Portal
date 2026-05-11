import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowDownUp, SlidersHorizontal } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { SearchField } from '../../components/SearchField';
import { Pill } from '../../components/Pill';
import { CourseCard } from '../../components/CourseCard';
import { COURSES } from '../../data/mock';
import { colors } from '../../theme/colors';
import type { Course, CourseKind } from '../../data/types';

interface Props {
  onCourse: (c: Course) => void;
}

const filters: { id: 'all' | CourseKind; label: string }[] = [
  { id: 'all',  label: 'All' },
  { id: 'math', label: 'Math' },
  { id: 'sci',  label: 'Science' },
  { id: 'lit',  label: 'Lang Arts' },
  { id: 'soc',  label: 'Social' },
  { id: 'lang', label: 'Languages' },
  { id: 'cs',   label: 'Computing' },
];

export function StudentBrowseScreen({ onCourse }: Props) {
  const [filter, setFilter] = useState<'all' | CourseKind>('all');
  const [q, setQ] = useState('');

  const list = COURSES.filter(c => filter === 'all' || c.kind === filter)
    .filter(c => !q || c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Browse Courses"
        trailing={<IconBtn><SlidersHorizontal size={18} color={colors.primary} /></IconBtn>}
      />
      <View style={styles.filterBar}>
        <SearchField value={q} onChange={setQ} placeholder="Search topics, instructors, courses…" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {filters.map(f => (
            <Pill key={f.id} active={filter === f.id} onPress={() => setFilter(f.id)}>{f.label}</Pill>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.count}>{list.length} courses</Text>
          <View style={styles.sortRow}>
            <ArrowDownUp size={12} color={colors.bodyGreen} />
            <Text style={styles.sort}>Most popular</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {list.map(c => (
            <View key={c.id} style={styles.gridItem}>
              <CourseCard course={c} onPress={() => onCourse(c)} compact />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: colors.surface,
    borderBottomColor: colors.stroke,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pillsRow: { gap: 6, paddingRight: 16 },
  body: { padding: 16, gap: 12, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontSize: 12, color: colors.bodyGreen, fontWeight: '600' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sort: { fontSize: 12, color: colors.bodyGreen, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%' },
});
