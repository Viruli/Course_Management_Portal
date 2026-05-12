import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { PendingScreen } from '../screens/auth/PendingScreen';
import { useAppStore } from '../store/appStore';
import { SAMPLE_USERS } from '../data/mock';
import type { AppRole } from '../data/types';

const Stack = createNativeStackNavigator();

// Demo login: look up the email in our sample user list to determine which
// role's app to drop the user into. In production this comes from the auth
// API response after a real password check.
function resolveRole(email: string): AppRole | null {
  const u = SAMPLE_USERS.find(
    (x) => x.email.toLowerCase() === email.trim().toLowerCase(),
  );
  return u?.role ?? null;
}

export function AuthFlow() {
  const setRole = useAppStore((s) => s.setRole);

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Splash">
        {({ navigation }) => (
          <SplashScreen
            onGetStarted={() => navigation.navigate('Onboarding')}
            onSignIn={() => navigation.navigate('SignIn')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Onboarding">
        {({ navigation }) => (
          <OnboardingScreen onDone={() => navigation.navigate('SignUp')} />
        )}
      </Stack.Screen>

      <Stack.Screen name="SignIn">
        {({ navigation }) => (
          <SignInScreen
            onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Splash'))}
            onSwitchToSignUp={() => navigation.navigate('SignUp')}
            onSubmit={(email) => {
              const role = resolveRole(email);
              if (role) {
                // Drop the user into their role's app. RootNavigator switches
                // when the role changes, so we don't navigate manually.
                setRole(role);
              } else {
                // Unknown email — default to student in the design demo.
                setRole('student');
              }
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SignUp">
        {({ navigation }) => (
          <SignUpScreen
            onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Splash'))}
            onSwitchToSignIn={() => navigation.navigate('SignIn')}
            onSubmit={(message) => navigation.navigate('Pending', { message })}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Pending">
        {({ navigation, route }) => {
          const message = (route.params as { message?: string } | undefined)?.message;
          return (
            <PendingScreen
              message={message}
              onSignOut={() => navigation.popToTop()}
            />
          );
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
