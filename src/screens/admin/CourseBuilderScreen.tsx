import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import {
  ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2, BookOpen,
  Layers, FilePlus, GraduationCap, Hash,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Button } from '../../components/Button';
import { Pill } from '../../components/Pill';
import { colors } from '../../theme/colors';
import { useCourseBuilderStore } from '../../store/courseBuilderStore';
import type { CourseType } from '../../data/types';

interface Props {
  route?: { params?: { mode?: 'create' | 'edit' } };
  navigation: any;
}

const courseTypes: CourseType[] = [
  'Engineering', 'Science', 'Mathematics', 'Language Arts',
  'Social Studies', 'Computing', 'Business', 'Creative',
];

export function CourseBuilderScreen({ navigation }: Props) {
  const course = useCourseBuilderStore((s) => s.course);
  const isEditing = useCourseBuilderStore((s) => s.isEditing);
  const {
    setTitle, setType, setDescription,
    addSemester, renameSemester, removeSemester,
    addSubject, renameSubject, removeSubject,
    addLesson, removeLesson,
  } = useCourseBuilderStore();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  const onAddSemester = () => {
    const id = addSemester();
    setExpanded((p) => ({ ...p, [id]: true }));
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
        {/* Basics */}
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
              />
            </Field>

            <Field label="Course type">
              <View style={styles.typeRow}>
                {courseTypes.map((t) => (
                  <Pill key={t} active={course.type === t} onPress={() => setType(t)}>{t}</Pill>
                ))}
              </View>
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
                        value={sem.name}
                        onChangeText={(v) => renameSemester(sem.id, v)}
                        placeholder="Semester name"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        style={styles.semesterTitle}
                      />
                      <Text style={styles.semesterCount}>
                        {sem.subjects.length} subj · {sem.subjects.reduce((n, s) => n + s.lessons.length, 0)} lsn
                      </Text>
                      <Pressable
                        hitSlop={8}
                        onPress={() => removeSemester(sem.id)}
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
                                  onChangeText={(v) => renameSubject(sem.id, sub.id, v)}
                                  placeholder="Subject title"
                                  placeholderTextColor={colors.muted}
                                  style={styles.subjectTitle}
                                />
                                <Pressable
                                  hitSlop={8}
                                  onPress={() => removeSubject(sem.id, sub.id)}
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
                                      {lesson.youtubeUrl ? '· Video' : '· No video'}
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
                                onPress={() => {
                                  const id = addLesson(sem.id, sub.id);
                                  openLesson(sem.id, sub.id, id);
                                }}
                              >
                                <FilePlus size={14} color={colors.primary} />
                                <Text style={styles.addLineText}>Add lesson</Text>
                              </Pressable>
                            </View>
                          ))
                        )}

                        <Pressable
                          style={styles.addSubject}
                          onPress={() => addSubject(sem.id)}
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

          <Pressable style={styles.addSemester} onPress={onAddSemester}>
            <Plus size={16} color={colors.primary} />
            <Text style={styles.addSemesterText}>Add semester</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Sticky save bar */}
      <View style={styles.stickyBar}>
        <View style={{ flex: 1 }}>
          <Button
            variant="secondary"
            size="lg"
            full
            onPress={() => navigation.goBack()}
          >
            Save draft
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            size="lg"
            full
            disabled={!course.title.trim() || course.semesters.length === 0}
            onPress={() => navigation.goBack()}
          >
            {isEditing ? 'Update' : 'Publish'}
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
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
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

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
    backgroundColor: colors.primary,
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
