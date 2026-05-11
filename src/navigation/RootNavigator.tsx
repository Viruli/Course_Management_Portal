import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { AuthFlow } from './AuthFlow';
import { StudentTabs } from './StudentTabs';
import { AdminTabs } from './AdminTabs';
import { SuperAdminTabs } from './SuperAdminTabs';
import { colors } from '../theme/colors';
import { ChevronDown } from 'lucide-react-native';

const navTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.surface,
    card: colors.surface,
    text: colors.primary,
    border: colors.stroke,
    notification: colors.error,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium:  { fontFamily: 'System', fontWeight: '500' as const },
    bold:    { fontFamily: 'System', fontWeight: '700' as const },
    heavy:   { fontFamily: 'System', fontWeight: '800' as const },
  },
};

export function RootNavigator() {
  const role = useAppStore(s => s.role);
  return (
    <NavigationContainer theme={navTheme as any}>
      <View style={{ flex: 1 }}>
        {role === 'public'  && <AuthFlow />}
        {role === 'student' && <StudentTabs />}
        {role === 'admin'   && <AdminTabs />}
        {role === 'super'   && <SuperAdminTabs />}
        <RoleSwitcher />
      </View>
    </NavigationContainer>
  );
}

// Floating dev-only switcher to jump between roles while exploring the design.
function RoleSwitcher() {
  const role = useAppStore(s => s.role);
  const setRole = useAppStore(s => s.setRole);
  const [open, setOpen] = React.useState(false);
  const roles = [
    { id: 'public', label: 'Public' },
    { id: 'student', label: 'Student' },
    { id: 'admin', label: 'Admin' },
    { id: 'super', label: 'Super Admin' },
  ] as const;

  return (
    <SafeAreaView edges={['top']} style={styles.fab} pointerEvents="box-none">
      <View pointerEvents="auto">
        <Pressable
          onPress={() => setOpen(!open)}
          style={styles.handle}
        >
          <Text style={styles.handleText}>
            {roles.find(r => r.id === role)?.label ?? role}
          </Text>
          <ChevronDown size={12} color={colors.primary} />
        </Pressable>
        {open ? (
          <View style={styles.menu}>
            {roles.map(r => (
              <Pressable
                key={r.id}
                style={[styles.menuItem, role === r.id && styles.menuItemActive]}
                onPress={() => {
                  setRole(r.id);
                  setOpen(false);
                }}
              >
                <Text style={styles.menuText}>{r.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: 0, right: 8,
    zIndex: 1000,
  },
  handle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(188,233,85,0.95)',
    marginTop: 4,
  },
  handleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  menu: {
    marginTop: 6,
    backgroundColor: colors.surface,
    borderColor: colors.stroke,
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    minWidth: 140,
  },
  menuItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: colors.lightGray,
  },
  menuText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
