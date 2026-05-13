import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, MoreVertical, Pencil, Trash2, AlertTriangle,
  ChevronDown, ChevronUp, GraduationCap, BookOpen,
  Layers, Users,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { CourseCover } from '../../components/CourseCover';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DebugPanel } from '../../components/DebugPanel';
import { getCourseById, ApiCourseDetail, ApiSemesterDetail } from '../../services/courses';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import { CheckCircle } from 'lucide-react-native';

interface Props {
  courseId?: string;
  course?: any;   // legacy — ignored when courseId is present
  onBack: () => void;
  onEdit: (courseId: string) => void;
}

export function CourseViewScreen({ courseId, onBack, onEdit }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [detail,        setDetail]        = useState<ApiCourseDetail | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    getCourseById(courseId)
      .then((r) => setDetail(r.data))
      .catch(() => toast.error('Failed to load course.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const semesters: ApiSemesterDetail[] = detail?.semesters ?? [];

  const subjectCount = useMemo(
    () => semesters.reduce((n, sem) => n + (sem.subjects?.length ?? 0), 0),
    [semesters],
  );

  const resolvedTitle = detail?.title ?? 'Course';

  const handleEdit = () => {
    setMenuOpen(false);
    if (courseId) onEdit(courseId);
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

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={styles.coverWrap}>
            <CourseCover kind="cs" emblem={resolvedTitle.slice(0, 2).toUpperCase()} tag="" height={180} />
          </View>

          <View style={styles.head}>
            <View style={styles.badgeRow}>
              <Badge tone="success" icon={<CheckCircle size={11} color={colors.successDeep} />}>
                {detail?.state === 'published' ? 'Published' : detail?.state ?? 'Draft'}
              </Badge>
            </View>
            <Text style={styles.title}>{resolvedTitle}</Text>
            {detail?.description ? (
              <Text style={styles.desc}>{detail.description}</Text>
            ) : null}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatTile Icon={Layers} label="Semesters" value={String(detail?.semesterCount ?? semesters.length)} />
            <StatTile Icon={BookOpen} label="Subjects"  value={String(subjectCount)} />
            <StatTile Icon={Users}  label="Created by" value={detail?.createdByName ?? '—'} wide />
          </View>

          {/* Instructor / creator */}
          <View style={styles.instructorWrap}>
            <View style={styles.instructorRow}>
              <Avatar size={42} name={detail?.createdByName ?? '?'} variant="dark" />
              <View style={{ flex: 1 }}>
                <Text style={styles.instructorLabel}>Created by</Text>
                <Text style={styles.instructorName}>{detail?.createdByName ?? '—'}</Text>
              </View>
            </View>
          </View>

          {/* Curriculum */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Curriculum</Text>
              <Text style={styles.muted}>
                {semesters.length} semester{semesters.length === 1 ? '' : 's'} · {subjectCount} subject{subjectCount === 1 ? '' : 's'}
              </Text>
            </View>
            {semesters.length > 0 ? (
              <CurriculumTree semesters={semesters} />
            ) : (
              <Text style={styles.empty}>No semesters added yet.</Text>
            )}
          </View>

          <DebugPanel tags={['courses.getById']} title="View debug" />
        </ScrollView>
      )}

      {/* 3-dot action menu */}
      <Modal transparent animationType="fade" visible={menuOpen} onRequestClose={() => setMenuOpen(false)}>
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
      <Modal transparent animationType="fade" visible={confirmDelete} onRequestClose={() => setConfirmDelete(false)}>
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
                <Button variant="secondary" full size="lg" onPress={() => setConfirmDelete(false)}>Cancel</Button>
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

function StatTile({ Icon, label, value, wide }: { Icon: any; label: string; value: string; wide?: boolean }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.stat, wide && styles.statWide]}>
      <View style={styles.statIco}>
        <Icon size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function CurriculumTree({ semesters }: { semesters: ApiSemesterDetail[] }) {
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
        const semName = (sem as any).title ?? sem.name;
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
                <Text style={styles.curSemName}>{semName}</Text>
                <Text style={styles.curSemMeta}>
                  {(sem.subjects ?? []).length} subject{(sem.subjects ?? []).length === 1 ? '' : 's'}
                </Text>
              </View>
              {isOpen
                ? <ChevronUp size={18} color={colors.white} />
                : <ChevronDown size={18} color={colors.white} />}
            </Pressable>

            {isOpen && (sem.subjects ?? []).length > 0 && (
              <View style={styles.curSemBody}>
                {(sem.subjects ?? []).map((sub) => (
                  <View key={sub.id} style={styles.curSubject}>
                    <View style={styles.curSubjectHead}>
                      <View style={styles.curSubjectIco}>
                        <BookOpen size={13} color={colors.primary} />
                      </View>
                      <Text style={styles.curSubjectTitle} numberOfLines={2}>{sub.title}</Text>
                    </View>
                    {sub.description ? (
                      <Text style={styles.curSubjectDesc} numberOfLines={2}>{sub.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {isOpen && (sem.subjects ?? []).length === 0 && (
              <View style={styles.curSemBody}>
                <Text style={styles.empty}>No subjects yet.</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  coverWrap: { paddingHorizontal: 16, paddingTop: 4 },
  head: { paddingHorizontal: 16, paddingTop: 14, gap: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary, letterSpacing: -0.4, lineHeight: 26, marginTop: 2 },
  desc:  { fontSize: 13, color: colors.bodyGreen, lineHeight: 18, marginTop: 2 },
  empty: { fontSize: 12, color: colors.muted, paddingVertical: 8, textAlign: 'center' },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  stat: {
    width: '47%',
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 12,
  },
  statWide: { width: '100%' },
  statIco: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
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
  instructorName:  { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 1 },

  section:     { padding: 16, gap: 12, paddingTop: 20 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: colors.primary },
  muted:       { fontSize: 11, color: colors.muted },

  curSemester: { backgroundColor: colors.brand, borderRadius: 14, overflow: 'hidden' },
  curSemHead:  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
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
    borderRadius: 12, padding: 10, gap: 4,
  },
  curSubjectHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  curSubjectIco: {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  curSubjectTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.primary },
  curSubjectDesc:  { fontSize: 11, color: colors.bodyGreen, lineHeight: 15, paddingLeft: 32 },

  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  menuPanel: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  menuHandle: {
    alignSelf: 'center', width: 38, height: 4, borderRadius: 2,
    backgroundColor: colors.stroke, marginBottom: 12,
  },
  menuTitle:     { fontSize: 16, fontWeight: '700', color: colors.primary, letterSpacing: -0.2 },
  menuSub:       { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12,
    borderColor: colors.stroke, borderWidth: 1,
    backgroundColor: colors.surface,
  },
  menuIco:       { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  menuItemLabel: { fontSize: 14, fontWeight: '700', color: colors.primary },
  menuItemDesc:  { fontSize: 11, color: colors.bodyGreen, marginTop: 2, lineHeight: 14 },

  dialogBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  dialog: {
    width: '100%', maxWidth: 360, padding: 20, borderRadius: 20,
    backgroundColor: colors.surface, alignItems: 'center', gap: 8,
  },
  dialogIco: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.errorBg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  dialogTitle:   { fontSize: 17, fontWeight: '700', color: colors.primary, letterSpacing: -0.2, textAlign: 'center' },
  dialogBody:    { fontSize: 13, color: colors.bodyGreen, textAlign: 'center', lineHeight: 18 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
});
