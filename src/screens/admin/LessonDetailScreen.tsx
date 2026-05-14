import React, { useMemo } from 'react';
import {
  Image, Linking, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import {
  ArrowLeft, TvMinimalPlay, Paperclip,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { ApiLesson } from '../../services/subjects';

interface Props {
  route: {
    params: {
      semesterTitle: string;
      subjectTitle:  string;
      lesson:        ApiLesson;
    };
  };
  navigation: any;
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

export function LessonDetailScreen({ route, navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { semesterTitle, subjectTitle, lesson } = route.params;

  const ytId = useMemo(() => extractYoutubeId(lesson.url ?? ''), [lesson.url]);

  const openVideo = () => {
    if (lesson.url) Linking.openURL(lesson.url);
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title={lesson.title || 'Lesson'}
        subtitle={`${semesterTitle} · ${subjectTitle}`}
        leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText} numberOfLines={1}>
            {semesterTitle}  ›  {subjectTitle}  ›  {lesson.title}
          </Text>
        </View>

        {/* Video */}
        {lesson.url ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Video</Text>
            {ytId ? (
              <Pressable onPress={openVideo} style={styles.videoCard}>
                <Image
                  source={{ uri: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.playOverlay}>
                  <TvMinimalPlay size={40} color={colors.white} fill={colors.error} />
                </View>
                <View style={styles.watchBadge}>
                  <TvMinimalPlay size={11} color={colors.white} />
                  <Text style={styles.watchBadgeText}>Watch on YouTube</Text>
                </View>
              </Pressable>
            ) : (
              // Non-YouTube URL — show as a pressable link
              <Pressable style={styles.linkCard} onPress={openVideo}>
                <TvMinimalPlay size={20} color={colors.error} />
                <Text style={styles.linkUrl} numberOfLines={2}>{lesson.url}</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Video</Text>
            <Text style={styles.muted}>No video attached to this lesson.</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          {lesson.description ? (
            <Text style={styles.descText}>{lesson.description}</Text>
          ) : (
            <Text style={styles.muted}>No description added.</Text>
          )}
        </View>

        {/* Attachments — placeholder (lesson attachments require separate fetch) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Attachments</Text>
          <View style={styles.attachPlaceholder}>
            <Paperclip size={16} color={colors.muted} />
            <Text style={styles.attachPlaceholderText}>
              Attachments are managed in the Course Builder.
            </Text>
          </View>
        </View>

        {/* Lesson meta */}
        <View style={styles.metaCard}>
          <MetaRow label="Lesson ID" value={lesson.id} mono />
          <MetaRow label="Subject" value={subjectTitle} />
          <MetaRow label="Semester" value={semesterTitle} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, mono && { fontFamily: 'monospace' as any }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 40 },

  breadcrumb: {
    paddingHorizontal: 4,
  },
  breadcrumbText: {
    fontSize: 11, color: colors.muted, fontWeight: '500',
  },

  section: {
    gap: 10, padding: 14,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 16,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.bodyGreen,
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  descText: { fontSize: 14, color: colors.primary, lineHeight: 21 },
  muted:    { fontSize: 13, color: colors.muted },

  // Video
  videoCard: {
    borderRadius: 14, overflow: 'hidden',
    backgroundColor: colors.brand, aspectRatio: 16 / 9,
    justifyContent: 'center', alignItems: 'center',
  },
  thumbnail: { ...StyleSheet.absoluteFillObject },
  playOverlay: {
    width: 72, height: 72, borderRadius: 36,
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

  linkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, backgroundColor: colors.lightGray,
  },
  linkUrl: { flex: 1, fontSize: 13, color: colors.bodyGreen, lineHeight: 18 },

  // Attachments placeholder
  attachPlaceholder: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 10, backgroundColor: colors.lightGray,
  },
  attachPlaceholderText: { fontSize: 12, color: colors.muted, flex: 1, lineHeight: 16 },

  // Meta card
  metaCard: {
    padding: 14, borderRadius: 16,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    gap: 10,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontSize: 12, color: colors.bodyGreen, fontWeight: '600' },
  metaValue: { fontSize: 12, color: colors.primary, fontWeight: '700', flexShrink: 1, maxWidth: '65%', textAlign: 'right' },
});
