import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search, MoreVertical, Plus, Pencil, Upload, Users, Layers, Star, CheckCircle, Tag,
  Trash2, AlertTriangle,
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
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { shadows } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { Course } from '../../data/types';

interface Props {
  onCourse: (c: Course) => void;     // tap a card → view
  onEditCourse: (c: Course) => void; // 3-dot → Edit
  onCreate: () => void;
}

const drafts = [
  { title: 'Project Management Basics', tag: 'Business',  updated: 'Edited 2h ago',     complete: 60 },
  { title: 'Spoken English',             tag: 'Languages', updated: 'Edited yesterday',  complete: 30 },
  { title: 'Data Visualisation',         tag: 'Computing', updated: 'Edited 3 days ago', complete: 80 },
];

export function CoursesScreen({ onCourse, onEditCourse, onCreate }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [tab, setTab] = useState('published');
  // Track the course whose action sheet / delete confirmation is open.
  const [menuFor, setMenuFor]       = useState<Course | null>(null);
  const [deleteFor, setDeleteFor]   = useState<Course | null>(null);
  // Local hide-list lets Delete actually remove the card from the list.
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const visibleCourses = COURSES.filter((c) => !hidden.has(c.id)).slice(0, 4);

  const handleEdit = () => {
    if (!menuFor) return;
    const c = menuFor;
    setMenuFor(null);
    onEditCourse(c);
  };
  const handleAskDelete = () => {
    if (!menuFor) return;
    const c = menuFor;
    setMenuFor(null);
    // Defer to next frame so the sheet has time to dismiss before opening
    // a second modal on top.
    requestAnimationFrame(() => setDeleteFor(c));
  };
  const handleConfirmDelete = () => {
    if (!deleteFor) return;
    const c = deleteFor;
    setHidden((h) => new Set(h).add(c.id));
    setDeleteFor(null);
    toast.success(`Deleted "${c.title}".`);
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Courses"
        trailing={
          <IconBtn onPress={() => toast.info('Course search coming soon.')}>
            <Search size={18} color={colors.primary} />
          </IconBtn>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Tabs
          items={[
            { id: 'published', label: 'Published', count: visibleCourses.length },
            { id: 'drafts', label: 'Drafts', count: drafts.length },
            { id: 'archive', label: 'Archive' },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'published' && (
          visibleCourses.length === 0 ? (
            <EmptyState icon="BookOpen" title="No published courses" body="Tap the + button to create one." />
          ) : visibleCourses.map(c => (
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
              <IconBtn onPress={() => setMenuFor(c)}>
                <MoreVertical size={16} color={colors.primary} />
              </IconBtn>
            </Pressable>
          ))
        )}

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
                <Button
                  variant="secondary" size="sm" full
                  leftIcon={<Pencil size={13} color={colors.primary} />}
                  onPress={() => toast.info(`Continuing "${d.title}".`)}
                >Continue</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  size="sm" full
                  leftIcon={<Upload size={13} color={colors.white} />}
                  onPress={() => toast.success(`"${d.title}" published.`)}
                >Publish</Button>
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

      {/* Action sheet for the row 3-dot menu */}
      <Modal
        transparent
        animationType="fade"
        visible={menuFor !== null}
        onRequestClose={() => setMenuFor(null)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuFor(null)}>
          <SafeAreaView edges={['bottom']} style={{ width: '100%' }}>
            <Pressable style={styles.menuPanel} onPress={(e) => e.stopPropagation()}>
              <View style={styles.menuHandle} />
              <Text style={styles.menuTitle}>{menuFor?.title}</Text>
              <Text style={styles.menuSub}>Choose an action.</Text>

              <View style={{ gap: 8, marginTop: 14 }}>
                <Pressable style={styles.menuItem} onPress={handleEdit}>
                  <View style={[styles.menuIco, { backgroundColor: colors.lightGray }]}>
                    <Pencil size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemLabel}>Edit course</Text>
                    <Text style={styles.menuItemDesc}>Update content, curriculum and metadata.</Text>
                  </View>
                </Pressable>

                <Pressable style={styles.menuItem} onPress={handleAskDelete}>
                  <View style={[styles.menuIco, { backgroundColor: colors.errorBg }]}>
                    <Trash2 size={16} color={colors.error} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuItemLabel, { color: colors.error }]}>Delete course</Text>
                    <Text style={styles.menuItemDesc}>Removes the course and unenrols every student.</Text>
                  </View>
                </Pressable>
              </View>

              <View style={{ marginTop: 14 }}>
                <Button variant="secondary" full size="lg" onPress={() => setMenuFor(null)}>
                  Cancel
                </Button>
              </View>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        transparent
        animationType="fade"
        visible={deleteFor !== null}
        onRequestClose={() => setDeleteFor(null)}
      >
        <Pressable style={styles.dialogBackdrop} onPress={() => setDeleteFor(null)}>
          <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialogIco}>
              <AlertTriangle size={24} color={colors.error} />
            </View>
            <Text style={styles.dialogTitle}>Delete "{deleteFor?.title}"?</Text>
            <Text style={styles.dialogBody}>
              This permanently removes the course and unenrols every student. This action cannot be undone.
            </Text>
            <View style={styles.dialogActions}>
              <View style={{ flex: 1 }}>
                <Button variant="secondary" full size="lg" onPress={() => setDeleteFor(null)}>
                  Cancel
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  full size="lg"
                  leftIcon={<Trash2 size={16} color={colors.white} />}
                  onPress={handleConfirmDelete}
                  style={{ backgroundColor: colors.error, borderColor: colors.error } as any}
                >
                  Delete
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
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

  // Action sheet
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  menuPanel: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  menuHandle: {
    alignSelf: 'center',
    width: 38, height: 4, borderRadius: 2,
    backgroundColor: colors.stroke,
    marginBottom: 12,
  },
  menuTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, letterSpacing: -0.2 },
  menuSub:  { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12,
    borderColor: colors.stroke, borderWidth: 1,
    backgroundColor: colors.surface,
  },
  menuIco: {
    width: 36, height: 36, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  menuItemLabel: { fontSize: 14, fontWeight: '700', color: colors.primary },
  menuItemDesc:  { fontSize: 11, color: colors.bodyGreen, marginTop: 2, lineHeight: 14 },

  // Delete confirmation
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%', maxWidth: 360,
    padding: 20, borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center', gap: 8,
  },
  dialogIco: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.errorBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  dialogTitle: { fontSize: 17, fontWeight: '700', color: colors.primary, letterSpacing: -0.2, textAlign: 'center' },
  dialogBody:  { fontSize: 13, color: colors.bodyGreen, textAlign: 'center', lineHeight: 18 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
});
