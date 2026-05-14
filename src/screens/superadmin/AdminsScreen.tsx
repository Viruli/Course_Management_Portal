import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import {
  ArrowLeft, Search, Plus, MoreVertical, ArrowRight, Check, Clock, Ban, RotateCcw, Trash2,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SearchField } from '../../components/SearchField';
import { listAdmins, suspendAdmin, reactivateAdmin, deleteAdmin } from '../../services/adminManagement';
import { ApiUser } from '../../services/userManagement';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

export function AdminsScreen({ navigation }: any) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [admins,    setAdmins]    = useState<ApiUser[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [actionId,  setActionId]  = useState<string | null>(null);
  const [menuFor,   setMenuFor]   = useState<ApiUser | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    listAdmins().then((r) => {
      if (!cancelled) { setAdmins(r.data.items); setLoading(false); }
    }).catch(() => {
      if (!cancelled) {
        toast.error('Failed to load admins.');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const filtered = admins.filter((a) => {
    if (!q.trim()) return true;
    const ql = q.toLowerCase();
    return `${a.firstName} ${a.lastName}`.toLowerCase().includes(ql) || a.email.toLowerCase().includes(ql);
  });

  const handleSuspend = async (admin: ApiUser) => {
    setMenuFor(null);
    setActionId(admin.uid);
    try {
      await suspendAdmin(admin.uid);
      setAdmins((prev) => prev.map((a) => a.uid === admin.uid ? { ...a, status: 'suspended' } : a));
      toast.success(`${admin.firstName} ${admin.lastName} suspended.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ALREADY_SUSPENDED') {
        toast.error('Already suspended.');
      } else {
        toast.error('Could not suspend. Please try again.');
      }
    } finally {
      setActionId(null);
    }
  };

  const handleReactivate = async (admin: ApiUser) => {
    setMenuFor(null);
    setActionId(admin.uid);
    try {
      await reactivateAdmin(admin.uid);
      setAdmins((prev) => prev.map((a) => a.uid === admin.uid ? { ...a, status: 'approved' } : a));
      toast.success(`${admin.firstName} ${admin.lastName} reactivated.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ALREADY_ACTIVE') {
        toast.error('Already active.');
      } else {
        toast.error('Could not reactivate. Please try again.');
      }
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = (admin: ApiUser) => {
    setMenuFor(null);
    Alert.alert(
      'Delete admin?',
      `${admin.firstName} ${admin.lastName} will be removed permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setActionId(admin.uid);
            try {
              await deleteAdmin(admin.uid);
              setAdmins((prev) => prev.filter((a) => a.uid !== admin.uid));
              toast.success('Admin deleted.');
            } catch (err) {
              if (err instanceof ApiError && err.code === 'USER_NOT_FOUND') {
                setAdmins((prev) => prev.filter((a) => a.uid !== admin.uid));
                toast.info('Admin was already removed.');
              } else {
                toast.error('Could not delete. Please try again.');
              }
            } finally {
              setActionId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Administrators"
        subtitle={`${admins.length} admin${admins.length === 1 ? '' : 's'}`}
        leading={<IconBtn onPress={() => navigation.goBack()}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
        trailing={<IconBtn onPress={() => setSearchOpen((v) => !v)}><Search size={18} color={colors.primary} /></IconBtn>}
      />
      {searchOpen ? (
        <View style={styles.searchBar}>
          <SearchField value={q} onChange={setQ} placeholder="Search by name or email…" />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.invite} onPress={() => navigation.navigate('CreateAdmin')}>
          <View style={styles.inviteIcon}><Plus size={18} color={colors.accent} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inviteTitle}>Invite an admin</Text>
            <Text style={styles.inviteSub}>Create a new admin account.</Text>
          </View>
          <ArrowRight size={16} color={colors.muted} />
        </Pressable>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : filtered.map((a) => {
          const name = `${a.firstName} ${a.lastName}`;
          const isProcessing = actionId === a.uid;
          return (
            <View key={a.uid} style={styles.card}>
              <Pressable style={styles.cardMain} onPress={() => navigation.navigate('UserDetail', { uid: a.uid })}>
                <Avatar size={42} name={name} variant="dark" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.email} numberOfLines={1}>{a.email}</Text>
                </View>
                {a.status === 'approved'
                  ? <Badge tone="success" icon={<Check size={11} color={colors.successDeep} />}>Active</Badge>
                  : a.status === 'suspended'
                  ? <Badge tone="error" icon={<Ban size={11} color={colors.errorDeep} />}>Suspended</Badge>
                  : <Badge tone="warning" icon={<Clock size={11} color={colors.warning} />}>Pending</Badge>}
                <IconBtn onPress={() => { if (!isProcessing) setMenuFor(menuFor?.uid === a.uid ? null : a); }}>
                  <MoreVertical size={16} color={colors.primary} />
                </IconBtn>
              </Pressable>

              {menuFor?.uid === a.uid ? (
                <View style={styles.actionRow}>
                  {a.status === 'approved' && (
                    <Button variant="secondary" size="sm" leftIcon={<Ban size={13} color={colors.primary} />} onPress={() => handleSuspend(a)}>
                      Suspend
                    </Button>
                  )}
                  {a.status === 'suspended' && (
                    <Button size="sm" leftIcon={<RotateCcw size={13} color={colors.white} />} onPress={() => handleReactivate(a)}>
                      Reactivate
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" leftIcon={<Trash2 size={13} color={colors.error} />} onPress={() => handleDelete(a)}>
                    Delete
                  </Button>
                  <Button variant="secondary" size="sm" onPress={() => setMenuFor(null)}>Cancel</Button>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  searchBar:   { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface, borderBottomColor: colors.stroke, borderBottomWidth: StyleSheet.hairlineWidth },
  body:        { padding: 16, gap: 12, paddingBottom: 100 },
  invite: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14,
    backgroundColor: colors.lightGray,
    borderColor: colors.stroke, borderWidth: 1, borderStyle: 'dashed',
  },
  inviteIcon:  { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  inviteTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  inviteSub:   { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  card:        { borderRadius: 16, backgroundColor: colors.surface, borderColor: colors.stroke, borderWidth: 1, overflow: 'hidden' },
  cardMain:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  name:        { fontSize: 14, fontWeight: '700', color: colors.primary },
  email:       { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  actionRow:   { flexDirection: 'row', gap: 8, padding: 12, paddingTop: 0, flexWrap: 'wrap' },
});
