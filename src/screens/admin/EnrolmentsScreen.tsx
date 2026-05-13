import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import {
  Filter, ClipboardList, CheckCheck, BookOpen, Check, X, XCircle, ChevronDown, Search,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Tabs } from '../../components/Tabs';
import { Eyebrow } from '../../components/Eyebrow';
import { EmptyState } from '../../components/EmptyState';
import { RejectReasonModal } from '../../components/RejectReasonModal';
import { useApprovalsStore } from '../../store/approvalsStore';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

export function EnrolmentsScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const enrolments         = useApprovalsStore((s) => s.enrolments);
  const loadingEnrolments  = useApprovalsStore((s) => s.loadingEnrolments);
  const fetchEnrollments   = useApprovalsStore((s) => s.fetchEnrollments);
  const approveEnrolment   = useApprovalsStore((s) => s.approveEnrolment);
  const rejectEnrolment    = useApprovalsStore((s) => s.rejectEnrolment);
  const approveAllEnrolments = useApprovalsStore((s) => s.approveAllEnrolments);

  const [processingId,    setProcessingId]    = useState<string | null>(null);
  const [rejectTarget,    setRejectTarget]     = useState<{ id: string; name: string } | null>(null);
  const [tabFilter,         setTabFilter]          = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [filterModalOpen,   setFilterModalOpen]   = useState(false);
  const [selectedCourseId,  setSelectedCourseId]  = useState<string | null>(null);
  const [courseSearch,      setCourseSearch]       = useState('');

  useEffect(() => {
    fetchEnrollments('pending');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Per-tab counts
  const counts = useMemo(() => ({
    pending:  enrolments.filter((e) => e.state === 'pending').length,
    approved: enrolments.filter((e) => e.state === 'approved').length,
    rejected: enrolments.filter((e) => e.state === 'rejected').length,
  }), [enrolments]);

  // Items for the active tab
  const tabItems = useMemo(() => enrolments.filter((e) => e.state === tabFilter), [enrolments, tabFilter]);

  // Unique courses in the active tab for the filter list
  const courses = useMemo(() => {
    const seen = new Set<string>();
    return tabItems
      .filter((e) => e.courseId && e.courseTitle)  // skip items with missing course info
      .filter((e) => { if (seen.has(e.courseId)) return false; seen.add(e.courseId); return true; })
      .map((e) => ({ id: e.courseId, title: e.courseTitle ?? '' }));
  }, [tabItems]);

  // Apply course filter client-side within the active tab
  const filtered = useMemo(() => {
    if (!selectedCourseId) return tabItems;
    return tabItems.filter((e) => e.courseId === selectedCourseId);
  }, [tabItems, selectedCourseId]);

  const selectedCourseTitle = courses.find((c) => c.id === selectedCourseId)?.title;

  const handleApprove = async (id: string, name: string, course: string) => {
    setProcessingId(id);
    try {
      await approveEnrolment(id);
      toast.success(`Approved ${name} → ${course}.`);
    } catch {
      toast.error('Could not approve. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async (reason?: string) => {
    if (!rejectTarget) return;
    const { id, name } = rejectTarget;
    setRejectTarget(null);
    setProcessingId(id);
    try {
      await rejectEnrolment(id, reason);
      toast.success(`Rejected ${name}'s enrolment.`);
    } catch {
      toast.error('Could not reject. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveAll = async () => {
    if (counts.pending === 0) {
      toast.info('No pending enrolments to approve.');
      return;
    }
    const { approved, failed } = await approveAllEnrolments();
    if (failed === 0) {
      toast.success(`${approved} enrolment${approved === 1 ? '' : 's'} approved.`);
    } else {
      toast.info(`${approved} approved. ${failed} failed.`);
    }
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Enrolment requests"
        subtitle={`${filtered.length} ${tabFilter}${selectedCourseId ? ' (filtered)' : ''}`}
        trailing={
          <IconBtn onPress={() => setFilterModalOpen(true)}>
            <View style={{ position: 'relative' }}>
              <Filter size={18} color={selectedCourseId ? colors.accent : colors.primary} />
              {selectedCourseId ? (
                <View style={styles.filterDot} />
              ) : null}
            </View>
          </IconBtn>
        }
      />

      {/* Active filter chip */}
      {selectedCourseId ? (
        <Pressable style={styles.filterChip} onPress={() => setSelectedCourseId(null)}>
          <BookOpen size={12} color={colors.primary} />
          <Text style={styles.filterChipText} numberOfLines={1}>{selectedCourseTitle}</Text>
          <XCircle size={14} color={colors.muted} />
        </Pressable>
      ) : null}

      <Tabs
        items={[
          { id: 'pending',  label: 'Pending',  count: counts.pending },
          { id: 'approved', label: 'Approved', count: counts.approved },
          { id: 'rejected', label: 'Rejected', count: counts.rejected },
        ]}
        active={tabFilter}
        onChange={(id) => {
          setTabFilter(id as 'pending' | 'approved' | 'rejected');
          setSelectedCourseId(null);  // clear course filter on tab switch
        }}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {tabFilter === 'pending' && (
        <View style={styles.headRow}>
          <Eyebrow icon={<ClipboardList size={12} color={colors.bodyGreen} />}>Course access</Eyebrow>
          <Pressable style={styles.approveAll} onPress={handleApproveAll}>
            <CheckCheck size={14} color={colors.primary} />
            <Text style={styles.approveAllText}>Approve all</Text>
          </Pressable>
        </View>
        )}

        {loadingEnrolments ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="CheckCheck"
            title={tabFilter === 'pending' ? 'All clear' : `No ${tabFilter} enrolments`}
            body={selectedCourseId
              ? `No ${tabFilter} enrolments for this course.`
              : tabFilter === 'pending'
              ? 'No enrolment requests are waiting on you.'
              : `${tabFilter.charAt(0).toUpperCase() + tabFilter.slice(1)} enrolments will appear here.`}
          />
        ) : filtered.map((e) => {
          const isProcessing = processingId === e.id;
          return (
            <View key={e.id} style={styles.card}>
              <View style={styles.headRow2}>
                <Avatar size={40} name={e.studentName} variant="dark" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{e.studentName}</Text>
                  <Text style={styles.sub}>{e.studentEmail}</Text>
                  <Text style={styles.when}>{new Date(e.submittedAt).toLocaleDateString()}</Text>
                </View>
                {e.state === 'pending'  && <Badge tone="warning">Pending</Badge>}
                {e.state === 'approved' && <Badge tone="success">Approved</Badge>}
                {e.state === 'rejected' && <Badge tone="error">Rejected</Badge>}
              </View>

              <View style={styles.courseRow}>
                <View style={styles.courseIcon}>
                  <BookOpen size={16} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseLabel}>Course</Text>
                  <Text style={styles.courseName} numberOfLines={1}>{e.courseTitle ?? '—'}</Text>
                </View>
              </View>

              {/* Only show action buttons on the pending tab */}
              {tabFilter === 'pending' && (
                <View style={styles.actions}>
                  <View style={{ flex: 1 }}>
                    <Button
                      variant="secondary" size="sm" full
                      leftIcon={<X size={13} color={colors.primary} />}
                      disabled={isProcessing}
                      onPress={() => setRejectTarget({ id: e.id, name: e.studentName })}
                    >
                      Reject
                    </Button>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      size="sm" full
                      leftIcon={<Check size={13} color={colors.white} />}
                      disabled={isProcessing}
                      onPress={() => handleApprove(e.id, e.studentName, e.courseTitle)}
                    >
                      {isProcessing ? 'Approving…' : 'Approve'}
                    </Button>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <RejectReasonModal
        visible={rejectTarget !== null}
        title="Reject enrolment"
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
      />

      {/* Course filter modal */}
      <Modal
        transparent
        animationType="slide"
        visible={filterModalOpen}
        onRequestClose={() => { setFilterModalOpen(false); setCourseSearch(''); }}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => { setFilterModalOpen(false); setCourseSearch(''); }}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by course</Text>
              <IconBtn onPress={() => { setFilterModalOpen(false); setCourseSearch(''); }}>
                <X size={20} color={colors.primary} />
              </IconBtn>
            </View>

            {/* Search input */}
            <View style={styles.searchRow}>
              <Search size={16} color={colors.muted} />
              <TextInput
                style={styles.searchInput}
                value={courseSearch}
                onChangeText={setCourseSearch}
                placeholder="Search course name…"
                placeholderTextColor={colors.muted}
                autoFocus
                clearButtonMode="while-editing"
              />
              {courseSearch.length > 0 ? (
                <Pressable onPress={() => setCourseSearch('')} hitSlop={8}>
                  <XCircle size={16} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>

            {courses.length === 0 ? (
              <Text style={styles.noCoursesText}>No courses with pending enrolments.</Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* "All courses" option — only show when search is empty */}
                {!courseSearch ? (
                  <Pressable
                    style={[styles.courseOption, !selectedCourseId && styles.courseOptionActive]}
                    onPress={() => { setSelectedCourseId(null); setFilterModalOpen(false); setCourseSearch(''); }}
                  >
                    <Text style={[styles.courseOptionText, !selectedCourseId && styles.courseOptionTextActive]}>
                      All courses
                    </Text>
                    <Text style={styles.courseOptionCount}>{tabItems.length} requests</Text>
                    {!selectedCourseId ? <Check size={16} color={colors.accent} /> : null}
                  </Pressable>
                ) : null}

                {/* Filtered course list */}
                {courses
                  .filter((c) => !courseSearch || (c.title ?? '').toLowerCase().includes(courseSearch.toLowerCase()))
                  .map((c) => {
                    const count  = tabItems.filter((e) => e.courseId === c.id).length;
                    const active = selectedCourseId === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        style={[styles.courseOption, active && styles.courseOptionActive]}
                        onPress={() => { setSelectedCourseId(c.id); setFilterModalOpen(false); setCourseSearch(''); }}
                      >
                        <View style={styles.courseOptionIcon}>
                          <BookOpen size={14} color={colors.primary} />
                        </View>
                        <Text style={[styles.courseOptionText, active && styles.courseOptionTextActive]} numberOfLines={1}>
                          {c.title}
                        </Text>
                        <Text style={styles.courseOptionCount}>{count}</Text>
                        {active ? <Check size={16} color={colors.accent} /> : null}
                      </Pressable>
                    );
                  })
                }

                {/* No results for search */}
                {courseSearch && courses.filter((c) => c.title.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 ? (
                  <Text style={styles.noCoursesText}>No courses match "{courseSearch}"</Text>
                ) : null}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 12, paddingBottom: 100 },

  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 16, marginBottom: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: colors.lightGray, borderRadius: 20,
    alignSelf: 'flex-start',
  },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.primary, maxWidth: 200 },
  filterDot: {
    position: 'absolute', top: -2, right: -2,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.accent,
  },

  headRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  approveAll:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  approveAllText: { fontSize: 12, color: colors.primary, fontWeight: '700' },

  card: {
    backgroundColor: colors.surface, borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, padding: 14, gap: 12,
  },
  headRow2: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name:     { fontSize: 14, fontWeight: '700', color: colors.primary },
  sub:      { fontSize: 11, color: colors.bodyGreen, marginTop: 1 },
  when:     { fontSize: 11, color: colors.muted, marginTop: 2 },
  courseRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, backgroundColor: colors.lightGray, borderRadius: 12,
  },
  courseIcon: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center',
  },
  courseLabel:  { fontSize: 11, color: colors.bodyGreen, fontWeight: '500' },
  courseName:   { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 2 },
  actions:      { flexDirection: 'row', gap: 8 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 32, maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomColor: colors.stroke2, borderBottomWidth: 1,
  },
  modalTitle:    { fontSize: 17, fontWeight: '700', color: colors.primary },
  noCoursesText: { padding: 20, fontSize: 14, color: colors.bodyGreen, textAlign: 'center' as const },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 8, marginTop: 4,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.lightGray, borderRadius: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.primary, padding: 0 },

  courseOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomColor: colors.stroke2, borderBottomWidth: 1,
  },
  courseOptionActive:    { backgroundColor: 'rgba(188,233,85,0.06)' },
  courseOptionIcon:      { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  courseOptionText:      { flex: 1, fontSize: 14, color: colors.primary },
  courseOptionTextActive: { fontWeight: '700' },
  courseOptionCount:     { fontSize: 12, color: colors.bodyGreen, fontWeight: '600' },
});
