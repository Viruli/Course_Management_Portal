import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Settings, GraduationCap, Award, Bell, CreditCard, Shield,
  LifeBuoy, ChevronRight, LogOut,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Eyebrow } from '../../components/Eyebrow';
import { Stat } from '../../components/Stat';
import { STUDENT } from '../../data/mock';
import { useAppStore } from '../../store/appStore';
import { colors } from '../../theme/colors';

interface Props {
  onTabChange: (tab: 'home' | 'browse' | 'mine' | 'profile') => void;
  onBell: () => void;
}

export function ProfileScreen({ onBell }: Props) {
  const setRole = useAppStore(s => s.setRole);

  const items = [
    { Icon: GraduationCap, label: 'My Learning',         sub: '4 courses · 23h watched' },
    { Icon: Award,         label: 'Certificates',        sub: 'View completion certificates' },
    { Icon: Bell,          label: 'Notifications',       sub: '3 unread', onPress: onBell },
    { Icon: CreditCard,    label: 'Billing',             sub: 'Receipts and invoices' },
    { Icon: Shield,        label: 'Privacy & security',  sub: 'Password, sessions, data' },
    { Icon: LifeBuoy,      label: 'Help & support' },
  ];

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Profile"
        trailing={<IconBtn><Settings size={18} color={colors.primary} /></IconBtn>}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHead}>
          <Avatar size={84} name={STUDENT.name} variant="lime" />
          <Text style={styles.name}>{STUDENT.name}</Text>
          <Text style={styles.email}>{STUDENT.email}</Text>
          <Eyebrow lime icon={<GraduationCap size={12} color={colors.primary} />}>Student · {STUDENT.joined}</Eyebrow>
        </View>

        <View style={styles.statsRow}>
          <Stat icon="BookOpen" label="Enrolled" value={STUDENT.enrolled} />
          <Stat icon="Clock"    label="Hours"    value={`${STUDENT.hours}h`} />
          <Stat icon="Flame"    label="Streak"   value={`${STUDENT.streak}d`} />
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
  body: { padding: 16, gap: 16, paddingBottom: 100 },
  profileHead: { alignItems: 'center', gap: 6, paddingTop: 8 },
  name: { fontSize: 19, fontWeight: '700', color: colors.primary, marginTop: 6, letterSpacing: -0.3 },
  email: { fontSize: 12, color: colors.bodyGreen },
  statsRow: { flexDirection: 'row', gap: 8 },
  menu: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  menuItemBorder: { borderBottomColor: colors.stroke2, borderBottomWidth: StyleSheet.hairlineWidth },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 14, fontWeight: '700', color: colors.primary },
  menuSub: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },
});
