import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LayoutDashboard, ClipboardList, Users as UsersIco, BookOpen, Menu,
} from 'lucide-react-native';
import { SuperDashboardScreen } from '../screens/superadmin/SuperDashboardScreen';
import { SuperQueueScreen } from '../screens/superadmin/SuperQueueScreen';
import { AdminsScreen } from '../screens/superadmin/AdminsScreen';
import { UsersScreen } from '../screens/superadmin/UsersScreen';
import { UserDetailScreen } from '../screens/superadmin/UserDetailScreen';
import { CoursesScreen } from '../screens/admin/CoursesScreen';
import { CourseBuilderScreen } from '../screens/admin/CourseBuilderScreen';
import { LessonEditorScreen } from '../screens/admin/LessonEditorScreen';
import { AuditScreen } from '../screens/admin/AuditScreen';
import { MoreScreen } from '../screens/admin/MoreScreen';
import { NotificationsScreen } from '../screens/student/NotificationsScreen';
import { NOTIFS_ADMIN, SAMPLE_BUILDER_COURSE } from '../data/mock';
import { useCourseBuilderStore } from '../store/courseBuilderStore';
import { colors } from '../theme/colors';
import type { Course } from '../data/types';

type TabId = 'dashboard' | 'approvals' | 'users' | 'courses' | 'more';

const Stack = createNativeStackNavigator();

const tabs: { id: TabId; label: string; Icon: any; badge?: number }[] = [
  { id: 'dashboard', label: 'Home',      Icon: LayoutDashboard },
  { id: 'approvals', label: 'Approvals', Icon: ClipboardList,  badge: 10 },
  { id: 'users',     label: 'Users',     Icon: UsersIco },
  { id: 'courses',   label: 'Courses',   Icon: BookOpen },
  { id: 'more',      label: 'More',      Icon: Menu },
];

function BottomNav({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.navWrap}>
      <View style={styles.nav}>
        {tabs.map(t => {
          const isActive = t.id === active;
          return (
            <Pressable key={t.id} onPress={() => onChange(t.id)} style={styles.item}>
              <View style={[styles.pill, isActive && styles.pillActive]}>
                <t.Icon size={18} color={isActive ? colors.accent : colors.bodyGreen} strokeWidth={isActive ? 2 : 1.75} />
                {t.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function SuperMain({ navigation }: any) {
  const [tab, setTab] = React.useState<TabId>('dashboard');
  const initNew = useCourseBuilderStore((s) => s.initNew);
  const load    = useCourseBuilderStore((s) => s.load);

  const openCreate = () => {
    initNew();
    navigation.navigate('CourseBuilder');
  };
  const openEdit = (_c: Course) => {
    load(SAMPLE_BUILDER_COURSE);
    navigation.navigate('CourseBuilder');
  };
  const goBell  = () => navigation.navigate('Notifications');
  const goAudit = () => navigation.navigate('Audit');
  const goAdmins = () => navigation.navigate('Admins');

  // The dashboard sends both new tab ids ('approvals', 'users', …) and
  // legacy ones ('queue', 'admins', 'audit') from the existing card layout.
  // Translate everything to the current navigator.
  const handleDashboardNav = (id:
    'dashboard' | 'approvals' | 'users' | 'courses' | 'more' | 'audit' | 'admins' | 'queue'
  ) => {
    if (id === 'queue')  return setTab('approvals');
    if (id === 'admins') return goAdmins();
    if (id === 'audit')  return goAudit();
    setTab(id as TabId);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <View style={{ flex: 1 }}>
        {tab === 'dashboard' && <SuperDashboardScreen onTabChange={handleDashboardNav} onBell={goBell} />}
        {tab === 'approvals' && <SuperQueueScreen />}
        {tab === 'users'     && <UsersScreen navigation={navigation} />}
        {tab === 'courses'   && <CoursesScreen onCourse={openEdit} onCreate={openCreate} />}
        {tab === 'more'      && (
          <MoreScreen
            role="super"
            onOpenAudit={goAudit}
            onOpenCourses={() => setTab('courses')}
            onOpenAdmins={goAdmins}
          />
        )}
      </View>
      <BottomNav active={tab} onChange={setTab} />
    </View>
  );
}

export function SuperAdminTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="SuperMain" component={SuperMain} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen as any} />
      <Stack.Screen name="Admins" component={AdminsScreen} />
      <Stack.Screen name="CourseBuilder" component={CourseBuilderScreen as any} />
      <Stack.Screen name="LessonEditor" component={LessonEditorScreen as any} />
      <Stack.Screen name="Audit" component={AuditScreen} />
      <Stack.Screen name="Notifications">
        {({ navigation }) => (
          <NotificationsScreen items={NOTIFS_ADMIN} onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  navWrap: { backgroundColor: colors.surface, borderTopColor: colors.stroke, borderTopWidth: StyleSheet.hairlineWidth },
  nav: { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 6 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 2 },
  pill: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 9999, position: 'relative' },
  pillActive: { backgroundColor: colors.primary },
  label: { fontSize: 10, color: colors.bodyGreen, fontWeight: '600' },
  labelActive: { color: colors.primary },
  badge: {
    position: 'absolute', top: 0, right: 0,
    minWidth: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.error,
    paddingHorizontal: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '700' },
});
