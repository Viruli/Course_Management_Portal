import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ChevronRight, Shield, BookOpen, History, Users, Megaphone, Settings, LifeBuoy,
  LogOut, ShieldCheck, Pencil,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Eyebrow } from '../../components/Eyebrow';
import { useProfileStore, fullName } from '../../store/profileStore';
import { toast } from '../../store/uiStore';
import { performLogout } from '../../services/auth';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { Role } from '../../data/types';

interface Props {
  role: Role;
  onOpenAudit: () => void;
  onOpenCourses: () => void;
  onOpenAdmins?: () => void;
  onEditProfile: () => void;
}

export function MoreScreen({ role, onOpenAudit, onOpenCourses, onOpenAdmins, onEditProfile }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const isSuper = role === 'super';
  const profile = useProfileStore((s) => isSuper ? s.profiles.super : s.profiles.admin);
  const [signingOut, setSigningOut] = useState(false);

  const baseItems = [
    { Icon: BookOpen,  label: 'Courses',       sub: '18 published · 3 drafts',     onPress: onOpenCourses },
    { Icon: History,   label: 'Audit log',     sub: 'Recent platform activity',    onPress: onOpenAudit },
    { Icon: Users,     label: 'Students',      sub: '1,284 active',                onPress: () => toast.info('Student directory coming soon.') },
    { Icon: Megaphone, label: 'Announcements', sub: 'Send platform updates',       onPress: () => toast.info('Announcements composer coming soon.') },
    { Icon: Settings,  label: 'Settings',      sub: 'Account, security, prefs',    onPress: onEditProfile },
    { Icon: LifeBuoy,  label: 'Help & support', sub: 'Contact us, FAQ',            onPress: () => toast.info('Support reachable at help@edupath.lk.') },
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

  const items = isSuper
    ? [{ Icon: ShieldCheck, label: 'Administrators', sub: '5 admins · 2 pending', onPress: onOpenAdmins }, ...baseItems]
    : baseItems;

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar title="More" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.userCard} onPress={onEditProfile}>
          <View style={styles.avatarWrap}>
            <Avatar size={56} name={fullName(profile)} variant="lime" photoUri={profile.photoUri} />
            <View style={styles.editBadge}>
              <Pencil size={11} color={colors.primary} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{fullName(profile)}</Text>
            <Text style={styles.userEmail}>{profile.email}</Text>
            <View style={{ marginTop: 6 }}>
              <Eyebrow lime icon={<Shield size={11} color={colors.primary} />}>{profile.title ?? (isSuper ? 'Super Admin' : 'Admin')}</Eyebrow>
            </View>
          </View>
          <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>

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
  body: { padding: 16, gap: 14, paddingBottom: 100 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 16,
    backgroundColor: colors.brand,
  },
  avatarWrap: { position: 'relative' },
  editBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderColor: colors.primary, borderWidth: 2,
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
