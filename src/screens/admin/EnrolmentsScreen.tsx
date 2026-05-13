import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Filter, ClipboardList, CheckCheck, BookOpen, Check, X,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
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

  const [processingId,  setProcessingId]  = useState<string | null>(null);
  const [rejectTarget,  setRejectTarget]  = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchEnrollments('pending');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pending = useMemo(() => enrolments.filter((e) => e.state === 'pending'), [enrolments]);

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
    if (pending.length === 0) {
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
        subtitle={`${pending.length} awaiting approval`}
        trailing={
          <IconBtn onPress={() => toast.info('Course filter coming soon.')}>
            <Filter size={18} color={colors.primary} />
          </IconBtn>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.headRow}>
          <Eyebrow icon={<ClipboardList size={12} color={colors.bodyGreen} />}>Course access</Eyebrow>
          <Pressable style={styles.approveAll} onPress={handleApproveAll}>
            <CheckCheck size={14} color={colors.primary} />
            <Text style={styles.approveAllText}>Approve all</Text>
          </Pressable>
        </View>

        {loadingEnrolments ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : pending.length === 0 ? (
          <EmptyState icon="CheckCheck" title="All clear" body="No enrolment requests are waiting on you." />
        ) : pending.map((e) => {
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
                <Badge tone="warning">Pending</Badge>
              </View>

              <View style={styles.courseRow}>
                <View style={styles.courseIcon}>
                  <BookOpen size={16} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseLabel}>Wants access to</Text>
                  <Text style={styles.courseName} numberOfLines={1}>{e.courseTitle}</Text>
                </View>
              </View>

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

    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 12, paddingBottom: 100 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  approveAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  approveAllText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface, borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, padding: 14, gap: 12,
  },
  headRow2: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 14, fontWeight: '700', color: colors.primary },
  sub:  { fontSize: 11, color: colors.bodyGreen, marginTop: 1 },
  when: { fontSize: 11, color: colors.muted, marginTop: 2 },
  courseRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, backgroundColor: colors.lightGray, borderRadius: 12,
  },
  courseIcon: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  courseLabel: { fontSize: 11, color: colors.bodyGreen, fontWeight: '500' },
  courseName: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
});
