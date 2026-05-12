import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Search, Flame, Check } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Tabs } from '../../components/Tabs';
import { RecCard } from '../../components/RecCard';
import { EmptyState } from '../../components/EmptyState';
import { COURSES } from '../../data/mock';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { Course } from '../../data/types';

interface Props {
  onCourse: (c: Course) => void;
}

export function MyLearningScreen({ onCourse }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [tab, setTab] = useState('progress');
  const inProgress = COURSES.filter(c => c.progress > 0);
  const enrolled = COURSES.filter(c => c.progress === 0).slice(0, 2);

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="My Learning"
        trailing={<IconBtn onPress={() => toast.info('Search across your learning coming soon.')}><Search size={18} color={colors.primary} /></IconBtn>}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statsGlow} pointerEvents="none" />
          <View style={styles.statsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statsLabel}>THIS WEEK</Text>
              <Text style={styles.statsValue}>3 lessons · 2h 14m</Text>
              <Text style={styles.statsSub}>1 lesson ahead of last week.</Text>
            </View>
            <View style={styles.flameBox}>
              <Flame size={22} color={colors.accent} />
            </View>
          </View>
          <View style={styles.weekRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
              const done = i < 3;
              const active = i === 3;
              return (
                <View key={i} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dayBox,
                      {
                        backgroundColor: done ? colors.accent
                          : active ? 'rgba(188,233,85,0.20)'
                          : 'rgba(255,255,255,0.06)',
                        borderColor: active ? colors.accent : 'transparent',
                        borderWidth: active ? 1.5 : 0,
                      },
                    ]}
                  >
                    {done ? <Check size={14} color={colors.primary} /> : null}
                  </View>
                  <Text style={[styles.dayLabel, { color: done || active ? colors.white : 'rgba(255,255,255,0.4)' }]}>
                    {d}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <Tabs
          items={[
            { id: 'progress', label: 'In progress', count: inProgress.length },
            { id: 'enrolled', label: 'Enrolled' },
            { id: 'completed', label: 'Done' },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'progress' && inProgress.map(c => (
          <RecCard key={c.id} course={c} onPress={() => onCourse(c)} />
        ))}
        {tab === 'enrolled' && enrolled.map(c => (
          <RecCard key={c.id} course={c} onPress={() => onCourse(c)} />
        ))}
        {tab === 'completed' && (
          <EmptyState icon="Trophy" title="No completions yet" body="Complete a course and you'll see your certificate here." />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 100 },
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
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 0.6 },
  statsValue: { fontSize: 24, fontWeight: '700', color: colors.white, letterSpacing: -0.5, marginTop: 4 },
  statsSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
  flameBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(188,233,85,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  weekRow: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dayCol: { flex: 1, alignItems: 'center', gap: 4 },
  dayBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dayLabel: { fontSize: 10, fontWeight: '700' },
});
