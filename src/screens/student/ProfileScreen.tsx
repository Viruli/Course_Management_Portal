import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Pencil, GraduationCap, Award, Bell, Shield,
  LifeBuoy, ChevronRight, LogOut,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Eyebrow } from '../../components/Eyebrow';
import { Stat } from '../../components/Stat';
import { useProfileStore, fullName } from '../../store/profileStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import { toast } from '../../store/uiStore';
import { performLogout } from '../../services/auth';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onTabChange: (tab: 'home' | 'browse' | 'mine' | 'profile') => void;
  onBell: () => void;
  onEditProfile: () => void;
}

export function ProfileScreen({ onTabChange, onBell, onEditProfile }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const profile    = useProfileStore((s) => s.profiles.student);
  // apiProfile not yet used in display on this branch (wired in feat/profile-mgmt-password-reset-admin)
  const unread = useNotificationsStore((s) => s.byAudience.student.filter((n) => !n.read).length);
  const [signingOut, setSigningOut] = useState(false);

  const items = [
    { Icon: GraduationCap, label: 'My Learning',         sub: `${profile.enrolled ?? 0} courses · ${profile.hours ?? 0}h watched`, onPress: () => onTabChange('mine') },
    { Icon: Award,         label: 'Certificates',        sub: 'View completion certificates',                                       onPress: () => toast.info('Certificates coming soon.') },
    { Icon: Bell,          label: 'Notifications',       sub: unread > 0 ? `${unread} unread` : 'You\'re caught up',                onPress: onBell },
    { Icon: Shield,        label: 'Privacy & security',  sub: 'Password, sessions, data',                                            onPress: onEditProfile },
    { Icon: LifeBuoy,      label: 'Help & support',      sub: 'Contact us, FAQ',                                                     onPress: () => toast.info('Support reachable at help@edupath.lk.') },
  ];

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await performLogout();
    } catch {
      toast.error('Sign out failed. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Profile"
        trailing={
          <IconBtn onPress={onEditProfile}>
            <Pencil size={16} color={colors.primary} />
          </IconBtn>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHead}>
          <View style={styles.avatarWrap}>
            <Avatar size={84} name={fullName(profile)} variant="lime" photoUri={profile.photoUri} />
            <Pressable onPress={onEditProfile} style={styles.editBadge}>
              <Pencil size={12} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={styles.name}>{fullName(profile)}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          <Eyebrow lime icon={<GraduationCap size={12} color={colors.primary} />}>
            Student · {profile.joined}
          </Eyebrow>
        </View>

        <View style={styles.statsRow}>
          <Stat icon="BookOpen" label="Enrolled" value={profile.enrolled ?? 0} />
          <Stat icon="Clock"    label="Hours"    value={`${profile.hours ?? 0}h`} />
          <Stat icon="Flame"    label="Streak"   value={`${profile.streak ?? 0}d`} />
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

        <Button variant="secondary" full size="lg" leftIcon={<LogOut size={16} color={colors.primary} />} onPress={handleSignOut} disabled={signingOut}>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>

      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 16, paddingBottom: 100 },
  profileHead: { alignItems: 'center', gap: 6, paddingTop: 8 },
  avatarWrap: { position: 'relative' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderColor: colors.surface2, borderWidth: 3,
  },
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
