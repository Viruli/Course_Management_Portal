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
import { CourseViewScreen } from '../screens/admin/CourseViewScreen';
import { LessonEditorScreen } from '../screens/admin/LessonEditorScreen';
import { MoreScreen } from '../screens/admin/MoreScreen';
import { AuditScreen } from '../screens/admin/AuditScreen';
import { NotificationsScreen } from '../screens/student/NotificationsScreen';
import { EditProfileScreen } from '../screens/shared/EditProfileScreen';
import { SAMPLE_BUILDER_COURSE } from '../data/mock';
import { useCourseBuilderStore } from '../store/courseBuilderStore';
import { useApprovalsStore } from '../store/approvalsStore';
import { useNotificationsStore } from '../store/notificationsStore';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';
import type { Course } from '../data/types';

type TabId = 'dashboard' | 'registrations' | 'enrolments' | 'courses' | 'more';

const Stack = createNativeStackNavigator();

const baseTabs: { id: TabId; label: string; Icon: any }[] = [
  { id: 'dashboard',     label: 'Home',     Icon: LayoutDashboard },
  { id: 'registrations', label: 'Sign-ups', Icon: UserPlus },
  { id: 'enrolments',    label: 'Enrols',   Icon: ClipboardList },
  { id: 'courses',       label: 'Courses',  Icon: BookOpen },
  { id: 'more',          label: 'More',     Icon: Menu },
];

function BottomNav({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const regCount = useApprovalsStore((s) => s.registrations.filter((r) => r.state === 'pending').length);
  const enrCount = useApprovalsStore((s) => s.enrolments.filter((e) => e.state === 'pending').length);
  const badgeFor = (id: TabId) =>
    id === 'registrations' ? regCount :
    id === 'enrolments'    ? enrCount : 0;
  return (
    <SafeAreaView edges={['bottom']} style={styles.navWrap}>
      <View style={styles.nav}>
        {baseTabs.map(t => {
          const isActive = t.id === active;
          const badge = badgeFor(t.id);
          return (
            <Pressable key={t.id} onPress={() => onChange(t.id)} style={styles.item}>
              <View style={[styles.pill, isActive && styles.pillActive]}>
                <t.Icon size={18} color={isActive ? colors.accent : colors.bodyGreen} strokeWidth={isActive ? 2 : 1.75} />
                {badge > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
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
  const colors = useColors();
  const [tab, setTab] = React.useState<TabId>('dashboard');
  const initNew = useCourseBuilderStore((s) => s.initNew);
  const load    = useCourseBuilderStore((s) => s.load);

  const openCreate = () => {
    initNew();
    navigation.navigate('CourseBuilder');
  };
  const openView = (c: Course) => {
    navigation.navigate('CourseView', { course: c });
  };
  const openEdit = (_c: Course) => {
    // Same as CourseView's Edit action — start the builder from the sample
    // course in the design build.
    load(SAMPLE_BUILDER_COURSE);
    navigation.navigate('CourseBuilder');
  };
  const goBell = () => navigation.navigate('Notifications');
  const goAudit = () => navigation.navigate('Audit');
  const goEditProfile = () => navigation.navigate('EditProfile');

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <View style={{ flex: 1 }}>
        {tab === 'dashboard'     && <AdminDashboardScreen onTabChange={setTab} onBell={goBell} onOpenAudit={goAudit} onOpenProfile={goEditProfile} />}
        {tab === 'registrations' && <RegistrationsScreen />}
        {tab === 'enrolments'    && <EnrolmentsScreen />}
        {tab === 'courses'       && <CoursesScreen onCourse={openView} onEditCourse={openEdit} onCreate={openCreate} />}
        {tab === 'more'          && (
          <MoreScreen
            role="admin"
            onOpenAudit={goAudit}
            onOpenCourses={() => setTab('courses')}
            onEditProfile={goEditProfile}
          />
        )}
      </View>
      <BottomNav active={tab} onChange={setTab} />
    </View>
  );
}

export function AdminTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AdminMain" component={AdminMain} />
      <Stack.Screen name="CourseView">
        {({ navigation, route }) => {
          const course = (route.params as any).course as Course;
          return (
            <CourseViewScreen
              course={course}
              onBack={() => navigation.goBack()}
              onEdit={() => {
                useCourseBuilderStore.getState().load(SAMPLE_BUILDER_COURSE);
                navigation.replace('CourseBuilder');
              }}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="CourseBuilder" component={CourseBuilderScreen as any} />
      <Stack.Screen name="LessonEditor" component={LessonEditorScreen as any} />
      <Stack.Screen name="Audit" component={AuditScreen} />
      <Stack.Screen name="Notifications">
        {({ navigation }) => (
          <AdminNotifications onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="EditProfile">
        {({ navigation }) => (
          <EditProfileScreen role="admin" onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  navWrap: { backgroundColor: colors.surface, borderTopColor: colors.stroke, borderTopWidth: StyleSheet.hairlineWidth },
  nav: { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 6 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 2 },
  pill: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 9999, position: 'relative' },
  pillActive: { backgroundColor: colors.brand },
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

function AdminNotifications({ onBack }: { onBack: () => void }) {
  const items = useNotificationsStore((s) => s.byAudience.admin);
  const markRead    = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  return (
    <NotificationsScreen
      items={items}
      onBack={onBack}
      onMarkAll={() => markAllRead('admin')}
      onItemPress={(id) => markRead('admin', id)}
    />
  );
}
