import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Search, Plus, MoreVertical, ArrowRight, Check, Clock,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { ADMINS } from '../../data/mock';
import { colors } from '../../theme/colors';

export function AdminsScreen() {
  const pending = ADMINS.filter(a => a.status === 'pending').length;
  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Administrators"
        subtitle={`${pending} invites pending`}
        trailing={<IconBtn><Search size={18} color={colors.primary} /></IconBtn>}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.invite}>
          <View style={styles.inviteIcon}>
            <Plus size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inviteTitle}>Invite an admin</Text>
            <Text style={styles.inviteSub}>Send a sign-up link by email.</Text>
          </View>
          <ArrowRight size={16} color={colors.muted} />
        </Pressable>

        {ADMINS.map(a => (
          <View key={a.id} style={styles.card}>
            <Avatar size={42} name={a.name} variant="dark" />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{a.name}</Text>
              <Text style={styles.email} numberOfLines={1}>{a.email}</Text>
              <Text style={styles.foot}>{a.status === 'active' ? `${a.courses} courses · joined ${a.joined}` : `Invited ${a.joined}`}</Text>
            </View>
            {a.status === 'active'
              ? <Badge tone="success" icon={<Check size={11} color={colors.successDeep} />}>Active</Badge>
              : <Badge tone="warning" icon={<Clock size={11} color={colors.warning} />}>Pending</Badge>}
            <IconBtn><MoreVertical size={16} color={colors.primary} /></IconBtn>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 12, paddingBottom: 100 },
  invite: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14,
    backgroundColor: colors.lightGray,
    borderColor: colors.stroke, borderWidth: 1, borderStyle: 'dashed',
  },
  inviteIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
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
