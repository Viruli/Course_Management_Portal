import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { PendingScreen } from '../screens/auth/PendingScreen';
import { RoleSelectorScreen } from '../screens/auth/RoleSelectorScreen';

const Stack = createNativeStackNavigator();

export function AuthFlow() {
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
            onBack={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Splash')}
            onSwitchToSignUp={() => navigation.navigate('SignUp')}
            onSubmit={() => navigation.navigate('RoleSelector')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {({ navigation }) => (
          <SignUpScreen
            onBack={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Splash')}
            onSwitchToSignIn={() => navigation.navigate('SignIn')}
            onSubmit={() => navigation.navigate('Pending')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Pending">
        {({ navigation }) => (
          <PendingScreen onSignOut={() => navigation.popToTop()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="RoleSelector" component={RoleSelectorScreen} />
    </Stack.Navigator>
  );
}
