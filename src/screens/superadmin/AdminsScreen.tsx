import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowLeft, Search, Plus, MoreVertical, ArrowRight, Check, Clock,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { SearchField } from '../../components/SearchField';
import { useUsersStore } from '../../store/usersStore';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

export function AdminsScreen({ navigation }: any) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const users = useUsersStore((s) => s.users);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');

  const admins = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return users
      .filter((u) => u.role === 'admin')
      .filter((u) => !ql || u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql));
  }, [users, q]);

  const pending = admins.filter((a) => a.status === 'pending').length;

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Administrators"
        subtitle={`${pending} invite${pending === 1 ? '' : 's'} pending`}
        leading={
          <IconBtn onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={colors.primary} />
          </IconBtn>
        }
        trailing={
          <IconBtn onPress={() => setSearchOpen((v) => !v)}>
            <Search size={18} color={colors.primary} />
          </IconBtn>
        }
      />
      {searchOpen ? (
        <View style={styles.searchBar}>
          <SearchField value={q} onChange={setQ} placeholder="Search by name or email…" />
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable
          style={styles.invite}
          onPress={() => toast.info('Invite flow coming soon. Use Users → Change role for now.')}
        >
          <View style={styles.inviteIcon}>
            <Plus size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inviteTitle}>Invite an admin</Text>
            <Text style={styles.inviteSub}>Send a sign-up link by email.</Text>
          </View>
          <ArrowRight size={16} color={colors.muted} />
        </Pressable>

        {admins.map((a) => (
          <Pressable
            key={a.uid}
            style={styles.card}
            onPress={() => navigation.navigate('UserDetail', { uid: a.uid })}
          >
            <Avatar size={42} name={a.name} variant="dark" photoUri={undefined} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{a.name}</Text>
              <Text style={styles.email} numberOfLines={1}>{a.email}</Text>
              <Text style={styles.foot}>
                {a.status === 'active'
                  ? `${a.managesCourses ?? 0} courses · joined ${a.joined}`
                  : `Invited ${a.joined}`}
              </Text>
            </View>
            {a.status === 'active'
              ? <Badge tone="success" icon={<Check size={11} color={colors.successDeep} />}>Active</Badge>
              : <Badge tone="warning" icon={<Clock size={11} color={colors.warning} />}>Pending</Badge>}
            <IconBtn onPress={() => navigation.navigate('UserDetail', { uid: a.uid })}>
              <MoreVertical size={16} color={colors.primary} />
            </IconBtn>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  searchBar: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomColor: colors.stroke, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: { padding: 16, gap: 12, paddingBottom: 100 },
  invite: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14,
    backgroundColor: colors.lightGray,
    borderColor: colors.stroke, borderWidth: 1, borderStyle: 'dashed',
  },
  inviteIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  inviteTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  inviteSub: { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 16,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
  },
  name: { fontSize: 14, fontWeight: '700', color: colors.primary },
  email: { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  foot: { fontSize: 11, color: colors.muted, marginTop: 2 },
});
