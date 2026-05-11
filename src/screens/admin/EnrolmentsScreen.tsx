import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Filter, ClipboardList, CheckCheck, BookOpen, MessageSquare, Check, X,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Eyebrow } from '../../components/Eyebrow';
import { ENROLMENTS } from '../../data/mock';
import { colors } from '../../theme/colors';

export function EnrolmentsScreen() {
  const pending = ENROLMENTS.filter(e => e.status === 'pending');

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Enrolment requests"
        subtitle={`${pending.length} awaiting approval`}
        trailing={<IconBtn><Filter size={18} color={colors.primary} /></IconBtn>}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.headRow}>
          <Eyebrow icon={<ClipboardList size={12} color={colors.bodyGreen} />}>Course access</Eyebrow>
          <Pressable style={styles.approveAll}>
            <CheckCheck size={14} color={colors.primary} />
            <Text style={styles.approveAllText}>Approve all</Text>
          </Pressable>
        </View>

        {pending.map(e => (
          <View key={e.id} style={styles.card}>
            <View style={styles.headRow2}>
              <Avatar size={40} name={e.name} variant="dark" />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{e.name}</Text>
                <Text style={styles.when}>{e.when}</Text>
              </View>
              <Badge tone="warning">Pending</Badge>
            </View>

            <View style={styles.courseRow}>
              <View style={styles.courseIcon}>
                <BookOpen size={16} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseLabel}>Wants access to</Text>
                <Text style={styles.courseName} numberOfLines={1}>{e.course}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Button variant="secondary" size="sm" leftIcon={<MessageSquare size={13} color={colors.primary} />}>Note</Button>
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
  when: { fontSize: 11, color: colors.muted, marginTop: 2 },
  courseRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, backgroundColor: colors.lightGray, borderRadius: 12,
  },
  courseIcon: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  courseLabel: { fontSize: 11, color: colors.bodyGreen, fontWeight: '500' },
  courseName: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
});
