import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  createLesson,
  updateLesson as apiUpdateLesson,
  deleteLesson as apiDeleteLesson,
  youtubeIdFromInput,
} from '../../services/subjects';
import {
  uploadAttachment, deleteAttachment as apiDeleteAttachment,
  isAttachmentTypeAccepted, ATTACHMENT_MAX_BYTES,
} from '../../services/attachments';
import * as DocumentPicker from 'expo-document-picker';
import { ApiError } from '../../services/api';
import { DebugPanel } from '../../components/DebugPanel';
import type { BuilderAttachment } from '../../data/types';

type Props = {
  route: {
    params: {
      semesterId: string;
      subjectId: string;
      lessonId?: string;       // omitted → create mode
    };
  };
  navigation: any;
};

const attachmentIcon = (kind: BuilderAttachment['kind']) => {
  if (kind === 'pdf')   return FileText;
  if (kind === 'doc')   return FileIco;
  if (kind === 'image') return ImageIco;
  if (kind === 'video') return VideoIco;
  return FileIco;
};

function useDebouncedPatch(lessonId: string | undefined) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Parameters<typeof apiUpdateLesson>[1]>({});

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (patch: Parameters<typeof apiUpdateLesson>[1]) => {
    if (!lessonId) return;
    pending.current = { ...pending.current, ...patch };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const body = pending.current;
      pending.current = {};
      apiUpdateLesson(lessonId, body).catch(() => {/* surface via debug panel */});
    }, 600);
  };
}

export function LessonEditorScreen({ route, navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { semesterId, subjectId, lessonId } = route.params;

  const lesson = useCourseBuilderStore((s) =>
    !lessonId ? null :
      s.course.semesters
        .find((x) => x.id === semesterId)?.subjects
        .find((x) => x.id === subjectId)?.lessons
        .find((x) => x.id === lessonId) ?? null
  );
  const addLesson         = useCourseBuilderStore((s) => s.addLesson);
  const updateLessonLocal = useCourseBuilderStore((s) => s.updateLesson);
  const removeLesson      = useCourseBuilderStore((s) => s.removeLesson);
  const addAttachment     = useCourseBuilderStore((s) => s.addAttachment);
  const removeAttachment  = useCourseBuilderStore((s) => s.removeAttachment);

  const isCreateMode = !lesson;

  // ── Create-mode local state ───────────────────────────────────────────────
  const [draft, setDraft] = useState({ title: '', description: '', url: '' });
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  // ── Edit-mode infrastructure ──────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const patch = useDebouncedPatch(lessonId);

  // The form binds to either the draft (create) or the lesson (edit).
  const formTitle = isCreateMode ? draft.title       : (lesson!.title ?? '');
  const formDesc  = isCreateMode ? draft.description : (lesson!.description ?? '');
  const formUrl   = isCreateMode ? draft.url         : (lesson!.url ?? '');

  const ytId = useMemo(() => youtubeIdFromInput(formUrl), [formUrl]);

  const onChangeTitle = (v: string) => {
    if (isCreateMode) {
      setDraft((d) => ({ ...d, title: v }));
      setCreateError('');
    } else {
      updateLessonLocal(semesterId, subjectId, lessonId!, { title: v });
      patch({ title: v });
    }
  };
  const onChangeDescription = (v: string) => {
    if (isCreateMode) {
      setDraft((d) => ({ ...d, description: v }));
      setCreateError('');
    } else {
      updateLessonLocal(semesterId, subjectId, lessonId!, { description: v });
      patch({ description: v });
    }
  };
  const onChangeUrl = (v: string) => {
    if (isCreateMode) {
      setDraft((d) => ({ ...d, url: v }));
      setCreateError('');
    } else {
      updateLessonLocal(semesterId, subjectId, lessonId!, { url: v });
      patch({ url: v });
    }
  };

  const handleCreateLesson = async () => {
    if (!draft.title.trim()) { setCreateError('Title is required.'); return; }
    if (!draft.url.trim())   { setCreateError('Video URL is required.'); return; }
    setSaving(true); setCreateError('');
    try {
      const title       = draft.title.trim();
      const url         = draft.url.trim();
      const description = draft.description.trim();

      const r = await createLesson(subjectId, { title, url, description });

      // addLesson creates a blank entry; immediately populate it with the
      // actual values so the lesson row in the builder shows the correct title.
      addLesson(semesterId, subjectId, r.data.id);
      updateLessonLocal(semesterId, subjectId, r.data.id, { title, url, description });

      toast.success(`Lesson "${title}" created.`);
      navigation.goBack();   // return to builder — tap the lesson row to edit further
    } catch (err) {
      if (err instanceof ApiError) setCreateError(`[${err.code}] ${err.message}`);
      else setCreateError('Failed to create lesson. Try again.');
    } finally { setSaving(false); }
  };

  const handleDeleteLesson = () => {
    if (isCreateMode) { navigation.goBack(); return; }
    apiDeleteLesson(lessonId!).catch(() => {});
    removeLesson(semesterId, subjectId, lessonId!);
    navigation.goBack();
  };

  const handlePickAttachment = async () => {
    if (isCreateMode) {
      toast.info('Save the lesson first to add attachments.');
      return;
    }
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
      const uploaded = await uploadAttachment(subjectId, {
        uri: asset.uri, name: asset.name, type: mimeType,
      });
      addAttachment(semesterId, subjectId, lessonId!, {
        id:   uploaded.data.id,
        name: uploaded.data.filename,
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
    if (isCreateMode) return;
    apiDeleteAttachment(attachmentId).catch(() => {});
    removeAttachment(semesterId, subjectId, lessonId!, attachmentId);
  };

  const attachments = lesson?.attachments ?? [];

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title={isCreateMode ? 'New lesson' : (lesson!.title || 'Lesson')}
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
            <Field label="Title *">
              <TextInput
                value={formTitle}
                onChangeText={onChangeTitle}
                placeholder="e.g. Slope-intercept form"
                placeholderTextColor={colors.muted}
                style={styles.input}
                maxLength={200}
              />
            </Field>

            <Field label="Description">
              <TextInput
                value={formDesc}
                onChangeText={onChangeDescription}
                placeholder="What is this lesson about?"
                placeholderTextColor={colors.muted}
                multiline
                style={[styles.input, styles.textarea]}
                textAlignVertical="top"
                maxLength={2000}
              />
            </Field>
          </View>
        </View>

        {/* Video */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Video</Text>
          <Field label="Video URL * (YouTube, Vimeo, etc.)">
            <View style={styles.ytRow}>
              <View style={styles.ytIco}>
                <TvMinimalPlay size={18} color={colors.error} />
              </View>
              <TextInput
                value={formUrl}
                onChangeText={onChangeUrl}
                placeholder="https://www.youtube.com/watch?v=…"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[styles.input, { flex: 1 }]}
              />
            </View>
          </Field>

          {formUrl ? (
            ytId ? (
              <View style={styles.ytPreview}>
                <View style={styles.ytPreviewFrame}>
                  <View style={styles.ytPreviewPlay}>
                    <TvMinimalPlay size={28} color={colors.white} fill={colors.error} />
                  </View>
                  <Text style={styles.ytPreviewLabel}>YouTube preview</Text>
                  <Text style={styles.ytPreviewId}>Video ID: {ytId}</Text>
                </View>
                <Text style={styles.ytHelp}>
                  Stored as the full URL. Students will see the embedded player.
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
              {attachments.length} file{attachments.length === 1 ? '' : 's'}
            </Text>
          </View>

          {attachments.map((a) => {
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
            style={[styles.addAttachment, (uploading || isCreateMode) && { opacity: 0.5 }]}
            onPress={uploading ? undefined : handlePickAttachment}
            disabled={uploading}
          >
            {uploading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Paperclip size={14} color={colors.primary} />}
            <Text style={styles.addAttachmentText}>
              {uploading ? 'Uploading…' : isCreateMode ? 'Save lesson to add attachments' : 'Add attachment'}
            </Text>
            {!uploading && !isCreateMode && <Plus size={14} color={colors.primary} />}
          </Pressable>

          <Text style={styles.muted}>
            PDF, DOC, or DOCX. Max 25 MB per file.
          </Text>
        </View>

        {createError ? (
          <Text style={styles.errorText}>{createError}</Text>
        ) : null}

        <DebugPanel
          tags={['lessons.create', 'lessons.update', 'lessons.delete', 'attachments.delete']}
          title="Lesson debug"
        />
      </ScrollView>

      <View style={styles.stickyBar}>
        <Button
          full
          size="lg"
          disabled={saving}
          leftIcon={<Check size={16} color={colors.white} />}
          onPress={isCreateMode ? handleCreateLesson : () => navigation.goBack()}
        >
          {isCreateMode ? (saving ? 'Saving…' : 'Save lesson') : 'Done'}
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
  errorText: { fontSize: 12, color: colors.error, fontWeight: '600', paddingHorizontal: 4 },

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
