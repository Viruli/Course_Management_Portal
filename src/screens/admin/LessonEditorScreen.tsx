import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import {
  ArrowLeft, Check, Trash2, Paperclip, TvMinimalPlay, Plus,
  FileText, File as FileIco, Image as ImageIco, Video as VideoIco,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Button } from '../../components/Button';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import { useCourseBuilderStore } from '../../store/courseBuilderStore';
import { toast } from '../../store/uiStore';
import {
  updateLesson as apiUpdateLesson,
  deleteLesson as apiDeleteLesson,
} from '../../services/subjects';
import {
  uploadAttachment, deleteAttachment as apiDeleteAttachment,
  isAttachmentTypeAccepted, ATTACHMENT_MAX_BYTES,
} from '../../services/attachments';
import * as DocumentPicker from 'expo-document-picker';
import { ApiError } from '../../services/api';
import type { BuilderAttachment } from '../../data/types';

type Props = {
  route: { params: { semesterId: string; subjectId: string; lessonId: string; apiLessonId?: string; apiSubjectId?: string } };
  navigation: any;
};

// Extract YouTube video ID from a few common URL formats so we can render
// a preview thumbnail without embedding an actual webview player.
function youtubeIdFromUrl(url: string): string | null {
  if (!url) return null;
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

const attachmentIcon = (kind: BuilderAttachment['kind']) => {
  if (kind === 'pdf')   return FileText;
  if (kind === 'doc')   return FileIco;
  if (kind === 'image') return ImageIco;
  if (kind === 'video') return VideoIco;
  return FileIco;
};

export function LessonEditorScreen({ route, navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { semesterId, subjectId, lessonId } = route.params;

  const lesson = useCourseBuilderStore((s) =>
    s.course.semesters
      .find((x) => x.id === semesterId)?.subjects
      .find((x) => x.id === subjectId)?.lessons
      .find((x) => x.id === lessonId) ?? null
  );
  const updateLesson    = useCourseBuilderStore((s) => s.updateLesson);
  const removeLesson    = useCourseBuilderStore((s) => s.removeLesson);
  const addAttachment   = useCourseBuilderStore((s) => s.addAttachment);
  const removeAttachment = useCourseBuilderStore((s) => s.removeAttachment);

  const [uploading, setUploading] = useState(false);

  const ytId = useMemo(() => youtubeIdFromUrl(lesson?.url ?? ''), [lesson?.url]);

  const handleDeleteLesson = async () => {
    if (lessonId) {
      apiDeleteLesson(lessonId).catch(() => {});
    }
    removeLesson(semesterId, subjectId, lessonId);
    navigation.goBack();
  };

  const handleUpdateUrl = (v: string) => {
    updateLesson(semesterId, subjectId, lessonId, { url: v });
    if (lessonId) apiUpdateLesson(lessonId, { url: v }).catch(() => {});
  };

  const handlePickAttachment = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? '';
    if (!isAttachmentTypeAccepted(mimeType)) {
      toast.error('Only PDF, DOC, and DOCX files are accepted.');
      return;
    }
    if (asset.size && asset.size > ATTACHMENT_MAX_BYTES) {
      toast.error('File exceeds the 25 MB limit.');
      return;
    }
    setUploading(true);
    try {
      const subjectId = route.params.apiSubjectId ?? route.params.subjectId;
      const uploaded = await uploadAttachment(subjectId, {
        uri: asset.uri, name: asset.name, type: mimeType,
      });
      addAttachment(semesterId, route.params.subjectId, lessonId, {
        id:   uploaded.data.id,
        name: uploaded.data.fileName,
        kind: mimeType.includes('pdf') ? 'pdf' : 'doc',
        size: `${Math.round((asset.size ?? 0) / 1024)} KB`,
      });
      toast.success('Attachment uploaded.');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'UNSUPPORTED_MEDIA_TYPE') toast.error('Only PDF, DOC, and DOCX are accepted.');
        else if (err.code === 'FILE_TOO_LARGE') toast.error('File exceeds the 25 MB limit.');
        else toast.error(err.message);
      } else {
        toast.error('Upload failed. Please try again.');
      }
    } finally { setUploading(false); }
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    apiDeleteAttachment(attachmentId).catch(() => {});
    removeAttachment(semesterId, subjectId, lessonId, attachmentId);
  };

  if (!lesson) {
    return (
      <ScreenContainer edges={['top']}>
        <AppBar
          title="Lesson"
          leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
        />
        <View style={{ padding: 24 }}>
          <Text style={{ color: colors.bodyGreen }}>Lesson not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title={lesson.title || 'New lesson'}
        leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
        trailing={
          <Pressable
            hitSlop={6}
            onPress={handleDeleteLesson}
            style={{ paddingHorizontal: 6 }}
          >
            <Trash2 size={18} color={colors.error} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Lesson title + description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lesson details</Text>
          <View style={{ gap: 12 }}>
            <Field label="Title">
              <TextInput
                value={lesson.title}
                onChangeText={(v) => updateLesson(semesterId, subjectId, lessonId, { title: v })}
                placeholder="e.g. Slope-intercept form"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </Field>

            <Field label="Description">
              <TextInput
                value={lesson.description}
                onChangeText={(v) => updateLesson(semesterId, subjectId, lessonId, { description: v })}
                placeholder="What is this lesson about?"
                placeholderTextColor={colors.muted}
                multiline
                style={[styles.input, styles.textarea]}
                textAlignVertical="top"
              />
            </Field>
          </View>
        </View>

        {/* YouTube */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Video</Text>
          <Field label="Video URL (YouTube, Vimeo, or any video link)">
            <View style={styles.ytRow}>
              <View style={styles.ytIco}>
                <TvMinimalPlay size={18} color={colors.error} />
              </View>
              <TextInput
                value={lesson.url}
                onChangeText={handleUpdateUrl}
                placeholder="https://www.youtube.com/watch?v=… or any video URL"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[styles.input, { flex: 1 }]}
              />
            </View>
          </Field>

          {lesson.url ? (
            ytId ? (
              <View style={styles.ytPreview}>
                <View style={styles.ytPreviewFrame}>
                  <View style={styles.ytPreviewPlay}>
                    <TvMinimalPlay size={28} color={colors.white} fill={colors.error} />
                  </View>
                  <Text style={styles.ytPreviewLabel}>Embedded preview</Text>
                  <Text style={styles.ytPreviewId}>Video ID: {ytId}</Text>
                </View>
                <Text style={styles.ytHelp}>
                  Students will see the embedded player here when they open this lesson.
                </Text>
              </View>
            ) : (
              <View style={styles.ytPreview}>
                <Text style={styles.ytPreviewLabel}>Non-YouTube video URL set.</Text>
              </View>
            )
          ) : null}
        </View>

        {/* Attachments */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Attachments</Text>
            <Text style={styles.muted}>
              {lesson.attachments.length} file{lesson.attachments.length === 1 ? '' : 's'}
            </Text>
          </View>

          {lesson.attachments.map((a) => {
            const Icon = attachmentIcon(a.kind);
            return (
              <View key={a.id} style={styles.attachment}>
                <View style={styles.attachmentIco}>
                  <Icon size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.attachmentName} numberOfLines={1}>{a.name}</Text>
                  <Text style={styles.attachmentSize}>{a.size}</Text>
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={() => handleDeleteAttachment(a.id)}
                >
                  <Trash2 size={14} color={colors.muted} />
                </Pressable>
              </View>
            );
          })}

          <Pressable
            style={[styles.addAttachment, uploading && { opacity: 0.5 }]}
            onPress={uploading ? undefined : handlePickAttachment}
          >
            {uploading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Paperclip size={14} color={colors.primary} />}
            <Text style={styles.addAttachmentText}>{uploading ? 'Uploading…' : 'Add attachment'}</Text>
            {!uploading && <Plus size={14} color={colors.primary} />}
          </Pressable>

          <Text style={styles.muted}>
            Worksheets, slides, quizzes — anything students need to download.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        <Button
          full
          size="lg"
          leftIcon={<Check size={16} color={colors.white} />}
          onPress={() => navigation.goBack()}
        >
          Done
        </Button>
      </View>
    </ScreenContainer>
  );
}

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
  body: { padding: 16, gap: 14, paddingBottom: 110 },
  section: {
    padding: 14, gap: 12,
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
  textarea: { height: 100, paddingTop: 12, paddingBottom: 12 },

  ytRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ytIco: {
    width: 36, height: 46, borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  ytPreview: { gap: 6 },
  ytPreviewFrame: {
    height: 140, borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
    gap: 4,
  },
  ytPreviewPlay: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  ytPreviewLabel: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  ytPreviewId: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'monospace' as any },
  ytHelp: { fontSize: 11, color: colors.bodyGreen },

  ytInvalid: {
    padding: 10, borderRadius: 10,
    backgroundColor: colors.warningBg,
  },
  ytInvalidText: { fontSize: 12, color: colors.warning, lineHeight: 16 },

  attachment: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10,
    backgroundColor: colors.lightGray, borderRadius: 12,
  },
  attachmentIco: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  attachmentName: { fontSize: 13, fontWeight: '700', color: colors.primary },
  attachmentSize: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },

  addAttachment: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
    borderColor: colors.stroke, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12,
  },
  addAttachmentText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  stickyBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopColor: colors.stroke, borderTopWidth: 1,
  },
});
