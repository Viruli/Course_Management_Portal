import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Search, Check, X, Clock, CheckCheck } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Tabs } from '../../components/Tabs';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { SearchField } from '../../components/SearchField';
import { RejectReasonModal } from '../../components/RejectReasonModal';
import { useApprovalsStore } from '../../store/approvalsStore';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

type FilterStatus = 'pending' | 'approved' | 'rejected';

export function RegistrationsScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const registrationsByStatus      = useApprovalsStore((s) => s.registrationsByStatus);
  const loadingRegistrations       = useApprovalsStore((s) => s.loadingRegistrations);
  const fetchRegistrations         = useApprovalsStore((s) => s.fetchRegistrations);
  const approveRegistration        = useApprovalsStore((s) => s.approveRegistration);
  const rejectRegistration         = useApprovalsStore((s) => s.rejectRegistration);
  const bulkApproveAllRegistrations = useApprovalsStore((s) => s.bulkApproveAllRegistrations);

  const [filter,      setFilter]      = useState<FilterStatus>('pending');
  // Current tab's data — must be after filter state declaration
  const registrations              = registrationsByStatus[filter];
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [q,           setQ]           = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Fetch current tab's data when tab changes
    fetchRegistrations(filter, q || undefined);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-load all three tabs on mount so counts are accurate immediately
  useEffect(() => {
    fetchRegistrations('approved');
    fetchRegistrations('rejected');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Each count comes from its own bucket — doesn't reset when other tabs load
  const counts = useMemo(() => ({
    pending:  registrationsByStatus.pending.length,
    approved: registrationsByStatus.approved.length,
    rejected: registrationsByStatus.rejected.length,
  }), [registrationsByStatus]);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    // registrations is already scoped to current filter tab
    if (!ql) return registrations;
    return registrations.filter((r) =>
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(ql) || r.email.toLowerCase().includes(ql),
    );
  }, [registrations, q]);

  const handleApprove = async (id: string, name: string) => {
    setProcessingId(id);
    try {
      await approveRegistration(id);
      toast.success(`Approved ${name}'s registration.`);
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
      await rejectRegistration(id, reason);
      toast.success(`Rejected ${name}'s registration.`);
    } catch {
      toast.error('Could not reject. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkApprove = async () => {
    const { approved, failed } = await bulkApproveAllRegistrations();
    if (approved === 0 && failed === 0) {
      toast.info('No pending registrations to approve.');
    } else if (failed === 0) {
      toast.success(`${approved} registration${approved === 1 ? '' : 's'} approved.`);
    } else {
      toast.info(`${approved} approved. ${failed} failed — they may have already been processed.`);
    }
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Registrations"
        subtitle={`${counts.pending} pending`}
        trailing={
          <IconBtn onPress={() => setSearchOpen((v) => !v)}>
            <Search size={18} color={colors.primary} />
          </IconBtn>
        }
      />
      {searchOpen ? (
        <View style={styles.searchBar}>
          <SearchField value={q} onChange={setQ} placeholder="Search name or email…" />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Tabs
          items={[
            { id: 'pending',  label: 'Pending',  count: counts.pending },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
          ]}
          active={filter}
          onChange={(id) => setFilter(id as FilterStatus)}
        />

        {filter === 'pending' && list.length > 0 ? (
          <Button
            variant="secondary" size="sm"
            leftIcon={<CheckCheck size={14} color={colors.primary} />}
            onPress={handleBulkApprove}
          >
            Approve all pending
          </Button>
        ) : null}

        {loadingRegistrations ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : list.length === 0 ? (
          <EmptyState
            icon="CheckCheck"
            title={filter === 'pending' ? 'All caught up!' : `No ${filter} registrations`}
            body={filter === 'pending'
              ? 'No pending registrations right now.'
              : `Registrations you've ${filter === 'approved' ? 'approved' : 'rejected'} show up here.`}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {list.map((r) => {
              const name = `${r.firstName} ${r.lastName}`;
              const isProcessing = processingId === r.id;
              return (
                <View key={r.id} style={styles.card}>
                  <View style={styles.cardHead}>
                    <Avatar size={42} name={name} variant="dark" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{name}</Text>
                      <Text style={styles.email}>{r.email}</Text>
                      <Text style={styles.when}>Submitted {new Date(r.submittedAt).toLocaleDateString()}</Text>
                    </View>
                    {r.state === 'pending'  && <Badge tone="warning" icon={<Clock size={11} color={colors.warning} />}>Pending</Badge>}
                    {r.state === 'approved' && <Badge tone="success">Approved</Badge>}
                    {r.state === 'rejected' && <Badge tone="error">Rejected</Badge>}
                  </View>
                  {r.state === 'pending' && (
                    <View style={styles.actions}>
                      <View style={{ flex: 1 }}>
                        <Button
                          variant="secondary" size="sm" full
                          leftIcon={<X size={14} color={colors.primary} />}
                          disabled={isProcessing}
                          onPress={() => setRejectTarget({ id: r.id, name })}
                        >
                          Reject
                        </Button>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          size="sm" full
                          leftIcon={<Check size={14} color={colors.white} />}
                          disabled={isProcessing}
                          onPress={() => handleApprove(r.id, name)}
                        >
                          {isProcessing ? 'Approving…' : 'Approve'}
                        </Button>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <RejectReasonModal
        visible={rejectTarget !== null}
        title="Reject registration"
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
      />

    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  searchBar: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomColor: colors.stroke, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: { padding: 16, gap: 14, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, padding: 14, gap: 12,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name:  { fontSize: 14, fontWeight: '700', color: colors.primary },
  email: { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  when:  { fontSize: 11, color: colors.muted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
});
