import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GraduationCap, Shield, ShieldCheck, Globe, Check, ChevronRight } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Eyebrow } from '../../components/Eyebrow';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../store/appStore';
import type { Role } from '../../data/types';

type RoleDef = { id: Role; label: string; sub: string; Icon: any };

const roles: RoleDef[] = [
  { id: 'public',  label: 'Public visitor', sub: 'Splash, onboarding & auth flow',     Icon: Globe },
  { id: 'student', label: 'Student',        sub: 'Discover, learn & track progress',   Icon: GraduationCap },
  { id: 'admin',   label: 'Admin',          sub: 'Approve users, author courses',      Icon: Shield },
  { id: 'super',   label: 'Super Admin',    sub: 'Manage admins, system audit',        Icon: ShieldCheck },
];

export function RoleSelectorScreen() {
  const setRole = useAppStore(s => s.setRole);
  const role = useAppStore(s => s.role);
  return (
    <ScreenContainer dark edges={['top', 'bottom']} contentStyle={styles.body}>
      <View style={styles.header}>
        <Eyebrow lime>Design preview</Eyebrow>
        <Text style={styles.h1}>
          Choose a role to explore.
        </Text>
        <Text style={styles.sub}>
          This screen exists only in the design build. Tap a role to load that role's full experience.
        </Text>
      </View>

      <View style={styles.list}>
        {roles.map(r => {
          const Icon = r.Icon;
          const isActive = r.id === role;
          return (
            <Pressable
              key={r.id}
              onPress={() => setRole(r.id)}
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: isActive ? 'rgba(188,233,85,0.12)' : 'rgba(255,255,255,0.05)',
                  borderColor: isActive ? 'rgba(188,233,85,0.45)' : 'rgba(255,255,255,0.10)',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={[
                styles.iconWrap,
                { backgroundColor: isActive ? colors.accent : 'rgba(255,255,255,0.08)' },
              ]}>
                <Icon size={18} color={isActive ? colors.primary : colors.white} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{r.label}</Text>
                <Text style={styles.itemSub}>{r.sub}</Text>
              </View>
              {isActive ? (
                <Check size={18} color={colors.accent} />
              ) : (
                <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, justifyContent: 'space-between', gap: 24 },
  header: { gap: 10 },
  h1: { fontSize: 26, color: colors.white, fontWeight: '700', letterSpacing: -0.5, marginTop: 8 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 18 },
  list: { gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '700', color: colors.white },
  itemSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
});
