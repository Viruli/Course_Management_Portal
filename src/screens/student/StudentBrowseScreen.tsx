import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowDownUp, SlidersHorizontal } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { SearchField } from '../../components/SearchField';
import { Pill } from '../../components/Pill';
import { CourseCard } from '../../components/CourseCard';
import { EmptyState } from '../../components/EmptyState';
import { COURSES } from '../../data/mock';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
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

const sortOptions = ['Most popular', 'Newest', 'Highest rated', 'Shortest'] as const;
type Sort = typeof sortOptions[number];

export function StudentBrowseScreen({ onCourse }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [filter, setFilter] = useState<'all' | CourseKind>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('Most popular');

  const list = useMemo(() => {
    let l = COURSES.filter(c => filter === 'all' || c.kind === filter)
      .filter(c => !q || c.title.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'Newest')         l = [...l].reverse();
    if (sort === 'Highest rated')  l = [...l].sort((a, b) => b.rating - a.rating);
    if (sort === 'Shortest')       l = [...l].sort((a, b) => a.lessons - b.lessons);
    // 'Most popular' uses default ordering.
    return l;
  }, [filter, q, sort]);

  const cycleSort = () => {
    const idx = sortOptions.indexOf(sort);
    const next = sortOptions[(idx + 1) % sortOptions.length];
    setSort(next);
    toast.info(`Sorted by ${next.toLowerCase()}.`);
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Browse Courses"
        trailing={
          <IconBtn onPress={() => toast.info('Advanced filters coming soon.')}>
            <SlidersHorizontal size={18} color={colors.primary} />
          </IconBtn>
        }
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
          <Text style={styles.count}>{list.length} course{list.length === 1 ? '' : 's'}</Text>
          <Pressable style={styles.sortRow} onPress={cycleSort}>
            <ArrowDownUp size={12} color={colors.bodyGreen} />
            <Text style={styles.sort}>{sort}</Text>
          </Pressable>
        </View>
        {list.length === 0 ? (
          <EmptyState icon="SearchX" title="No courses match" body="Try a different category or clear your search." />
        ) : (
          <View style={styles.grid}>
            {list.map(c => (
              <View key={c.id} style={styles.gridItem}>
                <CourseCard course={c} onPress={() => onCourse(c)} compact />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
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
