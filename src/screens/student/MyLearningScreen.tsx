import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Search, Flame, Check, BookOpen, Layers } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Tabs } from '../../components/Tabs';
import { EmptyState } from '../../components/EmptyState';
import { Progress } from '../../components/Progress';
import { toast } from '../../store/uiStore';
import { listMyEnrollments, ApiEnrollment } from '../../services/studentEnrollments';
import { getCourseProgress, ApiCourseProgress } from '../../services/progress';
import type { Colors } from '../../theme/colors';
import { shadows } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onCourse: (courseId: string) => void;
}

export function MyLearningScreen({ onCourse }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [tab,         setTab]         = useState('progress');
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ApiCourseProgress>>({});
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await listMyEnrollments();
        if (cancelled) return;
        setEnrollments(result.data.items);

        // Fetch progress for all approved enrollments
        const approved = result.data.items.filter((e) => e.state === 'approved');
        const progressResults = await Promise.allSettled(
          approved.map((e) => getCourseProgress(e.courseId)),
        );
        if (cancelled) return;
        const map: Record<string, ApiCourseProgress> = {};
        progressResults.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            map[approved[i].courseId] = r.value.data;
          }
        });
        setProgressMap(map);
      } catch {
        toast.error('Failed to load your courses.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const approved   = enrollments.filter((e) => e.state === 'approved');
  const inProgress = approved.filter((e) => (progressMap[e.courseId]?.completionPercent ?? 0) > 0);
  const enrolled   = approved.filter((e) => (progressMap[e.courseId]?.completionPercent ?? 0) === 0);
  const pending    = enrollments.filter((e) => e.state === 'pending');

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="My Learning"
        trailing={<IconBtn onPress={() => toast.info('Search across your learning coming soon.')}><Search size={18} color={colors.primary} /></IconBtn>}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Stats card — static for now until progress API is fully integrated */}
        <View style={styles.statsCard}>
          <View style={styles.statsGlow} pointerEvents="none" />
          <View style={styles.statsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statsLabel}>ENROLLED</Text>
              <Text style={styles.statsValue}>{approved.length} course{approved.length === 1 ? '' : 's'}</Text>
              <Text style={styles.statsSub}>{inProgress.length} in progress · {pending.length} pending</Text>
            </View>
            <View style={styles.flameBox}>
              <Flame size={22} color={colors.accent} />
            </View>
          </View>
        </View>

        <Tabs
          items={[
            { id: 'progress', label: 'In progress', count: inProgress.length },
            { id: 'enrolled', label: 'Enrolled',    count: enrolled.length },
            { id: 'pending',  label: 'Pending',     count: pending.length },
          ]}
          active={tab}
          onChange={setTab}
        />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : tab === 'progress' && inProgress.length === 0 ? (
          <EmptyState icon="BookOpen" title="No courses in progress" body="Start learning in any enrolled course." />
        ) : tab === 'enrolled' && enrolled.length === 0 ? (
          <EmptyState icon="BookOpen" title="You haven't started any courses" body="Tap a course below to begin." />
        ) : tab === 'pending' && pending.length === 0 ? (
          <EmptyState icon="Clock" title="No pending enrolments" body="Request enrolment on a published course." />
        ) : (
          <View style={{ gap: 12 }}>
            {(tab === 'progress' ? inProgress : tab === 'enrolled' ? enrolled : pending).map((e) => {
              const prog = progressMap[e.courseId];
              const pct  = prog?.completionPercent ?? 0;
              return (
                <Pressable
                  key={e.id}
                  style={({ pressed }) => [styles.card, { opacity: pressed ? 0.88 : 1 }]}
                  onPress={() => onCourse(e.courseId)}
                  disabled={e.state === 'pending'}
                >
                  <View style={styles.cardIcon}>
                    <BookOpen size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{e.courseTitle}</Text>
                    {e.state === 'pending' ? (
                      <Text style={styles.pendingBadge}>Awaiting approval</Text>
                    ) : pct > 0 ? (
                      <>
                        <Progress pct={pct} />
                        <Text style={styles.cardMeta}>{pct.toFixed(0)}% complete</Text>
                      </>
                    ) : (
                      <View style={styles.metaRow}>
                        <Layers size={11} color={colors.bodyGreen} />
                        <Text style={styles.cardMeta}>Not started</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body:       { padding: 16, gap: 14, paddingBottom: 100 },
  statsCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: colors.brand,
    overflow: 'hidden', position: 'relative',
  },
  statsGlow: {
    position: 'absolute', top: -30, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(188,233,85,0.08)',
  },
  statsRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 0.6 },
  statsValue: { fontSize: 24, fontWeight: '700', color: colors.white, letterSpacing: -0.5, marginTop: 4 },
  statsSub:   { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
  flameBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(188,233,85,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, borderRadius: 16,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    ...shadows.xs,
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle:    { fontSize: 14, fontWeight: '700', color: colors.primary },
  cardMeta:     { fontSize: 11, color: colors.bodyGreen },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pendingBadge: { fontSize: 11, color: colors.warning, fontWeight: '600' },
});
