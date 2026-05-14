import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, ShieldCheck, Shield, GraduationCap, Check,
  CircleSlash, RotateCcw, AlertTriangle, ChevronRight,
  Mail, Calendar, Activity, ArrowUpRight, ArrowDownRight,
  BookOpen,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Eyebrow } from '../../components/Eyebrow';
import { Progress } from '../../components/Progress';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import { useUsersStore } from '../../store/usersStore';
import { useAppStore } from '../../store/appStore';
import { toast } from '../../store/uiStore';
import { getUserById, suspendUser, reactivateUser, ApiUserDetail } from '../../services/userManagement';
import { ApiError } from '../../services/api';
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
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { uid } = route.params;
  const user      = useUsersStore((s) => s.users.find((u) => u.uid === uid));
  const currentSuper = useUsersStore((s) => s.users.find((u) => u.role === 'super'));
  const changeRole = useUsersStore((s) => s.changeRole);
  const approve   = useUsersStore((s) => s.approve);
  const suspend   = useUsersStore((s) => s.suspend);
  const reinstate = useUsersStore((s) => s.reinstate);

  const [sheetOpen,    setSheetOpen]    = useState(false);
  const [confirmRole,  setConfirmRole]  = useState<AppRole | null>(null);
  const [apiUser,      setApiUser]      = useState<ApiUserDetail | null>(null);
  const [apiLoading,   setApiLoading]   = useState(true);
  const [suspending,   setSuspending]   = useState(false);
  const [reactivating, setReactivating] = useState(false);

  const currentRole = useAppStore((s) => s.role);

  useEffect(() => {
    let cancelled = false;
    getUserById(uid).then((r) => {
      if (!cancelled) { setApiUser(r.data); setApiLoading(false); }
    }).catch(() => {
      if (!cancelled) setApiLoading(false);
    });
    return () => { cancelled = true; };
  }, [uid]);

  const handleSuspend = async () => {
    setSuspending(true);
    try {
      await suspendUser(uid);
      setApiUser((prev) => prev ? { ...prev, status: 'suspended' } : prev);
      user && suspend(uid);  // keep mock store in sync
      toast.success(`${apiUser?.firstName ?? user?.name ?? 'User'} suspended.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ALREADY_SUSPENDED') {
        toast.error('This account is already suspended.');
      } else {
        toast.error('Could not suspend. Please try again.');
      }
    } finally {
      setSuspending(false);
    }
  };

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      await reactivateUser(uid);
      setApiUser((prev) => prev ? { ...prev, status: 'approved' } : prev);
      user && reinstate(uid);  // keep mock store in sync
      toast.success(`${apiUser?.firstName ?? user?.name ?? 'User'} reactivated.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ALREADY_ACTIVE') {
        toast.error('This account is already active.');
      } else {
        toast.error('Could not reactivate. Please try again.');
      }
    } finally {
      setReactivating(false);
    }
  };

  // ── All derived values and hooks below this line must run on EVERY render
  //    (before any conditional early returns) to satisfy React's rules of hooks.

  // API data is the source of truth; fall back to mock store for fields the
  // API doesn't expose (joined date, role-change UX).
  const displayName   = apiUser ? `${apiUser.firstName} ${apiUser.lastName}` : (user?.name ?? '');
  const displayEmail  = apiUser?.email  ?? user?.email  ?? '';
  const displayRole   = apiUser?.role   ?? (user?.role === 'super' ? 'super_admin' : user?.role ?? 'student');
  const displayStatus = apiUser?.status ?? (user?.status === 'pending' ? 'pending_approval' : user?.status === 'suspended' ? 'suspended' : 'approved');

  // Map role string → display metadata (handles both 'super_admin' and 'super').
  const appRole: AppRole = displayRole === 'super_admin' ? 'super' : (displayRole as AppRole);
  const meta    = roleMeta[appRole] ?? roleMeta.student;
  const RoleIcon = meta.Icon;

  // Permission rules:
  // - Super admin: full actions on all accounts + role management
  // - Admin: view-only for other admins/super admins; can only act on students
  const isViewingStudent = appRole === 'student';
  // Super admin accounts cannot be suspended — there is only one super admin
  // and suspending them would lock the platform.
  const canManageAccount = appRole !== 'super' &&
    (currentRole === 'super' || (currentRole === 'admin' && isViewingStudent));
  const canChangeRole    = currentRole === 'super';

  // useMemo is a hook — must be here, before any early returns.
  const suggestedRole: AppRole | null = useMemo(() => {
    if (appRole === 'student') return 'admin';
    if (appRole === 'admin')   return 'super';
    return null;
  }, [appRole]);

  // ── Early returns (all hooks already called above) ─────────────────────────
  if (apiLoading) {
    return (
      <ScreenContainer edges={['top']}>
        <AppBar title="User" leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </ScreenContainer>
    );
  }

  if (!apiUser && !user) {
    return (
      <ScreenContainer edges={['top']}>
        <AppBar title="User" leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>} />
        <View style={{ padding: 24 }}>
          <Text style={{ color: colors.bodyGreen }}>User not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  // ── Handlers (non-hook) ────────────────────────────────────────────────────

  const handleRoleChosen = (newRole: AppRole) => {
    if (!user) return;
    setSheetOpen(false);
    if (newRole === user.role) return;
    requestAnimationFrame(() => setConfirmRole(newRole));
  };

  const confirmRoleChange = () => {
    if (!confirmRole || !user) return;
    const willTransfer =
      confirmRole === 'super' && !!currentSuper && currentSuper.uid !== user.uid;
    const previousSuperName = currentSuper?.name;
    changeRole(user.uid, confirmRole);
    setConfirmRole(null);
    if (willTransfer) {
      toast.success(`${user.name} is now Super Admin. ${previousSuperName} demoted to Admin.`);
    } else {
      toast.success(`${user.name} is now ${roleMeta[confirmRole].label}.`);
    }
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
          <Avatar size={84} name={displayName} variant={appRole === 'super' ? 'lime' : appRole === 'admin' ? 'dark' : 'default'} />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          <View style={{ marginTop: 6 }}>
            <Eyebrow lime icon={<RoleIcon size={11} color={colors.primary} />}>
              {meta.label}
            </Eyebrow>
          </View>
          {(displayStatus === 'pending_approval' || displayStatus === 'suspended') && (
            <View style={{ marginTop: 8 }}>
              {displayStatus === 'pending_approval' ? (
                <Badge tone="warning">Pending approval</Badge>
              ) : (
                <Badge tone="error">Account suspended</Badge>
              )}
            </View>
          )}
        </View>

        {/* Profile fields */}
        <View style={styles.card}>
          <DetailRow Icon={Mail}     label="Email"   value={displayEmail} />
          <DetailRow Icon={Calendar} label="Joined"  value={user?.joined ?? (apiUser?.createdAt ? new Date(apiUser.createdAt).toLocaleDateString() : '—')} />
          <DetailRow Icon={Activity} label="Status"  value={displayStatus} last />

          {/* Real enrollment history from API */}
          {apiLoading ? (
            <ActivityIndicator size="small" color={colors.muted} style={{ marginTop: 8 }} />
          ) : apiUser?.enrollments?.length ? (
            <View style={{ gap: 6, marginTop: 8 }}>
              <Text style={styles.sectionLabel}>Enrollments</Text>
              {apiUser.enrollments.map((e) => (
                <View key={e.courseId} style={styles.enrollRow}>
                  <BookOpen size={14} color={colors.bodyGreen} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.enrollTitle} numberOfLines={1}>{e.courseTitle}</Text>
                    {e.completionPercent > 0 ? (
                      <Progress pct={e.completionPercent} />
                    ) : null}
                  </View>
                  <Text style={styles.enrollPct}>{e.completionPercent.toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Role & permissions — super admins only; admins are view-only */}
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
          {canChangeRole && (
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
          )}
        </View>

        {/* Account actions — admins can only act on students; super admins can act on anyone */}
        {canManageAccount ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Account</Text>
            {(apiUser?.status === 'approved' || user?.status === 'active') && (
              <Button
                variant="secondary" full size="lg"
                leftIcon={<CircleSlash size={16} color={colors.error} />}
                disabled={suspending}
                onPress={handleSuspend}
              >
                {suspending ? 'Suspending…' : 'Suspend account'}
              </Button>
            )}
            {(apiUser?.status === 'suspended' || user?.status === 'suspended') && (
              <Button
                full size="lg"
                leftIcon={<RotateCcw size={16} color={colors.white} />}
                disabled={reactivating}
                onPress={handleReactivate}
              >
                {reactivating ? 'Reactivating…' : 'Reinstate account'}
              </Button>
            )}
            {user?.status === 'pending' && (
              <Button
                full size="lg"
                leftIcon={<Check size={16} color={colors.white} />}
                onPress={() => user && approve(user.uid)}
              >
                Approve account
              </Button>
            )}
            {displayStatus === 'pending_approval' && !user && (
              <Button variant="secondary" full size="lg" disabled>
                Pending approval
              </Button>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Account</Text>
            <Text style={styles.viewOnlyNote}>
              You can view this profile but cannot perform account actions on {meta.label.toLowerCase()} accounts.
            </Text>
          </View>
        )}
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
              <Text style={styles.sheetSub}>{displayName} · {displayEmail}</Text>
              <View style={{ gap: 8, marginTop: 14 }}>
                {(['student', 'admin', 'super'] as AppRole[]).map((r) => {
                  const m = roleMeta[r];
                  const Icon = m.Icon;
                  const isCurrent = r === appRole;
                  // For the Super Admin row, surface that the role is
                  // exclusive and currently held by someone else.
                  const isTransfer = r === 'super' && !!currentSuper && currentSuper.uid !== user?.uid;
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
                        {isTransfer ? (
                          <Text style={styles.roleOptionTransfer}>
                            Currently held by {currentSuper!.name} — promoting transfers ownership.
                          </Text>
                        ) : null}
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
              {confirmRole === 'super' && currentSuper && currentSuper.uid !== user?.uid
                ? 'Transfer Super Admin?'
                : confirmRole === 'admin' && appRole === 'student' ? 'Promote to Admin?'
                : confirmRole === 'super' ? 'Promote to Super Admin?'
                : confirmRole === 'student' ? 'Demote to Student?'
                : 'Change role?'}
            </Text>
            <Text style={styles.dialogBody}>
              {confirmRole && (
                <>
                  This changes <Text style={{ fontWeight: '700' }}>{displayName}</Text>'s role from{' '}
                  <Text style={{ fontWeight: '700' }}>{meta.label}</Text> to{' '}
                  <Text style={{ fontWeight: '700' }}>{roleMeta[confirmRole].label}</Text>.
                  {confirmRole === 'admin' && '\n\nThey will gain access to course authoring and sign-up/enrolment approvals.'}
                  {confirmRole === 'super' && currentSuper && currentSuper.uid !== user?.uid
                    ? `\n\nOnly one Super Admin can exist. ${currentSuper.name} will be demoted to Admin.`
                    : confirmRole === 'super' ? '\n\nThey will gain full platform oversight including user management.' : ''}
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
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
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

const createStyles = (colors: Colors) => StyleSheet.create({
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
  enrollRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  enrollTitle:  { fontSize: 12, color: colors.primary, flex: 1 },
  enrollPct:    { fontSize: 11, color: colors.bodyGreen, fontWeight: '600' },
  viewOnlyNote: { fontSize: 12, color: colors.muted, lineHeight: 17 },

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
    backgroundColor: colors.brand,
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
  roleOptionTransfer: {
    fontSize: 11, fontWeight: '700', color: colors.warning,
    marginTop: 6, lineHeight: 14,
  },
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
