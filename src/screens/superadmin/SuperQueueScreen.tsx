import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Filter, Check, X } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Tabs } from '../../components/Tabs';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { useApprovalsStore } from '../../store/approvalsStore';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

export function SuperQueueScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const registrations = useApprovalsStore((s) => s.registrations);
  const enrolments    = useApprovalsStore((s) => s.enrolments);
  const approveReg = useApprovalsStore((s) => s.approveRegistration);
  const rejectReg  = useApprovalsStore((s) => s.rejectRegistration);
  const approveEnr = useApprovalsStore((s) => s.approveEnrolment);
  const rejectEnr  = useApprovalsStore((s) => s.rejectEnrolment);

  const [tab, setTab] = useState<'reg' | 'enr'>('reg');

  const pendingReg = useMemo(() => registrations.filter((r) => r.status === 'pending'), [registrations]);
  const pendingEnr = useMemo(() => enrolments.filter((e) => e.status === 'pending'), [enrolments]);

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Approvals queue"
        trailing={
          <IconBtn onPress={() => toast.info('Filter coming soon.')}>
            <Filter size={18} color={colors.primary} />
          </IconBtn>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Tabs
          items={[
            { id: 'reg', label: 'Sign-ups',   count: pendingReg.length },
            { id: 'enr', label: 'Enrolments', count: pendingEnr.length },
          ]}
          active={tab}
          onChange={(id) => setTab(id as 'reg' | 'enr')}
        />

        {tab === 'reg' && (
          pendingReg.length === 0
            ? <EmptyState icon="CheckCheck" title="No sign-ups pending" body="New registration requests will appear here." />
            : pendingReg.map((r) => (
              <View key={r.id} style={styles.card}>
                <View style={styles.head}>
                  <Avatar size={40} name={r.name} variant="dark" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{r.name}</Text>
                    <Text style={styles.email}>{r.email}</Text>
                  </View>
                  <Text style={styles.when}>{r.when}</Text>
                </View>
                <View style={styles.actions}>
                  <View style={{ flex: 1 }}>
                    <Button
                      variant="secondary" size="sm" full
                      leftIcon={<X size={13} color={colors.primary} />}
                      onPress={() => { rejectReg(r.id); toast.info(`Rejected ${r.name}'s registration.`); }}
                    >
                      Reject
                    </Button>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      size="sm" full
                      leftIcon={<Check size={13} color={colors.white} />}
                      onPress={() => { approveReg(r.id); toast.success(`Approved ${r.name}'s registration.`); }}
                    >
                      Approve
                    </Button>
                  </View>
                </View>
              </View>
            ))
        )}

        {tab === 'enr' && (
          pendingEnr.length === 0
            ? <EmptyState icon="CheckCheck" title="No enrolments pending" body="New enrolment requests will appear here." />
            : pendingEnr.map((e) => (
              <View key={e.id} style={styles.card}>
                <View style={styles.head}>
                  <Avatar size={36} name={e.name} variant="dark" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{e.name}</Text>
                    <Text style={styles.email} numberOfLines={1}>→ {e.course}</Text>
                  </View>
                  <Text style={styles.when}>{e.when}</Text>
                </View>
                <View style={styles.actions}>
                  <View style={{ flex: 1 }}>
                    <Button
                      variant="secondary" size="sm" full
                      leftIcon={<X size={13} color={colors.primary} />}
                      onPress={() => { rejectEnr(e.id); toast.info(`Rejected ${e.name}'s enrolment.`); }}
                    >
                      Reject
                    </Button>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      size="sm" full
                      leftIcon={<Check size={13} color={colors.white} />}
                      onPress={() => { approveEnr(e.id); toast.success(`Approved ${e.name} → ${e.course}.`); }}
                    >
                      Approve
                    </Button>
                  </View>
                </View>
              </View>
            ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, padding: 14, gap: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 13, fontWeight: '700', color: colors.primary },
  email: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },
  when: { fontSize: 11, color: colors.muted },
  actions: { flexDirection: 'row', gap: 8 },
});
