import React, { useState } from 'react';
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
import { REGISTRATIONS } from '../../data/mock';
import { colors } from '../../theme/colors';
import type { ApprovalStatus } from '../../data/types';

export function RegistrationsScreen() {
  const [filter, setFilter] = useState<ApprovalStatus>('pending');
  const counts = {
    pending: REGISTRATIONS.filter(r => r.status === 'pending').length,
    approved: REGISTRATIONS.filter(r => r.status === 'approved').length,
    rejected: REGISTRATIONS.filter(r => r.status === 'rejected').length,
  };
  const list = REGISTRATIONS.filter(r => r.status === filter);

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Registrations"
        subtitle={`${counts.pending} pending`}
        trailing={<IconBtn><Search size={18} color={colors.primary} /></IconBtn>}
      />
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
          <EmptyState icon="CheckCheck" title="All caught up!" body="No pending registrations right now." />
        ) : (
          <View style={{ gap: 10 }}>
            {list.map(r => (
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
                      <Button variant="secondary" size="sm" full leftIcon={<X size={14} color={colors.primary} />}>Reject</Button>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button size="sm" full leftIcon={<Check size={14} color={colors.white} />}>Approve</Button>
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

const styles = StyleSheet.create({
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
