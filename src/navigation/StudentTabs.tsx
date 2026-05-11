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
import { NOTIFS_STUDENT } from '../data/mock';
import { colors } from '../theme/colors';
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
  const [tab, setTab] = React.useState<TabId>('home');
  const goCourse = (c: Course) => navigation.navigate('CourseDetail', { course: c });
  const goBell = () => navigation.navigate('Notifications');

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1 }}>
        {tab === 'home'    && <StudentHomeScreen   onContinue={() => navigation.navigate('LessonPlayer')} onCourse={goCourse} onTabChange={setTab} onBell={goBell} />}
        {tab === 'browse'  && <StudentBrowseScreen onCourse={goCourse} />}
        {tab === 'mine'    && <MyLearningScreen    onCourse={goCourse} />}
        {tab === 'profile' && <ProfileScreen       onTabChange={setTab} onBell={goBell} />}
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
          <NotificationsScreen
            items={NOTIFS_STUDENT}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  navWrap: { backgroundColor: colors.surface, borderTopColor: colors.stroke, borderTopWidth: StyleSheet.hairlineWidth },
  nav: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 2 },
  pill: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 9999 },
  pillActive: { backgroundColor: colors.primary },
  label: { fontSize: 10, color: colors.bodyGreen, fontWeight: '600' },
  labelActive: { color: colors.primary },
});
