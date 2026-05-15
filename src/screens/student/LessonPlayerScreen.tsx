import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Image, Linking, Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import {
  ChevronDown, Check, BookOpen, TvMinimalPlay,
  Paperclip, Download, PlayCircle, ChevronLeft, ChevronRight,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { IconBtn } from '../../components/IconBtn';
import { Button } from '../../components/Button';
import { Progress } from '../../components/Progress';
import { toast } from '../../store/uiStore';
import { getCourseById } from '../../services/courses';
import { listLessons, ApiLesson } from '../../services/subjects';
import { markSubjectComplete, updateLastAccessed } from '../../services/progress';
import { getAttachmentDownloadUrl } from '../../services/attachments';
import { ApiError } from '../../services/api';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface SubjectEntry {
  semesterId:    string;
  semesterTitle: string;
  semesterIdx:   number;
  subjectId:     string;
  subjectTitle:  string;
  subjectIdx:    number;           // index within semester
  description?:  string;
  youtubeVideoId?: string | null;
  attachments?:  any[];
}

interface Props {
  route?: {
    params?: {
      subjectId?:  string;
      courseId?:   string;
      semesterId?: string;
    };
  };
  onBack:     () => void;
  onComplete: () => void;
}

function extractYoutubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(input.trim())) return input.trim();
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) { const m = input.match(p); if (m) return m[1]; }
  return null;
}

export function LessonPlayerScreen({ route, onBack, onComplete }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const initialSubjectId = route?.params?.subjectId;
  const courseId         = route?.params?.courseId;
  const initialSemId     = route?.params?.semesterId;

  const [loading,         setLoading]         = useState(true);
  const [courseTitle,     setCourseTitle]      = useState('');
  const [allSubjects,     setAllSubjects]      = useState<SubjectEntry[]>([]);
  const [currentIdx,      setCurrentIdx]       = useState(0);
  const [lessonsMap,      setLessonsMap]       = useState<Record<string, ApiLesson[]>>({});
  const [loadingLessons,  setLoadingLessons]   = useState(false);
  const [marking,         setMarking]          = useState(false);
  const [completed,       setCompleted]        = useState<Record<string, boolean>>({});
  const [downloadingId,   setDownloadingId]    = useState<string | null>(null);

  // Load full course structure once
  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getCourseById(courseId);
        if (cancelled) return;
        setCourseTitle(res.data.title ?? '');

        const sems: any[] = Array.isArray((res.data as any).semesters)
          ? (res.data as any).semesters : [];

        // Build flat ordered subject list across all semesters
        const flat: SubjectEntry[] = [];
        sems.forEach((sem: any, sIdx: number) => {
          const semTitle = sem.title ?? sem.name ?? `Semester ${sIdx + 1}`;
          (sem.subjects ?? []).forEach((sub: any, subIdx: number) => {
            flat.push({
              semesterId:    sem.id,
              semesterTitle: semTitle,
              semesterIdx:   sIdx,
              subjectId:     sub.id,
              subjectTitle:  sub.title ?? '',
              subjectIdx:    subIdx,
              description:   sub.description,
              youtubeVideoId: sub.youtubeVideoId,
              attachments:   sub.attachments ?? [],
            });
          });
        });
        setAllSubjects(flat);

        // Determine starting index
        const startIdx = flat.findIndex((s) => s.subjectId === initialSubjectId);
        setCurrentIdx(startIdx >= 0 ? startIdx : 0);

        // Fetch lessons for all subjects in parallel
        const results = await Promise.allSettled(
          flat.map((s) => listLessons(s.subjectId)),
        );
        if (cancelled) return;
        const map: Record<string, ApiLesson[]> = {};
        flat.forEach((s, i) => {
          const r = results[i];
          map[s.subjectId] = r.status === 'fulfilled' ? (r.value.data ?? []) : [];
        });
        setLessonsMap(map);
      } catch {
        toast.error('Failed to load course content.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [courseId, initialSubjectId]);

  const current = allSubjects[currentIdx];

  // Fire-and-forget: record access whenever subject changes
  useEffect(() => {
    if (!current || !courseId) return;
    updateLastAccessed(current.subjectId, {
      courseId,
      semesterId: current.semesterId,
    }).catch(() => {});
  }, [current?.subjectId, courseId]);

  const ytId = useMemo(
    () => extractYoutubeId(current?.youtubeVideoId),
    [current?.youtubeVideoId],
  );

  const currentLessons = current ? (lessonsMap[current.subjectId] ?? []) : [];
  const isCompleted    = !!(current && completed[current.subjectId]);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= allSubjects.length) return;
    setCurrentIdx(idx);
  };

  const handleMarkComplete = async () => {
    if (!current || !courseId || marking || isCompleted) return;
    setMarking(true);
    try {
      await markSubjectComplete(current.subjectId, {
        courseId,
        semesterId: current.semesterId,
      });
      setCompleted((prev) => ({ ...prev, [current.subjectId]: true }));
      toast.success('Subject marked complete! ✓');
      onComplete();
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT')) {
        toast.error("Couldn't reach the server. Check your connection.");
      } else {
        toast.error("Couldn't mark complete. Try again.");
      }
    } finally {
      setMarking(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId: string) => {
    if (downloadingId) return;
    setDownloadingId(attachmentId);
    try {
      const result = await getAttachmentDownloadUrl(attachmentId);
      await Linking.openURL(result.data.downloadUrl);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'ENROLLMENT_REQUIRED') {
          toast.error('You need an approved enrolment to download attachments.');
        } else {
          toast.error('Download failed. Please try again.');
        }
      } else {
        toast.error("Couldn't open the download link.");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ScreenContainer edges={['top']}>
      {/* Video / thumbnail */}
      <View style={styles.videoArea}>
        <View style={styles.videoTop}>
          <IconBtn dark onPress={onBack}><ChevronDown size={20} color={colors.white} /></IconBtn>
          {!loading && allSubjects.length > 0 && (
            <Text style={styles.videoPosition}>
              {currentIdx + 1} / {allSubjects.length}
            </Text>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color="rgba(255,255,255,0.7)" style={{ flex: 1 }} />
        ) : ytId ? (
          <Pressable
            style={styles.thumbnailWrap}
            onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${ytId}`)}
          >
            <Image
              source={{ uri: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <View style={styles.playOverlay}>
              <TvMinimalPlay size={36} color={colors.white} fill={colors.error} />
            </View>
            <View style={styles.watchBadge}>
              <TvMinimalPlay size={10} color={colors.white} />
              <Text style={styles.watchBadgeText}>Watch on YouTube</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.noVideo}>
            <TvMinimalPlay size={28} color="rgba(255,255,255,0.25)" />
            <Text style={styles.noVideoText}>No video for this subject</Text>
          </View>
        )}
      </View>

      {/* Progress bar across all subjects */}
      {!loading && allSubjects.length > 0 && (
        <Progress
          pct={Math.round((Object.keys(completed).length / allSubjects.length) * 100)}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb */}
        {current && (
          <Text style={styles.breadcrumb} numberOfLines={1}>
            {courseTitle}  ›  {current.semesterTitle}
          </Text>
        )}

        {/* Subject title + completion badge */}
        <View style={styles.titleRow}>
          <Text style={styles.subjectTitle} numberOfLines={2}>
            {current?.subjectTitle ?? (loading ? 'Loading…' : '—')}
          </Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Check size={12} color={colors.white} />
              <Text style={styles.completedBadgeText}>Done</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {current?.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>About this subject</Text>
            <Text style={styles.descText}>{current.description}</Text>
          </View>
        ) : null}

        {/* Lessons list */}
        {currentLessons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Lessons ({currentLessons.length})
            </Text>
            <View style={{ gap: 8 }}>
              {currentLessons.map((lesson, idx) => {
                const lessonYt = extractYoutubeId(lesson.url);
                return (
                  <Pressable
                    key={lesson.id}
                    style={styles.lessonRow}
                    onPress={() => lesson.url ? Linking.openURL(lesson.url) : null}
                  >
                    <View style={styles.lessonNum}>
                      <Text style={styles.lessonNumText}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lessonTitle} numberOfLines={1}>
                        {lesson.title || 'Untitled lesson'}
                      </Text>
                      {lesson.description ? (
                        <Text style={styles.lessonDesc} numberOfLines={1}>
                          {lesson.description}
                        </Text>
                      ) : null}
                    </View>
                    {lessonYt ? <PlayCircle size={14} color={colors.error} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Attachments */}
        {(current?.attachments?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Attachments ({current!.attachments!.length})
            </Text>
            <View style={{ gap: 8 }}>
              {current!.attachments!.map((att: any) => {
                const name = att.fileName ?? att.filename ?? 'Attachment';
                return (
                  <View key={att.id} style={styles.matRow}>
                    <View style={styles.matIcon}>
                      <Paperclip size={15} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.matName} numberOfLines={1}>{name}</Text>
                      <Text style={styles.matSize}>{att.mimeType}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleDownloadAttachment(att.id)}
                      disabled={downloadingId === att.id}
                      style={{ padding: 6 }}
                    >
                      <Download
                        size={16}
                        color={downloadingId === att.id ? colors.muted : colors.primary}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* All subjects in this course — collapsible per semester */}
        {allSubjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Course outline</Text>
            {(() => {
              // Group by semester for display
              const semMap: Record<string, { title: string; entries: { entry: SubjectEntry; idx: number }[] }> = {};
              allSubjects.forEach((entry, idx) => {
                if (!semMap[entry.semesterId]) {
                  semMap[entry.semesterId] = { title: entry.semesterTitle, entries: [] };
                }
                semMap[entry.semesterId].entries.push({ entry, idx });
              });
              return Object.entries(semMap).map(([semId, sem]) => (
                <View key={semId} style={{ gap: 4, marginTop: 6 }}>
                  <Text style={styles.outlineSemLabel}>{sem.title}</Text>
                  {sem.entries.map(({ entry, idx }) => {
                    const isCurrent = idx === currentIdx;
                    const isDone    = !!completed[entry.subjectId];
                    return (
                      <Pressable
                        key={entry.subjectId}
                        style={[styles.outlineRow, isCurrent && styles.outlineRowActive]}
                        onPress={() => goTo(idx)}
                      >
                        <View style={[styles.outlineNum, isDone && styles.outlineNumDone]}>
                          {isDone
                            ? <Check size={10} color={colors.white} />
                            : <Text style={styles.outlineNumText}>{idx + 1}</Text>}
                        </View>
                        <Text
                          style={[styles.outlineTitle, isCurrent && styles.outlineTitleActive]}
                          numberOfLines={1}
                        >
                          {entry.subjectTitle}
                        </Text>
                        {entry.youtubeVideoId ? <PlayCircle size={12} color={colors.muted} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              ));
            })()}
          </View>
        )}

        {!loading && !current && (
          <View style={styles.emptyBox}>
            <BookOpen size={24} color={colors.muted} />
            <Text style={styles.emptyText}>
              Could not load content. Make sure you have an approved enrollment.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom bar: prev / mark complete / next */}
      <View style={styles.stickyBar}>
        <Pressable
          style={[styles.navBtn, currentIdx === 0 && styles.navBtnDisabled]}
          onPress={() => goTo(currentIdx - 1)}
          disabled={currentIdx === 0}
        >
          <ChevronLeft size={20} color={currentIdx === 0 ? colors.muted : colors.primary} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Button
            size="lg" full
            leftIcon={<Check size={16} color={colors.white} />}
            disabled={marking || isCompleted || !current || loading}
            onPress={handleMarkComplete}
            style={isCompleted
              ? { backgroundColor: colors.success, borderColor: colors.success } as any
              : undefined}
          >
            {isCompleted ? '✓ Complete' : marking ? 'Saving…' : 'Mark complete'}
          </Button>
        </View>

        <Pressable
          style={[styles.navBtn, currentIdx >= allSubjects.length - 1 && styles.navBtnDisabled]}
          onPress={() => goTo(currentIdx + 1)}
          disabled={currentIdx >= allSubjects.length - 1}
        >
          <ChevronRight size={20} color={currentIdx >= allSubjects.length - 1 ? colors.muted : colors.primary} />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  videoArea: {
    height: 200, backgroundColor: '#0E1A16',
    overflow: 'hidden', position: 'relative',
  },
  videoTop: {
    position: 'absolute', top: 8, left: 8, right: 8, zIndex: 4,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  videoPosition: {
    fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 99,
  },
  thumbnailWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playOverlay: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  watchBadge: {
    position: 'absolute', bottom: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  watchBadgeText: { fontSize: 11, fontWeight: '700', color: colors.white },
  noVideo: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  noVideoText: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },

  body: { padding: 16, gap: 12, paddingBottom: 110 },

  breadcrumb: { fontSize: 11, color: colors.muted },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  subjectTitle: {
    flex: 1, fontSize: 19, fontWeight: '700', color: colors.primary, letterSpacing: -0.3,
  },
  completedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99,
    backgroundColor: colors.success, flexShrink: 0,
  },
  completedBadgeText: { fontSize: 10, fontWeight: '700', color: colors.white },

  section: {
    gap: 10, padding: 14,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 16,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.bodyGreen,
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  descText: { fontSize: 14, color: colors.primary, lineHeight: 20 },

  lessonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 10, backgroundColor: colors.lightGray,
  },
  lessonNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  lessonNumText:  { fontSize: 10, fontWeight: '700', color: colors.white },
  lessonTitle:    { fontSize: 13, fontWeight: '700', color: colors.primary },
  lessonDesc:     { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },

  matRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, backgroundColor: colors.lightGray, borderRadius: 10,
  },
  matIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  matName: { fontSize: 12, fontWeight: '700', color: colors.primary },
  matSize: { fontSize: 10, color: colors.bodyGreen, marginTop: 2 },

  // Course outline
  outlineSemLabel: {
    fontSize: 11, fontWeight: '700', color: colors.bodyGreen,
    letterSpacing: 0.4, marginBottom: 2,
  },
  outlineRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 10,
  },
  outlineRowActive: { backgroundColor: 'rgba(188,233,85,0.10)' },
  outlineNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  outlineNumDone:  { backgroundColor: colors.success },
  outlineNumText:  { fontSize: 9, fontWeight: '700', color: colors.primary },
  outlineTitle:    { flex: 1, fontSize: 12, color: colors.primary },
  outlineTitleActive: { fontWeight: '700' },

  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 18 },

  stickyBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopColor: colors.stroke, borderTopWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  navBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
    borderColor: colors.stroke, borderWidth: 1,
  },
  navBtnDisabled: { opacity: 0.4 },
});
