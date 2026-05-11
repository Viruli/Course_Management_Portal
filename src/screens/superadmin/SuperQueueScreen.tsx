import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Filter, Check, X } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Tabs } from '../../components/Tabs';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { REGISTRATIONS, ENROLMENTS } from '../../data/mock';
import { colors } from '../../theme/colors';

export function SuperQueueScreen() {
  const [tab, setTab] = useState<'reg' | 'enr'>('reg');
  const pendingReg = REGISTRATIONS.filter(r => r.status === 'pending');
  const pendingEnr = ENROLMENTS.filter(e => e.status === 'pending');

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Approvals queue"
        trailing={<IconBtn><Filter size={18} color={colors.primary} /></IconBtn>}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Tabs
          items={[
            { id: 'reg', label: 'Sign-ups', count: pendingReg.length },
            { id: 'enr', label: 'Enrolments', count: pendingEnr.length },
          ]}
          active={tab}
          onChange={(id) => setTab(id as 'reg' | 'enr')}
        />

        {tab === 'reg' && pendingReg.map(r => (
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
                <Button variant="secondary" size="sm" full leftIcon={<X size={13} color={colors.primary} />}>Reject</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button size="sm" full leftIcon={<Check size={13} color={colors.white} />}>Approve</Button>
              </View>
            </View>
          </View>
        ))}

        {tab === 'enr' && pendingEnr.map(e => (
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
                <Button variant="secondary" size="sm" full leftIcon={<X size={13} color={colors.primary} />}>Reject</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button size="sm" full leftIcon={<Check size={13} color={colors.white} />}>Approve</Button>
              </View>
            </View>
          </View>
        ))}
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
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 13, fontWeight: '700', color: colors.primary },
  email: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },
  when: { fontSize: 11, color: colors.muted },
  actions: { flexDirection: 'row', gap: 8 },
});
