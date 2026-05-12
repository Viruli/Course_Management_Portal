import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Search, Check, X, Clock } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Tabs } from '../../components/Tabs';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { SearchField } from '../../components/SearchField';
import { useApprovalsStore } from '../../store/approvalsStore';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { ApprovalStatus } from '../../data/types';

export function RegistrationsScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const registrations = useApprovalsStore((s) => s.registrations);
  const approveRegistration = useApprovalsStore((s) => s.approveRegistration);
  const rejectRegistration  = useApprovalsStore((s) => s.rejectRegistration);

  const [filter, setFilter] = useState<ApprovalStatus>('pending');
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');

  const counts = useMemo(() => ({
    pending:  registrations.filter((r) => r.status === 'pending').length,
    approved: registrations.filter((r) => r.status === 'approved').length,
    rejected: registrations.filter((r) => r.status === 'rejected').length,
  }), [registrations]);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return registrations
      .filter((r) => r.status === filter)
      .filter((r) => !ql || r.name.toLowerCase().includes(ql) || r.email.toLowerCase().includes(ql));
  }, [registrations, filter, q]);

  const handleApprove = (id: string, name: string) => {
    approveRegistration(id);
    toast.success(`Approved ${name}'s registration.`);
  };
  const handleReject = (id: string, name: string) => {
    rejectRegistration(id);
    toast.info(`Rejected ${name}'s registration.`);
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
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
          ]}
          active={filter}
          onChange={(id) => setFilter(id as ApprovalStatus)}
        />

        {list.length === 0 ? (
          <EmptyState
            icon="CheckCheck"
            title={filter === 'pending' ? 'All caught up!' : `No ${filter} registrations`}
            body={filter === 'pending'
              ? 'No pending registrations right now.'
              : `Registrations you've ${filter === 'approved' ? 'approved' : 'rejected'} show up here.`}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {list.map((r) => (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Avatar size={42} name={r.name} variant="dark" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{r.name}</Text>
                    <Text style={styles.email}>{r.email}</Text>
                    <Text style={styles.when}>Submitted {r.when}</Text>
                  </View>
                  {r.status === 'pending' && <Badge tone="warning" icon={<Clock size={11} color={colors.warning} />}>Pending</Badge>}
                  {r.status === 'approved' && <Badge tone="success">Approved</Badge>}
                  {r.status === 'rejected' && <Badge tone="error">Rejected</Badge>}
                </View>
                {r.status === 'pending' && (
                  <View style={styles.actions}>
                    <View style={{ flex: 1 }}>
                      <Button
                        variant="secondary" size="sm" full
                        leftIcon={<X size={14} color={colors.primary} />}
                        onPress={() => handleReject(r.id, r.name)}
                      >
                        Reject
                      </Button>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        size="sm" full
                        leftIcon={<Check size={14} color={colors.white} />}
                        onPress={() => handleApprove(r.id, r.name)}
                      >
                        Approve
                      </Button>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  name: { fontSize: 14, fontWeight: '700', color: colors.primary },
  email: { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  when: { fontSize: 11, color: colors.muted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
});
