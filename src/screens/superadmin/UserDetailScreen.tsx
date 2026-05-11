import React, { useMemo, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, ShieldCheck, Shield, GraduationCap, Check,
  CircleSlash, RotateCcw, AlertTriangle, ChevronRight,
  Mail, Calendar, Activity, ArrowUpRight, ArrowDownRight,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Eyebrow } from '../../components/Eyebrow';
import { colors } from '../../theme/colors';
import { useUsersStore } from '../../store/usersStore';
import type { AppRole } from '../../data/types';

interface Props {
  route: { params: { uid: string } };
  navigation: any;
}

const roleMeta: Record<AppRole, { Icon: any; label: string; desc: string }> = {
  student: { Icon: GraduationCap, label: 'Student',     desc: 'Can browse courses, enrol and learn.' },
  admin:   { Icon: Shield,        label: 'Admin',       desc: 'Can approve sign-ups and author courses.' },
  super:   { Icon: ShieldCheck,   label: 'Super Admin', desc: 'Full platform oversight + user management.' },
};

export function UserDetailScreen({ route, navigation }: Props) {
  const { uid } = route.params;
  const user      = useUsersStore((s) => s.users.find((u) => u.uid === uid));
  const changeRole = useUsersStore((s) => s.changeRole);
  const approve   = useUsersStore((s) => s.approve);
  const suspend   = useUsersStore((s) => s.suspend);
  const reinstate = useUsersStore((s) => s.reinstate);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmRole, setConfirmRole] = useState<AppRole | null>(null);

  if (!user) {
    return (
      <ScreenContainer edges={['top']}>
        <AppBar title="User" leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>} />
        <View style={{ padding: 24 }}>
          <Text style={{ color: colors.bodyGreen }}>User not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const meta = roleMeta[user.role];
  const RoleIcon = meta.Icon;

  // Highlight the "interesting" target role (e.g. Student → Admin) to make
  // the convert-to-admin flow more discoverable.
  const suggestedRole: AppRole | null = useMemo(() => {
    if (user.role === 'student') return 'admin';
    if (user.role === 'admin')   return 'super';
    return null;
  }, [user.role]);

  const handleRoleChosen = (newRole: AppRole) => {
    setSheetOpen(false);
    if (newRole === user.role) return;
    // Defer the confirmation modal to the next frame so the sheet has time
    // to dismiss before we layer another modal on top.
    requestAnimationFrame(() => setConfirmRole(newRole));
  };

  const confirmRoleChange = () => {
    if (!confirmRole) return;
    changeRole(user.uid, confirmRole);
    setConfirmRole(null);
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="User"
        leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profile}>
          <Avatar size={84} name={user.name} variant={user.role === 'super' ? 'lime' : user.role === 'admin' ? 'dark' : 'default'} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={{ marginTop: 6 }}>
            <Eyebrow lime icon={<RoleIcon size={11} color={colors.primary} />}>
              {meta.label}
            </Eyebrow>
          </View>
          {user.status !== 'active' && (
            <View style={{ marginTop: 8 }}>
              {user.status === 'pending' ? (
                <Badge tone="warning">Pending approval</Badge>
              ) : (
                <Badge tone="error">Account suspended</Badge>
              )}
            </View>
          )}
        </View>

        {/* Profile fields */}
        <View style={styles.card}>
          <DetailRow Icon={Mail}     label="Email"        value={user.email} />
          <DetailRow Icon={Calendar} label="Joined"       value={user.joined} />
          <DetailRow Icon={Activity} label="Last active"  value={user.lastActive} />
          {user.role === 'student' && user.enrolled != null && (
            <DetailRow Icon={GraduationCap} label="Courses enrolled" value={String(user.enrolled)} last />
          )}
          {user.role !== 'student' && user.managesCourses != null && (
            <DetailRow Icon={Shield} label="Courses managed" value={String(user.managesCourses)} last />
          )}
        </View>

        {/* Role management */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Role & permissions</Text>
          <View style={styles.currentRole}>
            <View style={[styles.currentRoleIco, { backgroundColor: colors.lightGray }]}>
              <RoleIcon size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentRoleLabel}>Current role</Text>
              <Text style={styles.currentRoleName}>{meta.label}</Text>
              <Text style={styles.currentRoleDesc}>{meta.desc}</Text>
            </View>
          </View>
          <Pressable style={styles.changeRoleBtn} onPress={() => setSheetOpen(true)}>
            <Text style={styles.changeRoleText}>Change role</Text>
            {suggestedRole ? (
              <View style={styles.suggestChip}>
                <Text style={styles.suggestChipText}>
                  Promote to {roleMeta[suggestedRole].label}
                </Text>
                <ArrowUpRight size={11} color={colors.primary} />
              </View>
            ) : null}
            <ChevronRight size={16} color={colors.primary} />
          </Pressable>
        </View>

        {/* Account actions */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Account</Text>
          {user.status === 'pending' && (
            <Button
              full size="lg"
              leftIcon={<Check size={16} color={colors.white} />}
              onPress={() => approve(user.uid)}
            >
              Approve account
            </Button>
          )}
          {user.status === 'active' && (
            <Button
              variant="secondary" full size="lg"
              leftIcon={<CircleSlash size={16} color={colors.error} />}
              onPress={() => suspend(user.uid)}
            >
              Suspend account
            </Button>
          )}
          {user.status === 'suspended' && (
            <Button
              full size="lg"
              leftIcon={<RotateCcw size={16} color={colors.white} />}
              onPress={() => reinstate(user.uid)}
            >
              Reinstate account
            </Button>
          )}
        </View>
      </ScrollView>

      {/* Role selector bottom sheet */}
      <Modal
        transparent
        animationType="fade"
        visible={sheetOpen}
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setSheetOpen(false)}>
          <SafeAreaView edges={['bottom']} style={{ width: '100%' }}>
            <Pressable style={styles.sheetPanel} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Change role</Text>
              <Text style={styles.sheetSub}>{user.name} · {user.email}</Text>
              <View style={{ gap: 8, marginTop: 14 }}>
                {(['student', 'admin', 'super'] as AppRole[]).map((r) => {
                  const m = roleMeta[r];
                  const Icon = m.Icon;
                  const isCurrent = r === user.role;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => handleRoleChosen(r)}
                      disabled={isCurrent}
                      style={[
                        styles.roleOption,
                        isCurrent && { opacity: 0.55 },
                      ]}
                    >
                      <View style={[styles.roleOptionIco, isCurrent && { backgroundColor: colors.lightGray }]}>
                        <Icon size={18} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.roleOptionLabel}>{m.label}</Text>
                        <Text style={styles.roleOptionDesc}>{m.desc}</Text>
                      </View>
                      {isCurrent ? (
                        <Text style={styles.roleOptionCurrent}>Current</Text>
                      ) : (
                        <ChevronRight size={16} color={colors.muted} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ marginTop: 16 }}>
                <Button variant="secondary" full size="lg" onPress={() => setSheetOpen(false)}>
                  Cancel
                </Button>
              </View>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>

      {/* Confirmation modal */}
      <Modal
        transparent
        animationType="fade"
        visible={confirmRole !== null}
        onRequestClose={() => setConfirmRole(null)}
      >
        <Pressable style={styles.dialogBackdrop} onPress={() => setConfirmRole(null)}>
          <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialogIco}>
              <AlertTriangle size={24} color={colors.warning} />
            </View>
            <Text style={styles.dialogTitle}>
              {confirmRole === 'admin' && user.role === 'student' ? 'Promote to Admin?' :
               confirmRole === 'super' ? 'Promote to Super Admin?' :
               confirmRole === 'student' ? 'Demote to Student?' :
               'Change role?'}
            </Text>
            <Text style={styles.dialogBody}>
              {confirmRole && (
                <>
                  This changes <Text style={{ fontWeight: '700' }}>{user.name}</Text>'s role from{' '}
                  <Text style={{ fontWeight: '700' }}>{meta.label}</Text> to{' '}
                  <Text style={{ fontWeight: '700' }}>{roleMeta[confirmRole].label}</Text>.
                  {confirmRole === 'admin' && '\n\nThey will gain access to course authoring and sign-up/enrolment approvals.'}
                  {confirmRole === 'super' && '\n\nThey will gain full platform oversight including user management.'}
                  {confirmRole === 'student' && '\n\nThey will lose all admin/super admin permissions.'}
                </>
              )}
            </Text>
            <View style={styles.dialogActions}>
              <View style={{ flex: 1 }}>
                <Button variant="secondary" full size="lg" onPress={() => setConfirmRole(null)}>
                  Cancel
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  full
                  size="lg"
                  leftIcon={<Check size={16} color={colors.white} />}
                  onPress={confirmRoleChange}
                >
                  Confirm
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

function DetailRow({ Icon, label, value, last }: { Icon: any; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <View style={styles.detailIco}>
        <Icon size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 40 },

  profile: {
    alignItems: 'center', paddingVertical: 16, gap: 4,
    backgroundColor: colors.surface, borderRadius: 16,
    borderColor: colors.stroke, borderWidth: 1,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.primary, marginTop: 8, letterSpacing: -0.3 },
  email: { fontSize: 12, color: colors.bodyGreen },

  card: {
    padding: 14, gap: 10,
    backgroundColor: colors.surface, borderRadius: 16,
    borderColor: colors.stroke, borderWidth: 1,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.bodyGreen, letterSpacing: 0.6, textTransform: 'uppercase' },

  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  detailRowBorder: { borderBottomColor: colors.stroke2, borderBottomWidth: StyleSheet.hairlineWidth },
  detailIco: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  detailLabel: { fontSize: 11, color: colors.bodyGreen },
  detailValue: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 2 },

  currentRole: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 12, borderRadius: 12, backgroundColor: colors.lightGray,
  },
  currentRoleIco: {
    width: 36, height: 36, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  currentRoleLabel: { fontSize: 11, color: colors.bodyGreen, fontWeight: '600' },
  currentRoleName: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: 1 },
  currentRoleDesc: { fontSize: 12, color: colors.bodyGreen, marginTop: 4, lineHeight: 16 },

  changeRoleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  changeRoleText: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.white },
  suggestChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999,
    backgroundColor: colors.accent,
  },
  suggestChipText: { fontSize: 10, fontWeight: '700', color: colors.primary },

  // Bottom sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetPanel: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 38, height: 4, borderRadius: 2,
    backgroundColor: colors.stroke,
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.primary, letterSpacing: -0.2 },
  sheetSub: { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },

  roleOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12,
    borderColor: colors.stroke, borderWidth: 1,
    backgroundColor: colors.surface,
  },
  roleOptionIco: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: 'rgba(188,233,85,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  roleOptionLabel: { fontSize: 14, fontWeight: '700', color: colors.primary },
  roleOptionDesc: { fontSize: 11, color: colors.bodyGreen, marginTop: 2, lineHeight: 14 },
  roleOptionCurrent: {
    fontSize: 10, fontWeight: '700', color: colors.bodyGreen,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999,
    backgroundColor: colors.lightGray,
  },

  // Confirmation dialog
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%', maxWidth: 360,
    padding: 20, borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center', gap: 8,
  },
  dialogIco: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.warningBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  dialogTitle: { fontSize: 17, fontWeight: '700', color: colors.primary, letterSpacing: -0.2, textAlign: 'center' },
  dialogBody: { fontSize: 13, color: colors.bodyGreen, textAlign: 'center', lineHeight: 18 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
});
