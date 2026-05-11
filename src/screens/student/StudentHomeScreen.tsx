import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Search, Bell, Play, Calculator, FlaskConical, BookOpen, Landmark,
  Languages, Terminal, Briefcase, Palette,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { IconBtn } from '../../components/IconBtn';
import { Progress } from '../../components/Progress';
import { Stat } from '../../components/Stat';
import { CourseCard } from '../../components/CourseCard';
import { RecCard } from '../../components/RecCard';
import { SectionHeader } from '../../components/SectionHeader';
import { COURSES, STUDENT, LESSON } from '../../data/mock';
import { colors } from '../../theme/colors';
import type { Course } from '../../data/types';

interface Props {
  onContinue: () => void;
  onCourse: (c: Course) => void;
  onTabChange: (tab: 'home' | 'browse' | 'mine' | 'profile') => void;
  onBell: () => void;
}

const categories = [
  { Icon: Calculator,   label: 'Math' },
  { Icon: FlaskConical, label: 'Science' },
  { Icon: BookOpen,     label: 'Lang Arts' },
  { Icon: Landmark,     label: 'Social' },
  { Icon: Languages,    label: 'Languages' },
  { Icon: Terminal,     label: 'Computing' },
  { Icon: Briefcase,    label: 'Business' },
  { Icon: Palette,      label: 'Creative' },
];

export function StudentHomeScreen({ onContinue, onCourse, onTabChange, onBell }: Props) {
  const inProgress = COURSES.filter(c => c.progress > 0);
  const recommended = COURSES.filter(c => c.progress === 0).slice(0, 2);
  const current = COURSES.find(c => c.id === 'math')!;

  return (
    <View style={{ flex: 1, backgroundColor: colors.pageBg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <SafeAreaView edges={['top']} style={styles.hero}>
          <View style={styles.heroGlow} pointerEvents="none" />
          <View style={styles.heroTop}>
            <View style={styles.greetRow}>
              <Avatar size={38} name={STUDENT.name} variant="lime" />
              <View>
                <Text style={styles.hello}>Hello 👋</Text>
                <Text style={styles.greetName}>{STUDENT.name.split(' ')[0]}</Text>
              </View>
            </View>
            <View style={styles.heroIcons}>
              <IconBtn dark><Search size={18} color={colors.white} /></IconBtn>
              <IconBtn dark dot onPress={onBell}><Bell size={18} color={colors.white} /></IconBtn>
            </View>
          </View>

          <Text style={styles.h1}>
            Ready to <Text style={{ color: colors.accent }}>keep going?</Text>
          </Text>
          <Text style={styles.heroSub}>
            You've completed <Text style={{ color: colors.white, fontWeight: '700' }}>3 lessons</Text> this week.
          </Text>

          <Pressable onPress={onContinue} style={styles.resume}>
            <View style={styles.playWrap}>
              <Play size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeEyebrow}>CONTINUE LEARNING</Text>
              <Text style={styles.resumeTitle} numberOfLines={1}>{LESSON.title}</Text>
              <Text style={styles.resumeNum}>{LESSON.number}</Text>
              <View style={{ marginTop: 6 }}>
                <Progress pct={current.progress} onDark showLabel={false} />
              </View>
            </View>
          </Pressable>
        </SafeAreaView>

        <View style={styles.body}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <Stat icon="BookOpen" label="Enrolled" value={STUDENT.enrolled} />
            <Stat icon="Clock" label="Hours" value={STUDENT.hours} />
            <Stat icon="Flame" label="Day streak" value={STUDENT.streak} delta="+1" />
          </View>

          {/* In progress */}
          <View style={{ gap: 12 }}>
            <SectionHeader title="In progress" actionLabel="View all" onAction={() => onTabChange('mine')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 16 }}
              style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
            >
              {inProgress.map(c => (
                <View key={c.id} style={{ width: 220 }}>
                  <CourseCard course={c} onPress={() => onCourse(c)} compact />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Categories */}
          <View style={{ gap: 12 }}>
            <SectionHeader title="Browse by category" />
            <View style={styles.catGrid}>
              {categories.map(cat => (
                <Pressable
                  key={cat.label}
                  onPress={() => onTabChange('browse')}
                  style={styles.catItem}
                >
                  <View style={styles.catIcon}>
                    <cat.Icon size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Recommended */}
          <View style={{ gap: 12 }}>
            <SectionHeader title="Recommended for you" actionLabel="View all" onAction={() => onTabChange('browse')} />
            <View style={{ gap: 12 }}>
              {recommended.map(c => (
                <RecCard key={c.id} course={c} onPress={() => onCourse(c)} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -40, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(188,233,85,0.10)',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hello: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  greetName: { fontSize: 15, color: colors.white, fontWeight: '700' },
  heroIcons: { flexDirection: 'row', gap: 6 },
  h1: { color: colors.white, fontSize: 24, fontWeight: '700', letterSpacing: -0.5, marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6 },
  resume: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  playWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(188,233,85,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  resumeEyebrow: {
    fontSize: 10, color: colors.accent, fontWeight: '700',
    letterSpacing: 0.6,
  },
  resumeTitle: { fontSize: 14, fontWeight: '700', color: colors.white, marginTop: 2 },
  resumeNum: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  body: { padding: 16, gap: 20, paddingBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catItem: {
    width: '23%',
    backgroundColor: colors.surface,
    borderColor: colors.stroke,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  catIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  catLabel: { fontSize: 11, fontWeight: '600', color: colors.primary },
});
