import React from 'react';
import {
  Image, Linking, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import {
  ArrowLeft, TvMinimalPlay, Paperclip, ChevronRight, BookOpen, PlayCircle,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { DebugPanel } from '../../components/DebugPanel';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { ApiSubjectInTree, ApiAttachmentInTree } from '../../services/courses';
import type { ApiLesson } from '../../services/subjects';

interface Props {
  route: {
    params: {
      semesterTitle: string;
      subject:       ApiSubjectInTree & { lessons: ApiLesson[] };
    };
  };
  navigation: any;
}

function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function youtubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function SubjectDetailScreen({ route, navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { semesterTitle, subject } = route.params;

  // Subject may store a raw ID or a URL for the video.
  const ytId = subject.youtubeVideoId
    ? extractYoutubeId(subject.youtubeVideoId) ?? subject.youtubeVideoId
    : null;

  const openLesson = (lesson: ApiLesson) => {
    navigation.navigate('LessonDetail', {
      semesterTitle,
      subjectTitle: subject.title,
      lesson,
    });
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title={subject.title}
        subtitle={semesterTitle}
        leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Subject video */}
        {ytId ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Video</Text>
            <Pressable onPress={() => Linking.openURL(youtubeUrl(ytId))} style={styles.videoCard}>
              <Image
                source={{ uri: youtubeThumbnail(ytId) }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <TvMinimalPlay size={36} color={colors.white} fill={colors.error} />
              </View>
              <View style={styles.watchBadge}>
                <TvMinimalPlay size={11} color={colors.white} />
                <Text style={styles.watchBadgeText}>Watch on YouTube</Text>
              </View>
            </Pressable>
            <Text style={styles.videoIdText}>Video ID: {ytId}</Text>
          </View>
        ) : null}

        {/* Subject description */}
        {subject.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.body2}>{subject.description}</Text>
          </View>
        ) : null}

        {/* Subject attachments */}
        {(subject.attachments?.length ?? 0) > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Attachments</Text>
            <View style={{ gap: 8 }}>
              {subject.attachments!.map((att: ApiAttachmentInTree) => {
                const name = att.fileName ?? att.filename ?? 'Attachment';
                const sizeMB = (att.sizeBytes / (1024 * 1024)).toFixed(1);
                return (
                  <View key={att.id} style={styles.attachRow}>
                    <Paperclip size={14} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attachName} numberOfLines={1}>{name}</Text>
                      <Text style={styles.attachMeta}>{att.mimeType} · {sizeMB} MB</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Lessons */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Lessons ({subject.lessons.length})
          </Text>
          {subject.lessons.length === 0 ? (
            <Text style={styles.muted}>No lessons added yet.</Text>
          ) : (
            <View style={{ gap: 8 }}>
              {subject.lessons.map((lesson, idx) => (
                <Pressable
                  key={lesson.id}
                  style={styles.lessonRow}
                  onPress={() => openLesson(lesson)}
                >
                  <View style={styles.lessonNum}>
                    <Text style={styles.lessonNumText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lessonTitle} numberOfLines={1}>
                      {lesson.title || 'Untitled lesson'}
                    </Text>
                    {lesson.description ? (
                      <Text style={styles.lessonDesc} numberOfLines={1}>{lesson.description}</Text>
                    ) : null}
                    {lesson.url ? (
                      <View style={styles.lessonMeta}>
                        <PlayCircle size={10} color={colors.error} />
                        <Text style={styles.lessonMetaText}>Video</Text>
                      </View>
                    ) : null}
                  </View>
                  <ChevronRight size={16} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <DebugPanel tags={['lessons.list', 'courses.getById']} title="Subject debug" />
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 16, paddingBottom: 40 },
  section: {
    gap: 10,
    padding: 14,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 16,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.bodyGreen,
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  body2: { fontSize: 14, color: colors.primary, lineHeight: 21 },
  muted: { fontSize: 13, color: colors.muted },

  // Video card
  videoCard: {
    borderRadius: 14, overflow: 'hidden',
    backgroundColor: colors.brand, aspectRatio: 16 / 9,
    justifyContent: 'center', alignItems: 'center',
  },
  thumbnail: { ...StyleSheet.absoluteFillObject },
  playOverlay: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  watchBadge: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
  },
  watchBadgeText: { fontSize: 11, fontWeight: '700', color: colors.white },
  videoIdText: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' as any },

  // Attachments
  attachRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 10, backgroundColor: colors.lightGray,
  },
  attachName: { fontSize: 13, fontWeight: '600', color: colors.primary },
  attachMeta: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },

  // Lessons
  lessonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12,
    borderColor: colors.stroke, borderWidth: 1,
    backgroundColor: colors.surface,
  },
  lessonNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  lessonNumText:  { fontSize: 12, fontWeight: '700', color: colors.white },
  lessonTitle:    { fontSize: 13, fontWeight: '700', color: colors.primary },
  lessonDesc:     { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },
  lessonMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  lessonMetaText: { fontSize: 10, color: colors.bodyGreen },
});
