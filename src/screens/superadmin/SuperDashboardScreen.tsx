import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Bell, ClipboardList, History, AlertTriangle, ShieldPlus,
  Rocket, Check, Clock, Users as UsersIco,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { IconBtn } from '../../components/IconBtn';
import { Badge } from '../../components/Badge';
import { SectionHeader } from '../../components/SectionHeader';
import { useUsersStore } from '../../store/usersStore';
import { useApprovalsStore } from '../../store/approvalsStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import { useProfileStore, fullName } from '../../store/profileStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onTabChange: (tab: 'dashboard' | 'approvals' | 'users' | 'courses' | 'more' | 'audit' | 'admins') => void;
  onBell: () => void;
  onOpenProfile?: () => void;
}

const events = [
  { Icon: ShieldPlus,    tone: 'info' as const,    title: 'Admin invite accepted', body: 'Sahan Wijeratne is now active.',          when: '20 min ago' },
  { Icon: AlertTriangle, tone: 'warning' as const, title: '12 failed sign-ins',    body: 'Single IP (Colombo). Auto-rate-limited.', when: '1 h ago' },
  { Icon: Rocket,        tone: 'info' as const,    title: 'Course published',      body: 'Business English · v2 by Tharushi.',      when: '2 h ago' },
];

export function SuperDashboardScreen({ onTabChange, onBell, onOpenProfile }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const profile = useProfileStore((s) => s.profiles.super);
  const users = useUsersStore((s) => s.users);
  const pending = useApprovalsStore((s) =>
    s.registrations.filter((r) => r.status === 'pending').length +
    s.enrolments.filter((e) => e.state === 'pending').length
  );
  const unread = useNotificationsStore((s) => s.byAudience.admin.filter((n) => !n.read).length);
  const adminUsers = users.filter((u) => u.role === 'admin');
  const pendingAdmins = adminUsers.filter((u) => u.status === 'pending').length;

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
            Platform <Text style={{ color: colors.accent }}>health</Text>
          </Text>
          <Text style={styles.heroSub}>
            {pendingAdmins > 0
              ? `${pendingAdmins} admin invite${pendingAdmins === 1 ? '' : 's'} pending acceptance.`
              : 'No admin invites pending.'}
          </Text>

          <View style={styles.cardsRow}>
            {[
              { Icon: ClipboardList, val: String(pending),       label: 'Approvals queued', onPress: () => onTabChange('approvals') },
              { Icon: UsersIco,      val: String(users.length),  label: 'Total users',      onPress: () => onTabChange('users') },
              { Icon: History,       val: '47',                  label: 'Events today',     onPress: () => onTabChange('audit') },
            ].map(s => (
              <Pressable key={s.label} onPress={s.onPress} style={styles.queueCard}>
                <View style={styles.queueIcon}>
                  <s.Icon size={14} color={colors.accent} />
                </View>
                <Text style={styles.queueVal}>{s.val}</Text>
                <Text style={styles.queueLabel}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>

        <View style={styles.body}>
          <SectionHeader title="Admins" actionLabel="Manage" onAction={() => onTabChange('admins')} />
          <View style={styles.list}>
            {adminUsers.slice(0, 3).map((a, i, arr) => (
              <Pressable key={a.uid} style={[styles.listItem, i < arr.length - 1 && styles.listItemBorder]} onPress={() => onTabChange('admins')}>
                <Avatar size={36} name={a.name} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{a.name}</Text>
                  <Text style={styles.listSub}>{a.managesCourses ?? 0} courses · joined {a.joined}</Text>
                </View>
                {a.status === 'active'
                  ? <Badge tone="success" icon={<Check size={11} color={colors.successDeep} />}>Active</Badge>
                  : <Badge tone="warning" icon={<Clock size={11} color={colors.warning} />}>Pending</Badge>}
              </Pressable>
            ))}
          </View>

          <SectionHeader title="System events" actionLabel="Open log" onAction={() => onTabChange('audit')} />
          <View style={{ gap: 10 }}>
            {events.map((e, i) => (
              <Pressable key={i} style={styles.eventCard} onPress={() => onTabChange('audit')}>
                <View
                  style={[
                    styles.eventIcon,
                    {
                      backgroundColor: e.tone === 'warning' ? colors.warningBg : colors.infoBg,
                    },
                  ]}
                >
                  <e.Icon size={16} color={e.tone === 'warning' ? colors.warning : colors.info} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <Text style={styles.eventBody}>{e.body}</Text>
                </View>
                <Text style={styles.when}>{e.when}</Text>
              </Pressable>
            ))}
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
    position: 'absolute', top: -50, right: -40,
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
  queueIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(188,233,85,0.16)', alignItems: 'center', justifyContent: 'center' },
  queueVal: { fontSize: 22, fontWeight: '700', color: colors.white, marginTop: 8, letterSpacing: -0.5 },
  queueLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  body: { padding: 16, gap: 12, paddingTop: 16 },
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
  eventCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 14,
  },
  eventIcon: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  eventTitle: { fontSize: 13, fontWeight: '700', color: colors.primary },
  eventBody: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },
});
