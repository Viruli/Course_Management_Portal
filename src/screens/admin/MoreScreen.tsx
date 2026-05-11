import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ChevronRight, Shield, BookOpen, History, Users, Megaphone, Settings, LifeBuoy,
  LogOut, ShieldCheck,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Eyebrow } from '../../components/Eyebrow';
import { ADMIN_USER, SUPER } from '../../data/mock';
import { useAppStore } from '../../store/appStore';
import { colors } from '../../theme/colors';
import type { Role } from '../../data/types';

interface Props {
  role: Role;
  onOpenAudit: () => void;
  onOpenCourses: () => void;
  onOpenAdmins?: () => void;
}

export function MoreScreen({ role, onOpenAudit, onOpenCourses, onOpenAdmins }: Props) {
  const setRole = useAppStore(s => s.setRole);
  const isSuper = role === 'super';
  const user = isSuper ? SUPER : ADMIN_USER;

  const baseItems = [
    { Icon: BookOpen,  label: 'Courses',       sub: '18 published · 3 drafts',     onPress: onOpenCourses },
    { Icon: History,   label: 'Audit log',     sub: 'Recent platform activity',    onPress: onOpenAudit },
    { Icon: Users,     label: 'Students',      sub: '1,284 active' },
    { Icon: Megaphone, label: 'Announcements', sub: 'Send platform updates' },
    { Icon: Settings,  label: 'Settings',      sub: 'Account, security, prefs' },
    { Icon: LifeBuoy,  label: 'Help & support' },
  ];

  const items = isSuper
    ? [{ Icon: ShieldCheck, label: 'Administrators', sub: '5 admins · 2 pending', onPress: onOpenAdmins }, ...baseItems]
    : baseItems;

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar title="More" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <Avatar size={48} name={user.name} variant="lime" />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={{ marginTop: 6 }}>
              <Eyebrow lime icon={<Shield size={11} color={colors.primary} />}>{user.role}</Eyebrow>
            </View>
          </View>
          <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
        </View>

        <View style={styles.menu}>
          {items.map((it, i) => (
            <Pressable
              key={it.label}
              onPress={it.onPress}
              style={[styles.menuItem, i < items.length - 1 && styles.menuItemBorder]}
            >
              <View style={styles.menuIcon}>
                <it.Icon size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{it.label}</Text>
                {it.sub ? <Text style={styles.menuSub}>{it.sub}</Text> : null}
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <Button variant="secondary" full size="lg" leftIcon={<LogOut size={16} color={colors.primary} />} onPress={() => setRole('public')}>
          Sign out
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 100 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 16,
    backgroundColor: colors.primary,
  },
  userName: { fontSize: 16, color: colors.white, fontWeight: '700' },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  menu: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  menuItemBorder: { borderBottomColor: colors.stroke2, borderBottomWidth: StyleSheet.hairlineWidth },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 14, fontWeight: '700', color: colors.primary },
  menuSub: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },
});
