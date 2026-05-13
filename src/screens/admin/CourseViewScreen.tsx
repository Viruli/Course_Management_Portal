import React, { useMemo, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, MoreVertical, Pencil, Trash2, AlertTriangle,
  ChevronDown, ChevronUp, GraduationCap, BookOpen,
  TvMinimalPlay, Paperclip, CheckCircle, Star, Users, Layers, Clock,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { CourseCover } from '../../components/CourseCover';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SAMPLE_BUILDER_COURSE } from '../../data/mock';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { Course, BuilderSemester, BuilderLesson } from '../../data/types';

interface Props {
  courseId?: string;  // real API course ID â€” when provided, fetch real data
  course?: Course;    // legacy mock path
  onBack: () => void;
  onEdit: (courseId: string) => void;
}

export function CourseViewScreen({ courseId, course, onBack, onEdit }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // In the design build every course shows the same sample curriculum.
  const curriculum = SAMPLE_BUILDER_COURSE.semesters;
  const totalLessons = useMemo(
    () => curriculum.reduce((n, sem) => n + sem.subjects.reduce((m, s) => m + s.lessons.length, 0), 0),
    [curriculum],
  );

  const resolvedId    = courseId ?? course?.id ?? '';
  const resolvedTitle = course?.title ?? 'Course';

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit(resolvedId);
  };
  const handleDeleteRequested = () => {
    setMenuOpen(false);
    requestAnimationFrame(() => setConfirmDelete(true));
  };
  const handleDeleteConfirmed = () => {
    setConfirmDelete(false);
    toast.success(`Deleted "${resolvedTitle}".`);
    onBack();
  };

  return (
    <ScreenContainer edges={['top']}>
      <AppBar
        title="Course"
        leading={<IconBtn onPress={onBack}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
        trailing={
          <IconBtn onPress={() => setMenuOpen(true)}>
            <MoreVertical size={18} color={colors.primary} />
          </IconBtn>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.coverWrap}>
          <CourseCover kind={course?.kind ?? 'cs'} emblem={course?.emblem ?? '??'} tag={course?.tag ?? ''} height={180} />
        </View>

        <View style={styles.head}>
          <View style={styles.badgeRow}>
            <Badge tone="success" icon={<CheckCircle size={11} color={colors.successDeep} />}>Published</Badge>
            <Text style={styles.kindLabel}>{course?.tag ?? ''}</Text>
          </View>
          <Text style={styles.title}>{resolvedTitle}</Text>
          <Text style={styles.desc}>{course?.short ?? ''}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatTile Icon={Users}   label="Students"  value={(course?.students ?? 0).toLocaleString()} />
          <StatTile Icon={Layers}  label="Lessons"   value={String(totalLessons)} />
          <StatTile Icon={Clock}   label="Duration"  value={course?.time ?? '—'} />
          <StatTile Icon={Star}    label="Rating"    value={String(course?.rating ?? '—')} tint={colors.warning} />
        </View>

        {/* Instructor */}
        <View style={styles.instructorWrap}>
          <View style={styles.instructorRow}>
            <Avatar size={42} name={course?.instructor ?? '—'} variant="dark" />
            <View style={{ flex: 1 }}>
              <Text style={styles.instructorLabel}>Instructor</Text>
              <Text style={styles.instructorName}>{course?.instructor ?? '—'}</Text>
            </View>
          </View>
        </View>

        {/* Curriculum */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Curriculum</Text>
            <Text style={styles.muted}>
              {curriculum.length} semesters Â· {totalLessons} lessons
            </Text>
          </View>
          <CurriculumTree semesters={curriculum} />
        </View>
      </ScrollView>

      {/* 3-dot action menu */}
      <Modal
        transparent
        animationType="fade"
        visible={menuOpen}
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <SafeAreaView edges={['bottom']} style={{ width: '100%' }}>
            <Pressable style={styles.menuPanel} onPress={(e) => e.stopPropagation()}>
              <View style={styles.menuHandle} />
              <Text style={styles.menuTitle}>{resolvedTitle}</Text>
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

                <Pressable style={styles.menuItem} onPress={handleDeleteRequested}>
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
                <Button variant="secondary" full size="lg" onPress={() => setMenuOpen(false)}>
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
        visible={confirmDelete}
        onRequestClose={() => setConfirmDelete(false)}
      >
        <Pressable style={styles.dialogBackdrop} onPress={() => setConfirmDelete(false)}>
          <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialogIco}>
              <AlertTriangle size={24} color={colors.error} />
            </View>
            <Text style={styles.dialogTitle}>Delete "{resolvedTitle}"?</Text>
            <Text style={styles.dialogBody}>
              This permanently removes the course and unenrols every student. This action cannot be undone.
            </Text>
            <View style={styles.dialogActions}>
              <View style={{ flex: 1 }}>
                <Button variant="secondary" full size="lg" onPress={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  full size="lg"
                  leftIcon={<Trash2 size={16} color={colors.white} />}
                  onPress={handleDeleteConfirmed}
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

function StatTile({ Icon, label, value, tint }: { Icon: any; label: string; value: string; tint?: string }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.stat}>
      <View style={[styles.statIco, tint ? { backgroundColor: 'transparent' } : null]}>
        <Icon size={14} color={tint ?? colors.primary} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function CurriculumTree({ semesters }: { semesters: BuilderSemester[] }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (semesters[0]) init[semesters[0].id] = true;
    return init;
  });
  return (
    <View style={{ gap: 10 }}>
      {semesters.map((sem) => {
        const isOpen = !!open[sem.id];
        const subjectCount = sem.subjects.length;
        const lessonCount = sem.subjects.reduce((n, s) => n + s.lessons.length, 0);
        return (
          <View key={sem.id} style={styles.curSemester}>
            <Pressable
              onPress={() => setOpen((p) => ({ ...p, [sem.id]: !isOpen }))}
              style={styles.curSemHead}
            >
              <View style={styles.curSemIco}>
                <GraduationCap size={16} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.curSemName}>{sem.name}</Text>
                <Text style={styles.curSemMeta}>
                  {subjectCount} subject{subjectCount === 1 ? '' : 's'} Â· {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
                </Text>
              </View>
              {isOpen
                ? <ChevronUp size={18} color={colors.white} />
                : <ChevronDown size={18} color={colors.white} />}
            </Pressable>
            {isOpen && (
              <View style={styles.curSemBody}>
                {sem.subjects.map((sub) => (
                  <View key={sub.id} style={styles.curSubject}>
                    <View style={styles.curSubjectHead}>
                      <View style={styles.curSubjectIco}>
                        <BookOpen size={13} color={colors.primary} />
                      </View>
                      <Text style={styles.curSubjectTitle}>{sub.title}</Text>
                      <Text style={styles.curSubjectCount}>{sub.lessons.length}</Text>
                    </View>
                    {sub.lessons.map((lesson, i) => (
                      <CurriculumLesson key={lesson.id} index={i + 1} lesson={lesson} />
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function CurriculumLesson({ index, lesson }: { index: number; lesson: BuilderLesson }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.curLesson}>
      <View style={styles.curLessonIco}>
        <Text style={styles.curLessonNum}>{index}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.curLessonTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={styles.curLessonMeta}>
          {lesson.url ? (
            <View style={styles.metaChip}>
              <TvMinimalPlay size={10} color={colors.error} />
              <Text style={styles.metaChipText}>Video</Text>
            </View>
          ) : null}
          {lesson.attachments.length ? (
            <View style={styles.metaChip}>
              <Paperclip size={10} color={colors.bodyGreen} />
              <Text style={styles.metaChipText}>{lesson.attachments.length}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  coverWrap: { paddingHorizontal: 16, paddingTop: 4 },
  head: { paddingHorizontal: 16, paddingTop: 14, gap: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kindLabel: { fontSize: 11, fontWeight: '700', color: colors.bodyGreen, letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary, letterSpacing: -0.4, lineHeight: 26, marginTop: 2 },
  desc: { fontSize: 13, color: colors.bodyGreen, lineHeight: 18, marginTop: 2 },

  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, paddingTop: 14,
  },
  stat: {
    width: '48%',
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 12,
  },
  statIco: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 14, fontWeight: '700', color: colors.primary, letterSpacing: -0.2 },
  statLabel: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },

  instructorWrap: { paddingHorizontal: 16, paddingTop: 14 },
  instructorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12,
    backgroundColor: colors.lightGray,
  },
  instructorLabel: { fontSize: 11, color: colors.bodyGreen, fontWeight: '600' },
  instructorName: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 1 },

  section: { padding: 16, gap: 12, paddingTop: 20 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primary },
  muted: { fontSize: 11, color: colors.muted },

  curSemester: { backgroundColor: colors.brand, borderRadius: 14, overflow: 'hidden' },
  curSemHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  curSemIco: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: 'rgba(188,233,85,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  curSemName: { color: colors.white, fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  curSemMeta: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 },
  curSemBody: { paddingHorizontal: 8, paddingBottom: 8, gap: 8 },
  curSubject: {
    backgroundColor: colors.surface,
    borderRadius: 12, padding: 8, gap: 6,
  },
  curSubjectHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingTop: 4 },
  curSubjectIco: {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  curSubjectTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.primary, letterSpacing: -0.1 },
  curSubjectCount: {
    fontSize: 10, fontWeight: '700', color: colors.primary,
    paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: colors.lightGray, borderRadius: 9999,
  },
  curLesson: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 10,
  },
  curLessonIco: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  curLessonNum: { fontSize: 11, fontWeight: '700', color: colors.primary },
  curLessonTitle: { fontSize: 13, fontWeight: '700', color: colors.primary },
  curLessonMeta: { flexDirection: 'row', gap: 4, marginTop: 4 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999,
    backgroundColor: colors.surface,
  },
  metaChipText: { fontSize: 9, fontWeight: '700', color: colors.bodyGreen },

  // 3-dot menu
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
