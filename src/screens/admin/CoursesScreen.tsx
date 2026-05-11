import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Search, MoreVertical, Plus, Pencil, Upload, Users, Layers, Star, CheckCircle, Tag,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Tabs } from '../../components/Tabs';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { CourseCover } from '../../components/CourseCover';
import { Progress } from '../../components/Progress';
import { EmptyState } from '../../components/EmptyState';
import { COURSES } from '../../data/mock';
import { colors, shadows } from '../../theme/colors';
import type { Course } from '../../data/types';

interface Props {
  onCourse: (c: Course) => void;
  onCreate: () => void;
}

const drafts = [
  { title: 'Project Management Basics', tag: 'Business',  updated: 'Edited 2h ago',     complete: 60 },
  { title: 'Spoken English',             tag: 'Languages', updated: 'Edited yesterday',  complete: 30 },
  { title: 'Data Visualisation',         tag: 'Computing', updated: 'Edited 3 days ago', complete: 80 },
];

export function CoursesScreen({ onCourse, onCreate }: Props) {
  const [tab, setTab] = useState('published');

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar title="Courses" trailing={<IconBtn><Search size={18} color={colors.primary} /></IconBtn>} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Tabs
          items={[
            { id: 'published', label: 'Published', count: 18 },
            { id: 'drafts', label: 'Drafts', count: drafts.length },
            { id: 'archive', label: 'Archive' },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'published' && COURSES.slice(0, 4).map(c => (
          <Pressable key={c.id} onPress={() => onCourse(c)} style={styles.card}>
            <View style={{ width: 80 }}>
              <CourseCover kind={c.kind} emblem={c.emblem} height={80} />
            </View>
            <View style={{ flex: 1 }}>
              <Badge tone="success" icon={<CheckCircle size={11} color={colors.successDeep} />}>Published</Badge>
              <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
              <View style={styles.meta}>
                <Users size={11} color={colors.bodyGreen} />
                <Text style={styles.metaText}>{c.students}</Text>
                <View style={styles.dot} />
                <Layers size={11} color={colors.bodyGreen} />
                <Text style={styles.metaText}>{c.lessons}</Text>
                <View style={styles.dot} />
                <Star size={11} color={colors.warning} />
                <Text style={styles.metaText}>{c.rating}</Text>
              </View>
            </View>
            <IconBtn><MoreVertical size={16} color={colors.primary} /></IconBtn>
          </Pressable>
        ))}

        {tab === 'drafts' && drafts.map((d, i) => (
          <View key={i} style={styles.draftCard}>
            <View style={styles.draftHead}>
              <Badge tone="warning" icon={<Pencil size={11} color={colors.warning} />}>Draft</Badge>
              <Text style={styles.draftUpdated}>{d.updated}</Text>
            </View>
            <Text style={styles.draftTitle}>{d.title}</Text>
            <View style={styles.meta}>
              <Tag size={11} color={colors.bodyGreen} />
              <Text style={styles.metaText}>{d.tag}</Text>
            </View>
            <View style={styles.draftProgress}>
              <Progress pct={d.complete} showLabel={false} />
              <Text style={styles.draftPct}>{d.complete}% complete</Text>
            </View>
            <View style={styles.draftActions}>
              <View style={{ flex: 1 }}>
                <Button variant="secondary" size="sm" full leftIcon={<Pencil size={13} color={colors.primary} />}>Continue</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button size="sm" full leftIcon={<Upload size={13} color={colors.white} />}>Publish</Button>
              </View>
            </View>
          </View>
        ))}

        {tab === 'archive' && (
          <EmptyState icon="Archive" title="No archived courses" body="Archive a course to hide it from learners while keeping its data." />
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={onCreate}>
        <Plus size={24} color={colors.primary} strokeWidth={2.5} />
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 110 },
  card: {
    backgroundColor: colors.surface, borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, padding: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 11, fontWeight: '500', color: colors.bodyGreen },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted, marginHorizontal: 2 },
  draftCard: {
    backgroundColor: colors.surface, borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, padding: 14, gap: 8,
  },
  draftHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  draftUpdated: { fontSize: 11, color: colors.muted },
  draftTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: 4 },
  draftProgress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  draftPct: { fontSize: 11, color: colors.bodyGreen, fontWeight: '700' },
  draftActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  fab: {
    position: 'absolute', right: 16, bottom: 90,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
  },
});
