import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import { useUsersStore } from '../../store/usersStore';
import type { AppRole, AppUser } from '../../data/types';

interface Props {
  navigation: any;
}

type FilterId = 'all' | AppRole;

const filters: { id: FilterId; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'student', label: 'Students' },
  { id: 'admin',   label: 'Admins' },
  { id: 'super',   label: 'Super Admins' },
];

export function UsersScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const users = useUsersStore((s) => s.users);
  const [filter, setFilter] = useState<FilterId>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return users.filter((u) => {
      if (filter !== 'all' && u.role !== filter) return false;
      if (!ql) return true;
      return u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql);
    });
  }, [users, filter, q]);

  const counts = useMemo(() => ({
    all:     users.length,
    student: users.filter((u) => u.role === 'student').length,
    admin:   users.filter((u) => u.role === 'admin').length,
    super:   users.filter((u) => u.role === 'super').length,
  }), [users]);

  const pending = users.filter((u) => u.status === 'pending').length;

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
              {`${f.label} · ${counts[f.id]}`}
            </Pill>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
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

function UserRow({ user, onPress }: { user: AppUser; onPress: () => void }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const RoleIcon = user.role === 'super' ? ShieldCheck : user.role === 'admin' ? Shield : GraduationCap;
  const roleLabel = user.role === 'super' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Student';

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Avatar size={42} name={user.name} variant={user.role === 'super' ? 'lime' : user.role === 'admin' ? 'dark' : 'default'} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
          {user.status === 'pending' ? (
            <Badge tone="warning" icon={<Clock size={11} color={colors.warning} />}>Pending</Badge>
          ) : user.status === 'suspended' ? (
            <Badge tone="error" icon={<CircleSlash size={11} color={colors.errorDeep} />}>Suspended</Badge>
          ) : null}
        </View>
        <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
        <View style={styles.metaRow}>
          <View style={styles.roleChip}>
            <RoleIcon size={11} color={colors.primary} />
            <Text style={styles.roleChipText}>{roleLabel}</Text>
          </View>
          <Text style={styles.lastActive}>· {user.lastActive}</Text>
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
  body: { padding: 16, gap: 10, paddingBottom: 100 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 14,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.primary },
  email: { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  roleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999,
    backgroundColor: colors.lightGray,
  },
  roleChipText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  lastActive: { fontSize: 11, color: colors.muted },

  empty: {
    padding: 24, alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 14,
    borderColor: colors.stroke, borderWidth: 1,
  },
  emptyText: { fontSize: 13, color: colors.bodyGreen },
});
