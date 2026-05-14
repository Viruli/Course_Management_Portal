import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import {
  ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2, BookOpen,
  Layers, FilePlus, GraduationCap, Hash,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Button } from '../../components/Button';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import { useCourseBuilderStore } from '../../store/courseBuilderStore';
import {
  createSemester, updateSemester, deleteSemester,
} from '../../services/semesters';
import {
  createSubject, updateSubject, deleteSubject,
  listLessons,
  youtubeIdFromInput,
} from '../../services/subjects';
import { listSemesters } from '../../services/semesters';
import { updateCourse, publishCourse, getCourseById } from '../../services/courses';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import { DebugPanel } from '../../components/DebugPanel';
import { CoverImagePicker } from '../../components/CoverImagePicker';

interface Props {
  route?: { params?: { mode?: 'create' | 'edit'; courseId?: string } };
  navigation: any;
}

export function CourseBuilderScreen({ route, navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const course     = useCourseBuilderStore((s) => s.course);
  const courseId   = useCourseBuilderStore((s) => s.courseId);
  const isEditing  = useCourseBuilderStore((s) => s.isEditing);
  const loadExisting   = useCourseBuilderStore((s) => s.loadExisting);
  const loadFullCourse = useCourseBuilderStore((s) => s.loadFullCourse);
  const { setTitle, setDescription, setCoverImageUrl,
          addSemester, renameSemester, removeSemester,
          addSubject, renameSubject, removeSubject, removeLesson } = useCourseBuilderStore();

  const [expanded,   setExpanded]   = useState<Record<string, boolean>>({});
  const [actionId,   setActionId]   = useState<string | null>(null);  // in-flight ID
  const [publishing, setPublishing] = useState(false);
  const [hydrating,  setHydrating]  = useState(false);

  // Hydrate from API whenever the screen is opened in edit mode (route params
  // contain courseId). Always re-fetches so the builder shows the latest
  // semesters/subjects/lessons from the backend rather than stale session data.
  useEffect(() => {
    const paramCourseId = route?.params?.courseId;
    if (!paramCourseId) return;
    let cancelled = false;
    setHydrating(true);

    const hydrate = async () => {
      const res = await getCourseById(paramCourseId);
      if (cancelled) return;

      // Always hydrate course metadata first so the user can edit title/desc/cover
      // even if the semester tree can't be fetched.
      loadExisting(
        paramCourseId,
        res.data.title ?? '',
        res.data.description ?? '',
        (res.data.coverImageUrl as string) ?? '',
      );

      // Try to hydrate the semester/subject/lesson tree. Source order:
      //   (a) embedded array in GET /courses/:id (per API spec)
      //   (b) GET /courses/:id/semesters (defensive fallback)
      // Handle v1.1 (name/sortOrder) and v1.2 (title/order) field names.
      let apiSemesters: any[] = Array.isArray((res.data as any).semesters)
        ? (res.data as any).semesters
        : [];

      if (apiSemesters.length === 0 && (res.data.semesterCount ?? 0) > 0) {
        try {
          const semRes = await listSemesters(paramCourseId);
          apiSemesters = semRes.data ?? [];
        } catch { /* leave empty — backend may not expose this endpoint */ }
      }
      if (cancelled || apiSemesters.length === 0) return;

      const builderSemesters = await Promise.all(apiSemesters.map(async (apiSem: any) => {
        const apiSubjects: any[] = Array.isArray(apiSem.subjects) ? apiSem.subjects : [];
        const builderSubjects = await Promise.all(apiSubjects.map(async (apiSub: any) => {
          let lessons: any[] = [];
          try {
            const lesRes = await listLessons(apiSub.id);
            lessons = lesRes.data ?? [];
          } catch { /* no lessons for this subject */ }
          return {
            id:    apiSub.id,
            title: apiSub.title ?? apiSub.name ?? '',
            lessons: lessons.map((l) => ({
              id:          l.id,
              title:       l.title ?? '',
              description: l.description ?? '',
              url:         l.url ?? '',
              attachments: [],
            })),
          };
        }));
        return {
          id:    apiSem.id,
          title: apiSem.title ?? apiSem.name ?? '',
          subjects: builderSubjects,
        };
      }));

      if (cancelled) return;
      loadFullCourse(paramCourseId, {
        id:            paramCourseId,
        title:         res.data.title ?? '',
        description:   res.data.description ?? '',
        coverImageUrl: (res.data.coverImageUrl as string) ?? '',
        semesters:     builderSemesters,
      });
    };

    hydrate()
      .catch(() => { if (!cancelled) toast.error('Failed to load course for editing.'); })
      .finally(() => { if (!cancelled) setHydrating(false); });
    return () => { cancelled = true; };
  }, [route?.params?.courseId, courseId, loadExisting, loadFullCourse]);

  // ── Add semester modal state ──────────────────────────────────────────────
  const [semModal,    setSemModal]    = useState(false);
  const [semTitle,    setSemTitle]    = useState('');
  const [semError,    setSemError]    = useState('');
  const [semSaving,   setSemSaving]   = useState(false);

  // ── Add subject modal state ───────────────────────────────────────────────
  const [subModal,  setSubModal]  = useState<{ semesterId: string } | null>(null);
  const [subTitle,  setSubTitle]  = useState('');
  const [subDesc,   setSubDesc]   = useState('');
  const [subUrl,    setSubUrl]    = useState('');
  const [subError,  setSubError]  = useState('');
  const [subSaving, setSubSaving] = useState(false);

  // Keep newly-added semesters expanded by default.
  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const sem of course.semesters) if (!(sem.id in next)) next[sem.id] = true;
      return next;
    });
  }, [course.semesters.length]);

  const lessonCount = useMemo(
    () => course.semesters.reduce(
      (n, sem) => n + sem.subjects.reduce((m, sub) => m + sub.lessons.length, 0),
      0,
    ),
    [course],
  );

  // ── API-backed mutations ──────────────────────────────────────────────────

  const onAddSemester = () => {
    if (!courseId) { toast.error('Save the course first.'); return; }
    setSemTitle(''); setSemError('');
    setSemModal(true);
  };

  const onSubmitSemester = async () => {
    if (!semTitle.trim()) { setSemError('Semester title is required.'); return; }
    setSemSaving(true); setSemError('');
    try {
      const result = await createSemester(courseId!, { title: semTitle.trim() });
      addSemester(result.data.id, result.data.title ?? semTitle.trim());
      setExpanded((p) => ({ ...p, [result.data.id]: true }));
      setSemModal(false);
    } catch (err) {
      if (err instanceof ApiError) setSemError(`${err.code}: ${err.message}`);
      else setSemError('Failed to add semester. Try again.');
    } finally { setSemSaving(false); }
  };

  const onRenameSemester = (semesterId: string, title: string) => {
    renameSemester(semesterId, title);
    updateSemester(semesterId, { title }).catch(() => {});
  };

  const onRemoveSemester = async (semesterId: string) => {
    setActionId(semesterId);
    try { await deleteSemester(semesterId); removeSemester(semesterId); }
    catch { toast.error('Failed to delete semester.'); }
    finally { setActionId(null); }
  };

  const onOpenSubjectModal = (semesterId: string) => {
    setSubModal({ semesterId });
    setSubTitle(''); setSubDesc(''); setSubUrl(''); setSubError('');
  };

  const onSubmitSubject = async () => {
    if (!subModal) return;
    if (!subTitle.trim()) { setSubError('Title is required.'); return; }
    setSubSaving(true); setSubError('');
    try {
      const payload: Parameters<typeof createSubject>[1] = {
        title:       subTitle.trim(),
        description: subDesc.trim(),
      };
      if (subUrl.trim()) {
        const id = youtubeIdFromInput(subUrl.trim());
        if (!id) {
          setSubError("That doesn't look like a valid YouTube URL or ID.");
          setSubSaving(false);
          return;
        }
        payload.youtubeVideoId = id;
      }
      const r = await createSubject(subModal.semesterId, payload);
      addSubject(subModal.semesterId, r.data.id, r.data.title);
      setSubModal(null);
    } catch (err) {
      if (err instanceof ApiError) setSubError(`[${err.code}] ${err.message}`);
      else setSubError('Failed to add subject. Try again.');
    } finally { setSubSaving(false); }
  };

  // ── Add lesson — navigate straight into the editor in create mode ────────
  const onAddLesson = (semesterId: string, subjectId: string) => {
    navigation.navigate('LessonEditor', { semesterId, subjectId });
  };

  const onRenameSubject = (semId: string, subId: string, title: string) => {
    renameSubject(semId, subId, title);
    updateSubject(subId, { title }).catch(() => {});
  };

  const onRemoveSubject = async (semesterId: string, subjectId: string) => {
    setActionId(subjectId);
    try { await deleteSubject(subjectId); removeSubject(semesterId, subjectId); }
    catch { toast.error('Failed to delete subject.'); }
    finally { setActionId(null); }
  };

  const onSaveDraft = async () => {
    if (courseId && course.title.trim()) {
      const patch: Parameters<typeof updateCourse>[1] = {
        title:       course.title.trim(),
        description: course.description.trim(),
      };
      if (course.coverImageUrl.trim()) patch.coverImageUrl = course.coverImageUrl.trim();
      updateCourse(courseId, patch).catch(() => {});
    }
    toast.info(course.title.trim() ? `Draft saved: "${course.title}".` : 'Draft saved.');
    navigation.goBack();
  };

  const onPublish = async () => {
    if (!courseId) { toast.error('Course not saved yet.'); return; }
    setPublishing(true);
    try {
      await publishCourse(courseId);
      toast.success(`"${course.title}" published!`);
      navigation.goBack();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'EMPTY_SEMESTER') toast.error('Every semester needs at least one subject.');
        else if (err.code === 'NO_SEMESTERS') toast.error('Add at least one semester first.');
        else if (err.code === 'INVALID_STATE') toast.error('This course is already published.');
        else toast.error(err.message);
      } else { toast.error('Publish failed. Try again.'); }
    } finally { setPublishing(false); }
  };

  const openLesson = (semesterId: string, subjectId: string, lessonId: string) => {
    navigation.navigate('LessonEditor', { semesterId, subjectId, lessonId });
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title={isEditing ? 'Edit course' : 'New course'}
        subtitle={`${course.semesters.length} semesters · ${lessonCount} lessons`}
        leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Course basics */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Course basics</Text>
          <View style={{ gap: 12 }}>
            <Field label="Course title">
              <TextInput
                value={course.title}
                onChangeText={setTitle}
                placeholder="e.g. Mathematics Foundations"
                placeholderTextColor={colors.muted}
                style={styles.input}
                maxLength={200}
              />
            </Field>

            <Field label="Description">
              <TextInput
                value={course.description}
                onChangeText={setDescription}
                placeholder="What will students learn?"
                placeholderTextColor={colors.muted}
                multiline
                style={[styles.input, styles.textarea]}
                textAlignVertical="top"
                maxLength={5000}
              />
            </Field>

            <Field label="Cover image (optional)">
              <CoverImagePicker
                value={course.coverImageUrl}
                onChange={setCoverImageUrl}
              />
            </Field>
          </View>
        </View>

        {/* Curriculum */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Curriculum</Text>
            <Text style={styles.muted}>{course.semesters.length} semesters</Text>
          </View>

          {course.semesters.length === 0 ? (
            <View style={styles.emptyCurriculum}>
              <View style={styles.emptyIco}>
                <Layers size={22} color={colors.bodyGreen} />
              </View>
              <Text style={styles.emptyTitle}>No semesters yet</Text>
              <Text style={styles.emptyBody}>Add the first semester, then break it down into subjects and lessons.</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {course.semesters.map((sem) => {
                const isOpen = !!expanded[sem.id];
                return (
                  <View key={sem.id} style={styles.semester}>
                    <Pressable
                      style={styles.semesterHead}
                      onPress={() => setExpanded((p) => ({ ...p, [sem.id]: !isOpen }))}
                    >
                      <View style={styles.semesterIco}>
                        <GraduationCap size={16} color={colors.accent} />
                      </View>
                      <TextInput
                        value={sem.title}
                        onChangeText={(v) => onRenameSemester(sem.id, v)}
                        placeholder="Semester title"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        style={styles.semesterTitle}
                      />
                      <Text style={styles.semesterCount}>
                        {sem.subjects.length} subj · {sem.subjects.reduce((n, s) => n + s.lessons.length, 0)} lsn
                      </Text>
                      <Pressable
                        hitSlop={8}
                        onPress={() => onRemoveSemester(sem.id)}
                        style={styles.headBtn}
                      >
                        <Trash2 size={14} color="rgba(255,255,255,0.55)" />
                      </Pressable>
                      <View style={styles.headBtn}>
                        {isOpen
                          ? <ChevronUp size={16} color={colors.white} />
                          : <ChevronDown size={16} color={colors.white} />}
                      </View>
                    </Pressable>

                    {isOpen && (
                      <View style={styles.semesterBody}>
                        {sem.subjects.length === 0 ? (
                          <View style={styles.subjectEmpty}>
                            <Hash size={12} color={colors.muted} />
                            <Text style={styles.subjectEmptyText}>No subjects yet</Text>
                          </View>
                        ) : (
                          sem.subjects.map((sub) => (
                            <View key={sub.id} style={styles.subject}>
                              <View style={styles.subjectHead}>
                                <View style={styles.subjectIco}>
                                  <BookOpen size={14} color={colors.primary} />
                                </View>
                                <TextInput
                                  value={sub.title}
                                  onChangeText={(v) => onRenameSubject(sem.id, sub.id, v)}
                                  placeholder="Subject title"
                                  placeholderTextColor={colors.muted}
                                  style={styles.subjectTitle}
                                />
                                <Pressable
                                  hitSlop={8}
                                  onPress={() => onRemoveSubject(sem.id, sub.id)}
                                >
                                  <Trash2 size={14} color={colors.muted} />
                                </Pressable>
                              </View>

                              {sub.lessons.map((lesson, i) => (
                                <Pressable
                                  key={lesson.id}
                                  onPress={() => openLesson(sem.id, sub.id, lesson.id)}
                                  style={styles.lessonRow}
                                >
                                  <View style={styles.lessonNum}>
                                    <Text style={styles.lessonNumText}>{i + 1}</Text>
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.lessonTitle} numberOfLines={1}>
                                      {lesson.title || 'Untitled lesson'}
                                    </Text>
                                    <Text style={styles.lessonMeta}>
                                      {lesson.url ? '· Video' : '· No video'}
                                      {lesson.attachments.length ? `  ·  ${lesson.attachments.length} attachment${lesson.attachments.length === 1 ? '' : 's'}` : ''}
                                    </Text>
                                  </View>
                                  <Pressable
                                    hitSlop={6}
                                    onPress={() => removeLesson(sem.id, sub.id, lesson.id)}
                                  >
                                    <Trash2 size={13} color={colors.muted} />
                                  </Pressable>
                                </Pressable>
                              ))}

                              <Pressable
                                style={styles.addLine}
                                onPress={() => onAddLesson(sem.id, sub.id)}
                              >
                                <FilePlus size={14} color={colors.primary} />
                                <Text style={styles.addLineText}>Add lesson</Text>
                              </Pressable>
                            </View>
                          ))
                        )}

                        <Pressable
                          style={styles.addSubject}
                          onPress={() => onOpenSubjectModal(sem.id)}
                        >
                          <Plus size={14} color={colors.primary} />
                          <Text style={styles.addSubjectText}>Add subject</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <Pressable
            style={[styles.addSemester, !courseId && { opacity: 0.4 }]}
            onPress={onAddSemester}
            disabled={!courseId}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={styles.addSemesterText}>Add semester</Text>
          </Pressable>
        </View>
        <DebugPanel
          tags={['semesters.create', 'semesters.update', 'subjects.create', 'subjects.update', 'lessons.create', 'courses.publish']}
          title="Builder debug"
        />
      </ScrollView>

      {/* Sticky save bar */}
      <View style={styles.stickyBar}>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" size="lg" full onPress={onSaveDraft}>Save draft</Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            size="lg" full
            disabled={!course.title.trim() || course.semesters.length === 0 || publishing}
            onPress={onPublish}
          >
            {publishing ? 'Publishing…' : isEditing ? 'Update' : 'Publish'}
          </Button>
        </View>
      </View>

      {/* Add semester modal */}
      <Modal transparent animationType="slide" visible={semModal} onRequestClose={() => setSemModal(false)}>
        <Pressable style={subStyles.backdrop} onPress={() => setSemModal(false)}>
          <Pressable style={subStyles.sheet} onPress={() => {}}>
            <Text style={subStyles.title}>Add semester</Text>
            <TextInput
              style={subStyles.input}
              value={semTitle}
              onChangeText={(t) => { setSemTitle(t); setSemError(''); }}
              placeholder="e.g. Semester 1"
              placeholderTextColor="#999"
              autoFocus
            />
            {semError ? <Text style={subStyles.error}>{semError}</Text> : null}
            <Button full disabled={semSaving} onPress={onSubmitSemester}>
              {semSaving ? 'Adding…' : 'Add semester'}
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add subject modal */}
      <Modal transparent animationType="slide" visible={subModal !== null} onRequestClose={() => setSubModal(null)}>
        <Pressable style={subStyles.backdrop} onPress={() => setSubModal(null)}>
          <Pressable style={subStyles.sheet} onPress={() => {}}>
            <Text style={subStyles.title}>Add subject</Text>
            <TextInput
              style={subStyles.input}
              value={subTitle}
              onChangeText={(t) => { setSubTitle(t); setSubError(''); }}
              placeholder="Subject title *"
              placeholderTextColor="#999"
              autoFocus
              maxLength={200}
            />
            <TextInput
              style={[subStyles.input, subStyles.multi]}
              value={subDesc}
              onChangeText={(t) => { setSubDesc(t); setSubError(''); }}
              placeholder="Description (optional)"
              placeholderTextColor="#999"
              multiline
              maxLength={2000}
            />
            <TextInput
              style={subStyles.input}
              value={subUrl}
              onChangeText={(t) => { setSubUrl(t); setSubError(''); }}
              placeholder="YouTube URL or video ID (optional)"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            {subError ? <Text style={subStyles.error}>{subError}</Text> : null}
            <Button full disabled={subSaving} onPress={onSubmitSubject}>
              {subSaving ? 'Adding…' : 'Add subject'}
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

    </ScreenContainer>
  );
}

const subStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 12 },
  title:    { fontSize: 17, fontWeight: '700', color: '#152A24' },
  input:    { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 14, color: '#152A24' },
  multi:    { minHeight: 70, textAlignVertical: 'top' as const },
  error:    { fontSize: 12, color: '#E53E3E', fontWeight: '600' },
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 16, paddingBottom: 110 },
  section: {
    padding: 14, gap: 14,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 16,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.bodyGreen, letterSpacing: 0.6, textTransform: 'uppercase' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muted: { fontSize: 11, color: colors.muted },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.primary },

  input: {
    backgroundColor: colors.lightGray,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, height: 46,
    fontSize: 14, color: colors.primary,
  },
  textarea: { height: 90, paddingTop: 12, paddingBottom: 12 },

  emptyCurriculum: {
    alignItems: 'center', padding: 24, gap: 6,
    backgroundColor: colors.lightGray, borderRadius: 12,
  },
  emptyIco: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 4 },
  emptyBody: { fontSize: 12, color: colors.bodyGreen, textAlign: 'center', maxWidth: 240, lineHeight: 16 },

  // Semester (dark card)
  semester: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    overflow: 'hidden',
  },
  semesterHead: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, paddingRight: 6,
  },
  semesterIco: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(188,233,85,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  semesterTitle: {
    flex: 1, color: colors.white,
    fontSize: 14, fontWeight: '700', padding: 0, letterSpacing: -0.2,
  },
  semesterCount: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },
  headBtn: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  semesterBody: {
    padding: 8, paddingTop: 0, gap: 10,
  },

  // Subject (light card inside semester)
  subject: {
    backgroundColor: colors.surface,
    borderRadius: 12, padding: 10, gap: 6,
  },
  subjectHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectIco: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  subjectTitle: {
    flex: 1, fontSize: 13, fontWeight: '700', color: colors.primary, padding: 0,
  },
  subjectEmpty: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 12, justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10,
  },
  subjectEmptyText: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },

  // Lesson row
  lessonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, paddingHorizontal: 6,
    borderTopColor: colors.stroke2, borderTopWidth: StyleSheet.hairlineWidth,
  },
  lessonNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  lessonNumText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  lessonTitle: { fontSize: 13, fontWeight: '600', color: colors.primary },
  lessonMeta: { fontSize: 10, color: colors.muted, marginTop: 1 },

  addLine: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8,
    justifyContent: 'center',
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 10, borderStyle: 'dashed',
    marginTop: 4,
  },
  addLineText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  addSubject: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10,
  },
  addSubjectText: { fontSize: 12, fontWeight: '700', color: colors.white },
  addSemester: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: colors.lightGray, borderRadius: 12,
  },
  addSemesterText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  stickyBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopColor: colors.stroke, borderTopWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
});
