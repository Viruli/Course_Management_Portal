import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell, UserPlus, ClipboardList } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { IconBtn } from '../../components/IconBtn';
import { Stat } from '../../components/Stat';
import { Badge } from '../../components/Badge';
import { SectionHeader } from '../../components/SectionHeader';
import { AUDIT } from '../../data/mock';
import { useProfileStore, fullName } from '../../store/profileStore';
import { useApprovalsStore } from '../../store/approvalsStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { AuditTone } from '../../data/types';
import { Clock } from 'lucide-react-native';

interface Props {
  onTabChange: (tab: 'dashboard' | 'registrations' | 'enrolments' | 'courses' | 'more') => void;
  onBell: () => void;
  onOpenAudit?: () => void;
  onOpenProfile?: () => void;
}

const toneFg = (t: AuditTone, colors: Colors) =>
  t === 'success' ? colors.successDeep : t === 'warning' ? colors.warning : colors.info;

export function AdminDashboardScreen({ onTabChange, onBell, onOpenAudit, onOpenProfile }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const profile = useProfileStore((s) => s.profiles.admin);
  const pendingReg = useApprovalsStore((s) => s.registrations.filter((r) => r.status === 'pending'));
  const pendingEnrCount = useApprovalsStore((s) => s.enrolments.filter((e) => e.status === 'pending').length);
  const unread = useNotificationsStore((s) => s.byAudience.admin.filter((n) => !n.read).length);
  const total = pendingReg.length + pendingEnrCount;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <SafeAreaView edges={['top']} style={styles.hero}>
          <View style={styles.heroGlow} pointerEvents="none" />

          {/* Clean title bar — brand on left, bell + avatar on right */}
          <View style={styles.titleBar}>
            <Text style={styles.brand}>EduPath</Text>
            <View style={styles.titleBarActions}>
              <IconBtn dark badge={unread} onPress={onBell}>
                <Bell size={18} color={colors.white} />
              </IconBtn>
              <Pressable onPress={onOpenProfile} style={styles.avatarBtn}>
                <Avatar size={36} name={fullName(profile)} variant="lime" photoUri={profile.photoUri} />
              </Pressable>
            </View>
          </View>

          <Text style={styles.h1}>
            {total === 0
              ? <>You're <Text style={{ color: colors.accent }}>all caught up</Text></>
              : <>{total} item{total === 1 ? '' : 's'} <Text style={{ color: colors.accent }}>need you</Text></>}
          </Text>
          <Text style={styles.heroSub}>
            {total === 0 ? 'Nothing in the queue right now.' : 'Approvals are waiting. Older queue items are highlighted.'}
          </Text>

          <View style={styles.cardsRow}>
            <Pressable style={styles.queueCard} onPress={() => onTabChange('registrations')}>
              <View style={styles.queueHead}>
                <View style={styles.queueIcon}>
                  <UserPlus size={14} color={colors.accent} />
                </View>
                <Text style={styles.queueDelta}>+2 today</Text>
              </View>
              <Text style={styles.queueVal}>{pendingReg.length}</Text>
              <Text style={styles.queueLabel}>Sign-ups pending</Text>
            </Pressable>
            <Pressable style={styles.queueCard} onPress={() => onTabChange('enrolments')}>
              <View style={styles.queueHead}>
                <View style={styles.queueIcon}>
                  <ClipboardList size={14} color={colors.accent} />
                </View>
                <Text style={styles.queueDelta}>+1 today</Text>
              </View>
              <Text style={styles.queueVal}>{pendingEnrCount}</Text>
              <Text style={styles.queueLabel}>Enrolment requests</Text>
            </Pressable>
          </View>
        </SafeAreaView>

        <View style={styles.body}>
          <View style={styles.headRow}>
            <Text style={styles.sectionTitle}>Platform</Text>
            <Text style={styles.sectionSub}>Last 7 days</Text>
          </View>
          <View style={styles.statsRow}>
            <Stat icon="Users" label="Active students" value="1,284" delta="+8%" />
            <Stat icon="BookOpen" label="Live courses" value="18" />
            <Stat icon="CheckCircle" label="Lessons done" value="3.4k" delta="+12%" />
          </View>

          <SectionHeader title="Recent queue" actionLabel="View all" onAction={() => onTabChange('registrations')} />
          <View style={styles.list}>
            {pendingReg.slice(0, 4).map((r, i, arr) => (
              <Pressable key={r.id} style={[styles.listItem, i < arr.length - 1 && styles.listItemBorder]} onPress={() => onTabChange('registrations')}>
                <Avatar size={36} name={r.name} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{r.name}</Text>
                  <Text style={styles.listSub} numberOfLines={1}>{r.email} · {r.when}</Text>
                </View>
                <Badge tone="warning" icon={<Clock size={11} color={colors.warning} />}>Pending</Badge>
              </Pressable>
            ))}
          </View>

          <SectionHeader title="Latest activity" actionLabel={onOpenAudit ? 'Open log' : undefined} onAction={onOpenAudit} />
          <View style={styles.list}>
            {AUDIT.slice(0, 3).map((l, i, arr) => {
              const Icon = (Icons as any)[l.ico] ?? Icons.Activity;
              return (
                <Pressable key={l.id} style={[styles.listItem, i < arr.length - 1 && styles.listItemBorder]} onPress={onOpenAudit}>
                  <View style={[styles.activityIcon, { backgroundColor: colors.lightGray }]}>
                    <Icon size={14} color={toneFg(l.tone, colors)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>
                      <Text style={{ fontWeight: '700' }}>{l.who}</Text>{' · '}
                      <Text style={{ color: colors.bodyGreen, fontWeight: '500' }}>{l.what.toLowerCase()}</Text>
                    </Text>
                    <Text style={styles.listSub} numberOfLines={1}>{l.target}</Text>
                  </View>
                  <Text style={styles.when}>{l.when}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  hero: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -50, left: -40,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(188,233,85,0.10)',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 16,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.4,
  },
  titleBarActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarBtn: { borderRadius: 9999, overflow: 'hidden' },
  h1: { color: colors.white, fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6 },
  cardsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  queueCard: {
    flex: 1, padding: 12, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.10)', borderWidth: 1,
  },
  queueHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  queueIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(188,233,85,0.16)', alignItems: 'center', justifyContent: 'center' },
  queueDelta: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  queueVal: { fontSize: 22, fontWeight: '700', color: colors.white, marginTop: 8, letterSpacing: -0.5 },
  queueLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  body: { padding: 16, gap: 12, paddingTop: 16 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primary },
  sectionSub: { fontSize: 11, color: colors.muted },
  statsRow: { flexDirection: 'row', gap: 8 },
  list: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, overflow: 'hidden',
  },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  listItemBorder: { borderBottomColor: colors.stroke2, borderBottomWidth: StyleSheet.hairlineWidth },
  listTitle: { fontSize: 13, fontWeight: '700', color: colors.primary },
  listSub: { fontSize: 11, color: colors.bodyGreen, marginTop: 1 },
  when: { fontSize: 10, color: colors.muted, fontWeight: '500' },
  activityIcon: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
});
