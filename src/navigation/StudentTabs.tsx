import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Home, Compass, GraduationCap, User as UserIco,
} from 'lucide-react-native';
import { StudentHomeScreen } from '../screens/student/StudentHomeScreen';
import { StudentBrowseScreen } from '../screens/student/StudentBrowseScreen';
import { MyLearningScreen } from '../screens/student/MyLearningScreen';
import { ProfileScreen } from '../screens/student/ProfileScreen';
import { CourseDetailScreen } from '../screens/student/CourseDetailScreen';
import { LessonPlayerScreen } from '../screens/student/LessonPlayerScreen';
import { NotificationsScreen } from '../screens/student/NotificationsScreen';
import { EditProfileScreen } from '../screens/shared/EditProfileScreen';
import { useNotificationsStore } from '../store/notificationsStore';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';
import type { Course } from '../data/types';

type TabId = 'home' | 'browse' | 'mine' | 'profile';

const Stack = createNativeStackNavigator();

const tabs: { id: TabId; label: string; Icon: any }[] = [
  { id: 'home',    label: 'Home',        Icon: Home },
  { id: 'browse',  label: 'Browse',      Icon: Compass },
  { id: 'mine',    label: 'My Learning', Icon: GraduationCap },
  { id: 'profile', label: 'Profile',     Icon: UserIco },
];

function BottomNav({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <SafeAreaView edges={['bottom']} style={styles.navWrap}>
      <View style={styles.nav}>
        {tabs.map(t => {
          const isActive = t.id === active;
          return (
            <Pressable key={t.id} onPress={() => onChange(t.id)} style={styles.item}>
              <View style={[styles.pill, isActive && styles.pillActive]}>
                <t.Icon size={20} color={isActive ? colors.accent : colors.bodyGreen} strokeWidth={isActive ? 2 : 1.75} />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function StudentMain({ navigation }: any) {
  const colors = useColors();
  const [tab, setTab] = React.useState<TabId>('home');
  // Accepts either a legacy Course object (from HomeScreen/MyLearning) or a courseId string (from BrowseScreen)
  const goCourse = (c: Course | string) => {
    const courseId = typeof c === 'string' ? c : c.id;
    const course   = typeof c === 'object' ? c : undefined;
    navigation.navigate('CourseDetail', { courseId, course });
  };
  const goBell = () => navigation.navigate('Notifications');
  const goEditProfile = () => navigation.navigate('EditProfile');

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1 }}>
        {tab === 'home'    && <StudentHomeScreen   onContinue={() => navigation.navigate('LessonPlayer')} onCourse={goCourse} onTabChange={setTab} onBell={goBell} />}
        {tab === 'browse'  && <StudentBrowseScreen onCourse={goCourse} />}
        {tab === 'mine'    && <MyLearningScreen    onCourse={goCourse} />}
        {tab === 'profile' && <ProfileScreen       onTabChange={setTab} onBell={goBell} onEditProfile={goEditProfile} />}
      </View>
      <BottomNav active={tab} onChange={setTab} />
    </View>
  );
}

export function StudentTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="StudentMain" component={StudentMain} />
      <Stack.Screen name="CourseDetail">
        {({ navigation, route }) => (
          <CourseDetailScreen
            courseId={(route.params as any).courseId}
            course={(route.params as any).course}
            onBack={() => navigation.goBack()}
            onPlay={() => navigation.navigate('LessonPlayer')}
            onEnrol={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="LessonPlayer">
        {({ navigation }) => (
          <LessonPlayerScreen
            onBack={() => navigation.goBack()}
            onComplete={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Notifications">
        {({ navigation }) => (
          <StudentNotifications onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="EditProfile">
        {({ navigation }) => (
          <EditProfileScreen role="student" onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  navWrap: { backgroundColor: colors.surface, borderTopColor: colors.stroke, borderTopWidth: StyleSheet.hairlineWidth },
  nav: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 2 },
  pill: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 9999 },
  pillActive: { backgroundColor: colors.brand },
  label: { fontSize: 10, color: colors.bodyGreen, fontWeight: '600' },
  labelActive: { color: colors.primary },
});

function StudentNotifications({ onBack }: { onBack: () => void }) {
  const items = useNotificationsStore((s) => s.byAudience.student);
  const markRead    = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  return (
    <NotificationsScreen
      items={items}
      onBack={onBack}
      onMarkAll={() => markAllRead('student')}
      onItemPress={(id) => markRead('student', id)}
    />
  );
}
