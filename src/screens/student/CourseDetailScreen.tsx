import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowLeft, Bookmark, Share2, Star, MessageCircle,
  Video, Clock, FileText, Award, Check, CheckCircle, PlayCircle,
  Plus, Play, ChevronDown, ChevronUp, GraduationCap, BookOpen, Paperclip, TvMinimalPlay,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Tabs } from '../../components/Tabs';
import { CourseCover } from '../../components/CourseCover';
import { Button } from '../../components/Button';
import { LESSON, SAMPLE_BUILDER_COURSE } from '../../data/mock';
import { toast } from '../../store/uiStore';
import { getCourseById, ApiCourseDetail } from '../../services/courses';
import { ApiError } from '../../services/api';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { Course, BuilderSemester, BuilderLesson } from '../../data/types';

interface Props {
  courseId?: string;   // when provided, fetch real data
  course?: Course;     // legacy mock path — kept for backward compat
  onBack: () => void;
  onPlay: () => void;
  onEnrol: () => void;
}

export function CourseDetailScreen({ courseId, course, onBack, onPlay, onEnrol }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [tab, setTab] = useState('overview');
  const [bookmarked, setBookmarked] = useState(false);
  const [apiCourse, setApiCourse] = useState<ApiCourseDetail | null>(null);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    getCourseById(courseId).then((r) => {
      if (!cancelled) setApiCourse(r.data);
    }).catch((err) => {
      if (!cancelled) {
        if (err instanceof ApiError && err.code === 'COURSE_NOT_FOUND') {
          toast.error('This course is no longer available.');
        } else {
          toast.error('Failed to load course details.');
        }
      }
    });
    return () => { cancelled = true; };
  }, [courseId]);

  // Resolved display values — API data takes precedence over mock
  const title     = apiCourse?.title       ?? course?.title       ?? '';
  const enrolled  = (course?.progress ?? 0) > 0;

  const handleBookmark = () => {
    setBookmarked((b) => {
      const next = !b;
      toast.info(next ? `Bookmarked "${title}".` : 'Removed bookmark.');
      return next;
    });
  };
  const handleShare = () => toast.info(`Sharing "${title}"…`);
  const handleMessageInstructor = () => toast.info(`Opening chat with the instructor.`);

  // Curriculum: use real API semesters when available, fall back to mock
  const curriculum = apiCourse?.semesters ?? (SAMPLE_BUILDER_COURSE.semesters as any[]);
  const totalLessons = useMemo(
    () => curriculum.reduce((n: number, sem: any) =>
      n + (sem.subjects ?? []).reduce((m: number, s: any) =>
        m + (s.lessons?.length ?? 0), 0), 0),
    [curriculum],
  );

  return (
    <ScreenContainer edges={['top']}>
      <AppBar
        transparent
        leading={<IconBtn onPress={onBack}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
        trailing={
          <>
            <IconBtn onPress={handleBookmark}>
              <Bookmark size={18} color={bookmarked ? colors.successDeep : colors.primary} fill={bookmarked ? colors.success : 'none'} />
            </IconBtn>
            <IconBtn onPress={handleShare}><Share2 size={18} color={colors.primary} /></IconBtn>
          </>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.coverWrap}>
          <CourseCover kind={course?.kind ?? 'cs'} emblem={course?.emblem ?? '📘'} tag={course?.tag ?? ''} height={180} />
        </View>

        <View style={styles.head}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.meta}>
            <Star size={12} color={colors.warning} />
            <Text style={styles.metaB}>{course?.rating ?? '—'}</Text>
            <View style={styles.dotSep} />
            <Text style={styles.metaT}>{(course?.students ?? 0).toLocaleString() || '—'} students</Text>
            <View style={styles.dotSep} />
            <Text style={styles.metaT}>{course?.lessons ?? (apiCourse?.semesters?.length ?? 0)} {course ? 'lessons' : 'semesters'}</Text>
          </View>

          <Pressable style={styles.instructorRow} onPress={handleMessageInstructor}>
            <Avatar size={40} name={apiCourse?.createdByName ?? course?.instructor ?? 'Instructor'} variant="dark" />
            <View style={{ flex: 1 }}>
              <Text style={styles.instructorLabel}>Instructor</Text>
              <Text style={styles.instructorName}>{apiCourse?.createdByName ?? course?.instructor ?? '—'}</Text>
            </View>
            <MessageCircle size={18} color={colors.bodyGreen} />
          </Pressable>
        </View>

        <View style={styles.tabsWrap}>
          <Tabs
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'curriculum', label: 'Curriculum', count: totalLessons },
              { id: 'reviews', label: 'Reviews' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </View>

        <View style={styles.tabContent}>
          {tab === 'overview' && (
            <>
              <Text style={styles.desc}>
                {apiCourse?.description ?? (course ? `A practical, paced introduction to ${course.tag?.toLowerCase() ?? 'this subject'}. ${LESSON.desc}` : '')}
              </Text>
              <View style={styles.featureGrid}>
                {[
                  { Icon: Video,    label: 'Video lessons', val: course?.lessons ?? totalLessons },
                  { Icon: Clock,    label: 'Total time',    val: course?.time ?? `${apiCourse?.semesters?.length ?? 0} semesters` },
                  { Icon: FileText, label: 'Worksheets',    val: 8 },
                  { Icon: Award,    label: 'Certificate',   val: 'On completion' },
                ].map(f => (
                  <View key={f.label} style={styles.feature}>
                    <View style={styles.featureIcon}>
                      <f.Icon size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.featureLabel}>{f.label}</Text>
                      <Text style={styles.featureVal}>{String(f.val)}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>What you'll learn</Text>
                {[
                  'Solve linear equations confidently',
                  'Graph slope-intercept and standard form',
                  'Apply ratios and proportions to real problems',
                  'Read and interpret data sets',
                ].map(line => (
                  <View key={line} style={styles.learnRow}>
                    <Check size={14} color={colors.success} />
                    <Text style={styles.learnText}>{line}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {tab === 'curriculum' && (
            <CurriculumTree semesters={curriculum} onPlayActive={onPlay} />
          )}

          {tab === 'reviews' && (
            <View style={{ gap: 14 }}>
              <View style={styles.reviewHead}>
                <View style={{ alignItems: 'center', paddingRight: 8 }}>
                  <Text style={styles.bigRating}>{course?.rating ?? '—'}</Text>
                  <Text style={styles.stars}>★★★★★</Text>
                  <Text style={styles.reviewsCount}>{Math.round((course?.students ?? 0) * 0.42)} reviews</Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  {[5, 4, 3, 2, 1].map((s, i) => (
                    <View key={s} style={styles.barRow}>
                      <Text style={styles.barLabel}>{s}</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${[82, 14, 3, 1, 0.4][i]}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              {[
                { name: 'Imal de Silva',  when: '3 d ago', stars: 5, text: 'Lessons are short, focused, and easy to follow. The worksheets really cement the concepts.' },
                { name: 'Tharushi J.',    when: '1 w ago', stars: 5, text: "Best math content I've found online. Re-watched the slope-intercept lesson three times." },
              ].map(r => (
                <View key={r.name} style={styles.reviewCard}>
                  <View style={styles.reviewHeadRow}>
                    <Avatar size={32} name={r.name} variant="dark" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{r.name}</Text>
                      <Text style={styles.reviewSub}>{r.when} · <Text style={{ color: colors.warning }}>{'★'.repeat(r.stars)}</Text></Text>
                    </View>
                  </View>
                  <Text style={styles.reviewBody}>{r.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.barLabelTop}>Course access</Text>
          <Text style={styles.barValue}>
            {enrolled ? `Enrolled · ${course?.progress ?? 0}%` : 'Free with approval'}
          </Text>
        </View>
        {enrolled ? (
          <Button size="lg" leftIcon={<Play size={16} color={colors.white} />} onPress={onPlay}>Resume</Button>
        ) : (
          <Button size="lg" leftIcon={<Plus size={16} color={colors.white} />} onPress={() => {
            toast.success(`Enrolment request submitted for "${title}".`);
            onEnrol();
          }}>Request enrol</Button>
        )}
      </View>
    </ScreenContainer>
  );
}

function CurriculumTree({ semesters, onPlayActive }: { semesters: BuilderSemester[]; onPlayActive: () => void }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  // First semester open by default.
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (semesters[0]) init[semesters[0].id] = true;
    return init;
  });

  return (
    <View style={{ gap: 10 }}>
      {semesters.map((sem, i) => {
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
                <Text style={styles.curSemName}>{sem.title}</Text>
                <Text style={styles.curSemMeta}>
                  {subjectCount} subject{subjectCount === 1 ? '' : 's'} · {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
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
                    {sub.lessons.map((lesson, lessonIdx) => (
                      <CurriculumLesson
                        key={lesson.id}
                        index={lessonIdx + 1}
                        lesson={lesson}
                        isActive={i === 1 && lessonIdx === 0}
                        onPress={i === 1 && lessonIdx === 0 ? onPlayActive : undefined}
                      />
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

function CurriculumLesson({
  index, lesson, isActive, onPress,
}: { index: number; lesson: BuilderLesson; isActive?: boolean; onPress?: () => void }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const Icon = isActive ? PlayCircle : CheckCircle;
  const iconColor = isActive ? colors.successDeep : colors.muted;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.curLesson,
        isActive && {
          backgroundColor: 'rgba(188,233,85,0.10)',
          borderColor: 'rgba(188,233,85,0.40)',
        },
      ]}
    >
      <View style={styles.curLessonIco}>
        <Icon size={14} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.curLessonStep}>Lesson {index}</Text>
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
    </Pressable>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  coverWrap: { paddingHorizontal: 16 },
  head: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary, letterSpacing: -0.4, lineHeight: 26 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  metaB: { fontSize: 11, fontWeight: '700', color: colors.primary },
  metaT: { fontSize: 11, fontWeight: '500', color: colors.bodyGreen },
  dotSep: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted, marginHorizontal: 2 },
  instructorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 16, padding: 12,
    backgroundColor: colors.lightGray, borderRadius: 12,
  },
  instructorLabel: { fontSize: 11, color: colors.bodyGreen, fontWeight: '500' },
  instructorName: { fontSize: 14, fontWeight: '700', color: colors.primary },
  tabsWrap: { paddingHorizontal: 16, marginTop: 20 },
  tabContent: { padding: 16, gap: 14 },
  desc: { fontSize: 14, color: colors.bodyGreen, lineHeight: 20 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  feature: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 12,
    width: '48%',
  },
  featureIcon: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: { fontSize: 11, color: colors.bodyGreen },
  featureVal: { fontSize: 13, fontWeight: '700', color: colors.primary },
  card: {
    padding: 14, gap: 8,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  learnRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  learnText: { flex: 1, fontSize: 13, color: colors.bodyGreen, lineHeight: 18 },
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
    borderColor: 'transparent', borderWidth: 1, borderRadius: 10,
  },
  curLessonIco: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  curLessonStep: { fontSize: 10, color: colors.bodyGreen, fontWeight: '600', letterSpacing: 0.3 },
  curLessonTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 1 },
  curLessonMeta: { flexDirection: 'row', gap: 4, marginTop: 4 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999,
    backgroundColor: colors.surface,
  },
  metaChipText: { fontSize: 9, fontWeight: '700', color: colors.bodyGreen },
  reviewHead: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 14, backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 14,
  },
  bigRating: { fontSize: 36, fontWeight: '700', color: colors.primary, letterSpacing: -1, lineHeight: 38 },
  stars: { fontSize: 12, color: colors.warning, letterSpacing: 2, marginTop: 4 },
  reviewsCount: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { fontSize: 11, color: colors.bodyGreen, width: 10 },
  barTrack: { flex: 1, height: 4, backgroundColor: colors.stroke, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.accent },
  reviewCard: {
    padding: 14,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 14,
    gap: 8,
  },
  reviewHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewName: { fontSize: 13, fontWeight: '700', color: colors.primary },
  reviewSub: { fontSize: 11, color: colors.muted },
  reviewBody: { fontSize: 13, color: colors.bodyGreen, lineHeight: 18 },
  stickyBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopColor: colors.stroke, borderTopWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  barLabelTop: { fontSize: 11, color: colors.bodyGreen, fontWeight: '500' },
  barValue: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
