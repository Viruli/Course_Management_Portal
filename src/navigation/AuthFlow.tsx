import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { PendingScreen } from '../screens/auth/PendingScreen';

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
            onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Splash'))}
            onSwitchToSignUp={() => navigation.navigate('SignUp')}
            // SignInScreen calls setRole internally; RootNavigator switches automatically.
            onSubmit={() => {}}
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
