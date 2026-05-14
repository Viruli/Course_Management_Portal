import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Image, Modal, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, MoreVertical, Pencil, Trash2, AlertTriangle,
  ChevronDown, ChevronUp, GraduationCap, BookOpen,
  Layers, PlayCircle, CheckCircle, ChevronRight,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { CourseCover } from '../../components/CourseCover';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DebugPanel } from '../../components/DebugPanel';
import {
  getCourseById, deleteCourse,
  ApiCourseDetail, ApiSemesterInTree,
} from '../../services/courses';
import { listSemesters } from '../../services/semesters';
import { listSubjects, listLessons, ApiLesson } from '../../services/subjects';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import { useCourseBuilderStore } from '../../store/courseBuilderStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

// Each subject in the embedded tree (no fields beyond id/title/order) gets
// augmented locally with the lessons list fetched via GET /subjects/:id/lessons.
type SubjectWithLessons = ApiSemesterInTree['subjects'][number] & { lessons: ApiLesson[] };
type SemesterRow        = Omit<ApiSemesterInTree, 'subjects'> & { subjects: SubjectWithLessons[] };

interface Props {
  courseId?:  string;
  course?:    any;       // legacy — ignored when courseId is present
  navigation: any;       // stack navigator for subject/lesson detail pushes
  onBack: () => void;
  onEdit: (courseId: string) => void;
}

export function CourseViewScreen({ courseId, navigation, onBack, onEdit }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [detail,        setDetail]        = useState<ApiCourseDetail | null>(null);
  const [semesters,     setSemesters]     = useState<SemesterRow[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [usedBuilderCache, setUsedBuilderCache] = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  // In-session fallback: if the backend doesn't return the embedded semester
  // tree from GET /courses/:id (and has no list endpoint), use whatever the
  // user just authored in the builder for the same courseId.
  const builderCourseId   = useCourseBuilderStore((s) => s.courseId);
  const builderSemesters  = useCourseBuilderStore((s) => s.course.semesters);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      // 1. Fetch course metadata + embedded semester/subject tree.
      const courseRes = await getCourseById(courseId);
      if (cancelled) return;
      setDetail(courseRes.data);

      // 2. Read and normalise the embedded semesters array.
      //    The backend (v1.1) uses semester.name / semester.sortOrder;
      //    the v1.2 spec uses semester.title / semester.order.
      //    We handle both so the view works regardless of which the backend returns.
      const rawData = courseRes.data as any;
      const rawSems: any[] = Array.isArray(rawData.semesters) ? rawData.semesters : [];

      // Normalise into a consistent shape.
      const normaliseSem = (s: any): ApiSemesterInTree => ({
        id:           s.id,
        title:        s.title ?? s.name ?? '',        // v1.2 title | v1.1 name
        subjectCount: s.subjectCount ?? 0,
        order:        s.order ?? s.sortOrder ?? 0,    // v1.2 order | v1.1 sortOrder
        createdAt:    s.createdAt ?? '',
        updatedAt:    s.updatedAt ?? '',
        subjects: (Array.isArray(s.subjects) ? s.subjects : []).map((sub: any) => ({
          id:        sub.id,
          title:     sub.title ?? sub.name ?? '',
          order:     sub.order ?? sub.sortOrder ?? 0,
          createdAt: sub.createdAt ?? '',
          updatedAt: sub.updatedAt ?? '',
        })),
      });

      let semList: ApiSemesterInTree[] = rawSems.map(normaliseSem);

      // 3. If the embedded array is empty (backend not yet returning the tree)
      //    try the list endpoint as a fallback.
      if (semList.length === 0 && (courseRes.data.semesterCount ?? 0) > 0) {
        try {
          const semRes = await listSemesters(courseId);
          semList = (semRes.data ?? []).map((s) => normaliseSem(s));
        } catch { /* leave empty, fall through to builder-cache below */ }
      }

      // 4. In-session builder-cache fallback: if still empty and the user just
      //    authored the course in this session, show the builder state.
      if (
        semList.length === 0 &&
        (courseRes.data.semesterCount ?? 0) > 0 &&
        builderCourseId === courseId &&
        builderSemesters.length > 0
      ) {
        const cached: SemesterRow[] = builderSemesters.map((sem, sIdx) => ({
          id:           sem.id,
          title:        sem.title,
          subjectCount: sem.subjects.length,
          order:        sIdx + 1,
          createdAt:    '',
          updatedAt:    '',
          subjects: sem.subjects.map((sub, subIdx) => ({
            id:        sub.id,
            title:     sub.title,
            order:     subIdx + 1,
            createdAt: '',
            updatedAt: '',
            lessons:   sub.lessons.map((l, lIdx) => ({
              id:          l.id,
              subjectId:   sub.id,
              courseId:    courseId,
              semesterId:  sem.id,
              title:       l.title,
              description: l.description,
              url:         l.url,
              order:       lIdx + 1,
              deletedAt:   null,
              createdAt:   '',
              updatedAt:   '',
            } as ApiLesson)),
          })),
        }));
        if (!cancelled) {
          setSemesters(cached);
          setUsedBuilderCache(true);
        }
        return;
      }

      // 5. For each normalised semester, hydrate subjects (from embedded list or
      //    separate endpoint) and fetch lessons per subject.
      const withLessons: SemesterRow[] = await Promise.all(
        semList.map(async (sem) => {
          // subjects already normalised in step 2; fall back to list endpoint
          // if they're missing despite subjectCount > 0.
          let subjects = sem.subjects as any[];
          if (subjects.length === 0 && (sem.subjectCount ?? 0) > 0) {
            try {
              const subRes = await listSubjects(sem.id);
              subjects = (subRes.data ?? []).map((s: any) => ({
                id:        s.id,
                title:     s.title ?? s.name ?? '',
                order:     s.order ?? s.sortOrder ?? 0,
                createdAt: s.createdAt ?? '',
                updatedAt: s.updatedAt ?? '',
              }));
            } catch { /* subjects stays empty */ }
          }

          // Fetch lessons for each subject.
          const subjectsWithLessons: SubjectWithLessons[] = await Promise.all(
            subjects.map(async (sub) => {
              try {
                const lesRes = await listLessons(sub.id);
                return { ...sub, lessons: lesRes.data ?? [] };
              } catch {
                return { ...sub, lessons: [] as ApiLesson[] };
              }
            }),
          );

          return { ...sem, subjects: subjectsWithLessons };
        }),
      );

      if (!cancelled) {
        setSemesters(withLessons);
        setUsedBuilderCache(false);
      }
    };

    load()
      .catch(() => { if (!cancelled) toast.error('Failed to load course.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [courseId]);

  const subjectCount = useMemo(
    () => semesters.reduce((n, sem) => n + sem.subjects.length, 0),
    [semesters],
  );
  const lessonCount = useMemo(
    () => semesters.reduce(
      (n, sem) => n + sem.subjects.reduce((m, sub) => m + sub.lessons.length, 0),
      0,
    ),
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
  const handleDeleteConfirmed = async () => {
    if (!courseId) return;
    setDeleting(true);
    try {
      await deleteCourse(courseId);
      toast.success(`Deleted "${resolvedTitle}".`);
      setConfirmDelete(false);
      onBack();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Delete failed. Please try again.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
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
            {detail?.coverImageUrl ? (
              <Image
                source={{ uri: detail.coverImageUrl }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <CourseCover
                kind="cs"
                emblem={resolvedTitle.slice(0, 2).toUpperCase()}
                tag=""
                height={180}
              />
            )}
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
            <StatTile Icon={Layers}     label="Semesters" value={String(detail?.semesterCount ?? semesters.length)} />
            <StatTile Icon={BookOpen}   label="Subjects"  value={String(subjectCount)} />
            <StatTile Icon={PlayCircle} label="Lessons"   value={String(lessonCount)} wide />
          </View>

          {/* Curriculum */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Curriculum</Text>
              <Text style={styles.muted}>
                {semesters.length} semester{semesters.length === 1 ? '' : 's'} · {subjectCount} subject{subjectCount === 1 ? '' : 's'}
              </Text>
            </View>
            {usedBuilderCache ? (
              <View style={styles.cacheBanner}>
                <Text style={styles.cacheBannerText}>
                  Showing local builder data. The backend's GET /courses/:id is not
                  returning the embedded semester tree yet, so this view will be
                  empty on a fresh sign-in until the backend is updated.
                </Text>
              </View>
            ) : null}
            {semesters.length > 0 ? (
              <CurriculumTree semesters={semesters} navigation={navigation} />
            ) : (detail?.semesterCount ?? 0) > 0 ? (
              <View style={styles.cacheBanner}>
                <Text style={styles.cacheBannerText}>
                  {detail?.semesterCount} semester{detail?.semesterCount === 1 ? '' : 's'} exist on the backend, but
                  GET /courses/:id is not returning them and there's no list endpoint
                  to fall back to. This needs a backend fix — see the DEBUG panel for
                  the raw response.
                </Text>
              </View>
            ) : (
              <Text style={styles.empty}>No semesters added yet.</Text>
            )}
          </View>

          <DebugPanel
            tags={['courses.getById', 'semesters.list', 'subjects.list', 'lessons.list']}
            title="View debug"
          />
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
                    <Text style={styles.menuItemDesc}>Update title, curriculum, and lessons.</Text>
                  </View>
                </Pressable>

                <Pressable style={styles.menuItem} onPress={handleDeleteRequested}>
                  <View style={[styles.menuIco, { backgroundColor: colors.errorBg }]}>
                    <Trash2 size={16} color={colors.error} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuItemLabel, { color: colors.error }]}>Delete course</Text>
                    <Text style={styles.menuItemDesc}>Soft-delete; recoverable for 30 days.</Text>
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
        <Pressable style={styles.dialogBackdrop} onPress={() => !deleting && setConfirmDelete(false)}>
          <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialogIco}>
              <AlertTriangle size={24} color={colors.error} />
            </View>
            <Text style={styles.dialogTitle}>Delete "{resolvedTitle}"?</Text>
            <Text style={styles.dialogBody}>
              Soft-deletes the course; recoverable for 30 days.
            </Text>
            <View style={styles.dialogActions}>
              <View style={{ flex: 1 }}>
                <Button variant="secondary" full size="lg" disabled={deleting} onPress={() => setConfirmDelete(false)}>Cancel</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  full size="lg"
                  disabled={deleting}
                  leftIcon={<Trash2 size={16} color={colors.white} />}
                  onPress={handleDeleteConfirmed}
                  style={{ backgroundColor: colors.error, borderColor: colors.error } as any}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
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

function CurriculumTree({ semesters, navigation }: { semesters: SemesterRow[]; navigation: any }) {
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
                <Text style={styles.curSemName}>{sem.title}</Text>
                <Text style={styles.curSemMeta}>
                  {sem.subjects.length} subject{sem.subjects.length === 1 ? '' : 's'}
                </Text>
              </View>
              {isOpen
                ? <ChevronUp size={18} color={colors.white} />
                : <ChevronDown size={18} color={colors.white} />}
            </Pressable>

            {isOpen && (
              <View style={styles.curSemBody}>
                {sem.subjects.length === 0 ? (
                  <Text style={styles.empty}>No subjects yet.</Text>
                ) : (
                  sem.subjects.map((sub) => (
                    // Tap subject → SubjectDetailScreen
                    <Pressable
                      key={sub.id}
                      style={styles.curSubject}
                      onPress={() => navigation.navigate('SubjectDetail', {
                        semesterTitle: sem.title,
                        subject: { ...sub },
                      })}
                    >
                      <View style={styles.curSubjectHead}>
                        <View style={styles.curSubjectIco}>
                          <BookOpen size={13} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.curSubjectTitle} numberOfLines={1}>{sub.title}</Text>
                          {(sub as any).description ? (
                            <Text style={styles.curSubjectDesc} numberOfLines={1}>
                              {(sub as any).description}
                            </Text>
                          ) : null}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.curSubjectCount}>
                            {sub.lessons.length} lesson{sub.lessons.length === 1 ? '' : 's'}
                          </Text>
                          {(sub as any).youtubeVideoId ? (
                            <PlayCircle size={12} color={colors.error} />
                          ) : null}
                          <ChevronRight size={14} color="rgba(255,255,255,0.5)" />
                        </View>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  coverWrap:   { paddingHorizontal: 16, paddingTop: 4 },
  coverImage:  { width: '100%', height: 180, borderRadius: 16 },
  head: { paddingHorizontal: 16, paddingTop: 14, gap: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary, letterSpacing: -0.4, lineHeight: 26, marginTop: 2 },
  desc:  { fontSize: 13, color: colors.bodyGreen, lineHeight: 18, marginTop: 2 },
  empty: { fontSize: 12, color: colors.muted, paddingVertical: 8, textAlign: 'center' },
  cacheBanner: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning, borderWidth: 1,
    borderRadius: 12, padding: 12,
  },
  cacheBannerText: { fontSize: 12, color: colors.warning, lineHeight: 17 },

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
  curSubjectCount: {
    fontSize: 10, fontWeight: '700', color: colors.primary,
    paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: colors.lightGray, borderRadius: 9999,
  },

  curLesson: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 7, paddingHorizontal: 4,
    borderTopColor: colors.stroke2, borderTopWidth: StyleSheet.hairlineWidth,
  },
  curLessonIco: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  curLessonNum:   { fontSize: 10, fontWeight: '700', color: colors.primary },
  curLessonTitle: { fontSize: 12, fontWeight: '600', color: colors.primary, flex: 1 },
  curLessonMeta:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  metaChipText:   { fontSize: 10, color: colors.bodyGreen },

  curSubjectDesc: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },

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
