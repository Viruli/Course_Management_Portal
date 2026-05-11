import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LayoutDashboard, UserPlus, ClipboardList, BookOpen, Menu,
} from 'lucide-react-native';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { RegistrationsScreen } from '../screens/admin/RegistrationsScreen';
import { EnrolmentsScreen } from '../screens/admin/EnrolmentsScreen';
import { CoursesScreen } from '../screens/admin/CoursesScreen';
import { CourseBuilderScreen } from '../screens/admin/CourseBuilderScreen';
import { LessonEditorScreen } from '../screens/admin/LessonEditorScreen';
import { MoreScreen } from '../screens/admin/MoreScreen';
import { AuditScreen } from '../screens/admin/AuditScreen';
import { NotificationsScreen } from '../screens/student/NotificationsScreen';
import { NOTIFS_ADMIN, SAMPLE_BUILDER_COURSE } from '../data/mock';
import { useCourseBuilderStore } from '../store/courseBuilderStore';
import { colors } from '../theme/colors';
import type { Course } from '../data/types';

type TabId = 'dashboard' | 'registrations' | 'enrolments' | 'courses' | 'more';

const Stack = createNativeStackNavigator();

const tabs: { id: TabId; label: string; Icon: any; badge?: number }[] = [
  { id: 'dashboard',     label: 'Home',     Icon: LayoutDashboard },
  { id: 'registrations', label: 'Sign-ups', Icon: UserPlus,        badge: 6 },
  { id: 'enrolments',    label: 'Enrols',   Icon: ClipboardList,   badge: 4 },
  { id: 'courses',       label: 'Courses',  Icon: BookOpen },
  { id: 'more',          label: 'More',     Icon: Menu },
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

function AdminMain({ navigation }: any) {
  const [tab, setTab] = React.useState<TabId>('dashboard');
  const initNew = useCourseBuilderStore((s) => s.initNew);
  const load    = useCourseBuilderStore((s) => s.load);

  const openCreate = () => {
    initNew();
    navigation.navigate('CourseBuilder');
  };
  const openEdit = (_c: Course) => {
    // For the design build we always start from the sample course.
    load(SAMPLE_BUILDER_COURSE);
    navigation.navigate('CourseBuilder');
  };
  const goBell = () => navigation.navigate('Notifications');
  const goAudit = () => navigation.navigate('Audit');

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <View style={{ flex: 1 }}>
        {tab === 'dashboard'     && <AdminDashboardScreen onTabChange={setTab} onBell={goBell} />}
        {tab === 'registrations' && <RegistrationsScreen />}
        {tab === 'enrolments'    && <EnrolmentsScreen />}
        {tab === 'courses'       && <CoursesScreen onCourse={openEdit} onCreate={openCreate} />}
        {tab === 'more'          && <MoreScreen role="admin" onOpenAudit={goAudit} onOpenCourses={() => setTab('courses')} />}
      </View>
      <BottomNav active={tab} onChange={setTab} />
    </View>
  );
}

export function AdminTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AdminMain" component={AdminMain} />
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
