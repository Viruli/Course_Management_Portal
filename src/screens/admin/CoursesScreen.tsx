import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import {
  Search, MoreVertical, Plus, Pencil, Upload, Trash2, AlertTriangle,
  BookOpen, Layers, Archive, Eye, EyeOff,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Tabs } from '../../components/Tabs';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import {
  ApiCourse, CourseState,
  listCourses, createCourse, publishCourse, unpublishCourse,
  archiveCourse, deleteCourse,
} from '../../services/courses';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { shadows } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onCourse:        (courseId: string) => void;
  onEditCourse:    (courseId: string) => void;
  onCourseCreated: (courseId: string) => void;
}

type TabState = 'published' | 'draft' | 'archived';

export function CoursesScreen({ onCourse, onEditCourse, onCourseCreated }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [tab,      setTab]      = useState<TabState>('published');
  const [courses,  setCourses]  = useState<ApiCourse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [menuFor,  setMenuFor]  = useState<ApiCourse | null>(null);
  const [deleteFor, setDeleteFor] = useState<ApiCourse | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);  // per-card action in-flight

  // ── Create course modal state ─────────────────────────────────────────────
  const [createOpen,    setCreateOpen]    = useState(false);
  const [createTitle,   setCreateTitle]   = useState('');
  const [createDesc,    setCreateDesc]    = useState('');
  const [createError,   setCreateError]   = useState('');
  const [creating,      setCreating]      = useState(false);

  const fetchCourses = useCallback(async (state: TabState) => {
    setLoading(true);
    try {
      const result = await listCourses({ state, limit: 50 });
      setCourses(result.data.items);
    } catch {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(tab); }, [tab, fetchCourses]);

  // ── Create course ──────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createTitle.trim()) { setCreateError('Title is required.'); return; }
    if (createTitle.trim().length > 200) { setCreateError('Title must be ≤ 200 characters.'); return; }
    if (!createDesc.trim()) { setCreateError('Description is required.'); return; }
    setCreating(true); setCreateError('');
    try {
      const result = await createCourse({ title: createTitle.trim(), description: createDesc.trim() });
      setCreateOpen(false); setCreateTitle(''); setCreateDesc('');
      onCourseCreated(result.data.id);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'COURSE_TITLE_EXISTS') {
        setCreateError('A course with this title already exists.');
      } else {
        setCreateError('Something went wrong. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  // ── Lifecycle actions ──────────────────────────────────────────────────────
  const runAction = async (
    courseId: string,
    fn: () => Promise<any>,
    successMsg: string,
    nextTab?: TabState,
  ) => {
    setMenuFor(null); setActionId(courseId);
    try {
      await fn();
      toast.success(successMsg);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      if (nextTab) setTimeout(() => { setTab(nextTab); fetchCourses(nextTab); }, 500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'INVALID_STATE') {
          toast.error("This course can't be updated right now — refresh and try again.");
          fetchCourses(tab);
        } else if (err.code === 'EMPTY_SEMESTER') {
          toast.error('Every semester needs at least one subject before publishing.');
        } else if (err.code === 'NO_SEMESTERS') {
          toast.error('Add at least one semester before publishing.');
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setActionId(null);
    }
  };

  const handlePublish   = (c: ApiCourse) => runAction(c.id, () => publishCourse(c.id),   `"${c.title}" published.`,   'published');
  const handleUnpublish = (c: ApiCourse) => runAction(c.id, () => unpublishCourse(c.id), `"${c.title}" unpublished.`, 'draft');
  const handleArchive   = (c: ApiCourse) => runAction(c.id, () => archiveCourse(c.id),   `"${c.title}" archived.`,    'archived');
  const handleDelete    = async (c: ApiCourse) => {
    setDeleteFor(null); setActionId(c.id);
    try {
      await deleteCourse(c.id);
      setCourses((prev) => prev.filter((x) => x.id !== c.id));
      toast.success(`Deleted "${c.title}".`);
    } catch {
      toast.error('Delete failed. Please try again.');
    } finally {
      setActionId(null);
    }
  };

  const tabCounts = {
    published: tab === 'published' ? courses.length : 0,
    draft:     tab === 'draft'     ? courses.length : 0,
    archived:  tab === 'archived'  ? courses.length : 0,
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Courses"
        trailing={
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <IconBtn onPress={() => toast.info('Course search coming soon.')}>
              <Search size={18} color={colors.primary} />
            </IconBtn>
            <IconBtn onPress={() => setCreateOpen(true)}>
              <Plus size={20} color={colors.primary} />
            </IconBtn>
          </View>
        }
      />

      <Tabs
        items={[
          { id: 'published', label: 'Published', count: tabCounts.published },
          { id: 'draft',     label: 'Drafts',    count: tabCounts.draft },
          { id: 'archived',  label: 'Archived',  count: tabCounts.archived },
        ]}
        active={tab}
        onChange={(id) => setTab(id as TabState)}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon="BookOpen"
            title={`No ${tab} courses`}
            body={tab === 'draft' ? 'Tap + to create a new course.' : `No ${tab} courses yet.`}
          />
        ) : (
          courses.map((c) => (
            <View key={c.id} style={styles.card}>
              <Pressable style={styles.cardMain} onPress={() => onCourse(c.id)}>
                <View style={styles.cardIcon}>
                  <BookOpen size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{c.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={1}>{c.description}</Text>
                  <View style={styles.cardMeta}>
                    <Layers size={11} color={colors.bodyGreen} />
                    <Text style={styles.metaText}>{c.semesterCount} semester{c.semesterCount === 1 ? '' : 's'}</Text>
                    <Text style={styles.metaText}> · {c.createdByName}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  {c.state === 'published' && <Badge tone="success">Live</Badge>}
                  {c.state === 'draft'     && <Badge tone="warning">Draft</Badge>}
                  {c.state === 'archived'  && <Badge tone="info">Archived</Badge>}
                  {actionId === c.id ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 6 }} />
                  ) : (
                    <IconBtn onPress={() => setMenuFor(c)}>
                      <MoreVertical size={16} color={colors.primary} />
                    </IconBtn>
                  )}
                </View>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── 3-dot action sheet ──────────────────────────────────────────────── */}
      <Modal transparent animationType="fade" visible={menuFor !== null} onRequestClose={() => setMenuFor(null)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuFor(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle} numberOfLines={1}>{menuFor?.title}</Text>

            <Pressable style={styles.sheetItem} onPress={() => { setMenuFor(null); if (menuFor) onCourse(menuFor.id); }}>
              <Eye size={16} color={colors.primary} />
              <Text style={styles.sheetLabel}>View</Text>
            </Pressable>

            <Pressable style={styles.sheetItem} onPress={() => { setMenuFor(null); if (menuFor) onEditCourse(menuFor.id); }}>
              <Pencil size={16} color={colors.primary} />
              <Text style={styles.sheetLabel}>Edit</Text>
            </Pressable>

            {menuFor?.state === 'draft' && (
              <Pressable style={styles.sheetItem} onPress={() => menuFor && handlePublish(menuFor)}>
                <Upload size={16} color={colors.primary} />
                <Text style={styles.sheetLabel}>Publish</Text>
              </Pressable>
            )}
            {menuFor?.state === 'published' && (
              <>
                <Pressable style={styles.sheetItem} onPress={() => menuFor && handleUnpublish(menuFor)}>
                  <EyeOff size={16} color={colors.primary} />
                  <Text style={styles.sheetLabel}>Unpublish</Text>
                </Pressable>
                <Pressable style={styles.sheetItem} onPress={() => menuFor && handleArchive(menuFor)}>
                  <Archive size={16} color={colors.primary} />
                  <Text style={styles.sheetLabel}>Archive</Text>
                </Pressable>
              </>
            )}

            <Pressable style={styles.sheetItem} onPress={() => {
              const c = menuFor;
              setMenuFor(null);
              requestAnimationFrame(() => setDeleteFor(c));
            }}>
              <Trash2 size={16} color={colors.error} />
              <Text style={[styles.sheetLabel, { color: colors.error }]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* ── Delete confirmation ─────────────────────────────────────────────── */}
      <Modal transparent animationType="fade" visible={deleteFor !== null} onRequestClose={() => setDeleteFor(null)}>
        <View style={styles.backdrop}>
          <View style={styles.alertBox}>
            <AlertTriangle size={32} color={colors.error} />
            <Text style={styles.alertTitle}>Delete course?</Text>
            <Text style={styles.alertBody}>
              "{deleteFor?.title}" will be soft-deleted and recoverable for 30 days.
            </Text>
            <View style={styles.alertButtons}>
              <View style={{ flex: 1 }}>
                <Button variant="secondary" full onPress={() => setDeleteFor(null)}>Cancel</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button full onPress={() => deleteFor && handleDelete(deleteFor)}>Delete</Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Create course modal ─────────────────────────────────────────────── */}
      <Modal transparent animationType="slide" visible={createOpen} onRequestClose={() => setCreateOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setCreateOpen(false)}>
          <Pressable style={styles.createSheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>New course</Text>

            <View style={{ gap: 4 }}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={createTitle}
                onChangeText={(t) => { setCreateTitle(t); setCreateError(''); }}
                placeholder="e.g. Introduction to TypeScript"
                placeholderTextColor={colors.muted}
                maxLength={200}
                autoFocus
              />
            </View>
            <View style={{ gap: 4 }}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                value={createDesc}
                onChangeText={(t) => { setCreateDesc(t); setCreateError(''); }}
                placeholder="Brief overview of what students will learn…"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                maxLength={5000}
              />
            </View>

            {createError ? <Text style={styles.errorText}>{createError}</Text> : null}

            <Button full disabled={creating} onPress={handleCreate}>
              {creating ? 'Creating…' : 'Create course'}
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 12, paddingBottom: 100 },

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, ...shadows.xs,
  },
  cardMain:   { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  cardIcon:   {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle:  { fontSize: 14, fontWeight: '700', color: colors.primary },
  cardDesc:   { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  cardMeta:   { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  metaText:   { fontSize: 11, color: colors.bodyGreen, fontWeight: '500' },
  cardRight:  { alignItems: 'flex-end', gap: 4 },

  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 4,
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  sheetItem:  {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 4,
  },
  sheetLabel: { fontSize: 15, color: colors.primary },

  alertBox: {
    alignSelf: 'center', width: '85%',
    backgroundColor: colors.surface,
    borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 12,
  },
  alertTitle:   { fontSize: 18, fontWeight: '700', color: colors.primary },
  alertBody:    { fontSize: 14, color: colors.bodyGreen, textAlign: 'center', lineHeight: 20 },
  alertButtons: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },

  createSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 14,
  },
  inputLabel: { fontSize: 12, fontWeight: '600', color: colors.bodyGreen },
  input: {
    backgroundColor: colors.lightGray, borderRadius: 12,
    padding: 14, fontSize: 14, color: colors.primary,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  errorText:  { fontSize: 12, color: colors.error, fontWeight: '600' },
});
