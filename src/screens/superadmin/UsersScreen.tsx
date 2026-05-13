import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ChevronRight, ShieldCheck, Shield, GraduationCap,
  CircleSlash, Clock, Check,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { Avatar } from '../../components/Avatar';
import { SearchField } from '../../components/SearchField';
import { Pill } from '../../components/Pill';
import { Badge } from '../../components/Badge';
import { listUsers, ApiUser } from '../../services/userManagement';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  navigation: any;
}

type FilterId = 'all' | 'student' | 'admin' | 'super';

const filters: { id: FilterId; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'student', label: 'Students' },
  { id: 'admin',   label: 'Admins' },
  { id: 'super',   label: 'Super Admins' },
];

// Map UI filter id → API role param
const filterToRole = (f: FilterId): string | undefined => {
  if (f === 'all') return undefined;
  if (f === 'super') return 'super_admin';
  return f;
};

export function UsersScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [users,   setUsers]   = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<FilterId>('all');
  const [q,       setQ]       = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await listUsers({ role: filterToRole(filter) });
        if (!cancelled) setUsers(result.data.items);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT')) {
            toast.error("Couldn't reach the server. Check your connection.");
          } else {
            toast.error('Failed to load users.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filter]);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return users;
    return users.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(ql) ||
      u.email.toLowerCase().includes(ql),
    );
  }, [users, q]);

  const pending = users.filter((u) => u.status === 'pending_approval').length;

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar title="Users" subtitle={`${users.length} total · ${pending} pending`} />
      <View style={styles.searchBar}>
        <SearchField value={q} onChange={setQ} placeholder="Search by name or email…" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {filters.map((f) => (
            <Pill key={f.id} active={filter === f.id} onPress={() => setFilter(f.id)}>
              {f.label}
            </Pill>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No users match those filters.</Text>
          </View>
        ) : (
          list.map((u) => (
            <UserRow
              key={u.uid}
              user={u}
              onPress={() => navigation.navigate('UserDetail', { uid: u.uid })}
            />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function UserRow({ user, onPress }: { user: ApiUser; onPress: () => void }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const RoleIcon = user.role === 'super_admin' ? ShieldCheck : user.role === 'admin' ? Shield : GraduationCap;
  const roleLabel = user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Student';
  const name = `${user.firstName} ${user.lastName}`;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Avatar size={42} name={name} variant={user.role === 'super_admin' ? 'lime' : user.role === 'admin' ? 'dark' : 'default'} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {user.status === 'pending_approval' ? (
            <Badge tone="warning" icon={<Clock size={11} color={colors.warning} />}>Pending</Badge>
          ) : user.status === 'suspended' ? (
            <Badge tone="error" icon={<CircleSlash size={11} color={colors.errorDeep} />}>Suspended</Badge>
          ) : user.status === 'approved' ? (
            <Badge tone="success" icon={<Check size={11} color={colors.successDeep} />}>Active</Badge>
          ) : null}
        </View>
        <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
        <View style={styles.metaRow}>
          <View style={styles.roleChip}>
            <RoleIcon size={11} color={colors.primary} />
            <Text style={styles.roleChipText}>{roleLabel}</Text>
          </View>
          <Text style={styles.lastActive}>· {user.enrolledCourses} course{user.enrolledCourses === 1 ? '' : 's'}</Text>
        </View>
      </View>
      <ChevronRight size={18} color={colors.muted} />
    </Pressable>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  searchBar: {
    paddingHorizontal: 16, paddingVertical: 10, gap: 10,
    backgroundColor: colors.surface,
    borderBottomColor: colors.stroke, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pillsRow: { gap: 6, paddingRight: 16 },
  body:     { padding: 16, gap: 10, paddingBottom: 100 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 14,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name:     { flex: 1, fontSize: 14, fontWeight: '700', color: colors.primary },
  email:    { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  roleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999,
    backgroundColor: colors.lightGray,
  },
  roleChipText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  lastActive:   { fontSize: 11, color: colors.muted },
  empty:        { padding: 32, alignItems: 'center' },
  emptyText:    { fontSize: 14, color: colors.bodyGreen },
});
