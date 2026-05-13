import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { IconBtn } from '../../components/IconBtn';
import { AppBar } from '../../components/AppBar';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import { loginUser, trackLoginFailure } from '../../services/auth';
import { ApiError } from '../../services/api';
import { useAppStore } from '../../store/appStore';
import { useProfileStore } from '../../store/profileStore';
import { toast } from '../../store/uiStore';

interface Props {
  onSubmit: () => void;
  onSwitchToSignUp: () => void;
  onBack: () => void;
}

// Maps Firebase Auth error codes to user-facing messages.
function firebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found for this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/user-disabled':
      return 'Your account is pending approval or has been suspended.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/network-request-failed':
      return "Couldn't reach the server. Check your connection.";
    default:
      return 'Sign in failed. Please try again.';
  }
}

export function SignInScreen({ onSubmit, onSwitchToSignUp, onBack }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const setRole    = useAppStore((s) => s.setRole);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [locked, setLocked]       = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting || locked) return;

    setSubmitting(true);
    setAuthError(null);

    try {
      const { role, profile } = await loginUser(email.trim(), password);
      setProfile(profile);
      setRole(role);
      onSubmit();
    } catch (err) {
      const errCode = (err as { code?: string }).code;

      // Account not approved — loginUser already signed out of Firebase.
      if (errCode === 'ACCOUNT_NOT_APPROVED') {
        setAuthError((err as Error).message);
        return;
      }

      // Firebase auth errors (bad credentials, user-disabled, etc.)
      if (errCode?.startsWith('auth/')) {
        const { locked: isLocked } = await trackLoginFailure(email.trim());
        if (isLocked) {
          setLocked(true);
          setAuthError('Account locked. Try again in 15 minutes.');
        } else {
          setAuthError(firebaseErrorMessage(errCode));
        }
      } else if (err instanceof ApiError) {
        // GET /me failed after Firebase sign-in (loginUser cleans up Firebase session).
        if (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT') {
          toast.error("Couldn't reach the server. Check your connection.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} contentStyle={{ flex: 1 }}>
      <AppBar
        transparent
        leading={<IconBtn onPress={onBack}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
      />
      <View style={styles.body}>
        <Text style={styles.brand}>EduPath</Text>
        <Text style={styles.h1}>
          Welcome <Text style={styles.h1Soft}>back.</Text>
        </Text>
        <Text style={styles.sub}>Sign in to continue your learning.</Text>

        <View style={styles.fields}>
          <Input
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); setAuthError(null); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); setAuthError(null); }}
            placeholder="Your password"
            password
          />

          {authError ? (
            <View style={styles.errorRow}>
              <AlertCircle size={13} color={colors.error} />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <View />
            <Pressable onPress={() => toast.info('Password reset — coming soon.')}>
              <Text style={styles.forgot}>Forgot?</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            full
            size="lg"
            disabled={submitting || locked || !canSubmit}
            onPress={handleSubmit}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>New to EduPath? </Text>
            <Pressable onPress={onSwitchToSignUp}>
              <Text style={styles.switchLink}>Create account</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body:       { flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'space-between' },
  brand:      { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: -0.4 },
  h1:         { fontSize: 28, fontWeight: '700', color: colors.primary, marginTop: 32, letterSpacing: -0.6 },
  h1Soft:     { color: colors.bodyGreen, fontWeight: '600' },
  sub:        { fontSize: 14, color: colors.bodyGreen, marginTop: 6 },
  fields:     { marginTop: 28, gap: 14 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgot:     { fontSize: 13, color: colors.primary, fontWeight: '700' },
  errorRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -6 },
  errorText:  { flex: 1, fontSize: 12, color: colors.error, fontWeight: '600' },
  actions:    { gap: 14, paddingTop: 24 },
  switchRow:  { flexDirection: 'row', justifyContent: 'center' },
  switchText: { fontSize: 13, color: colors.bodyGreen },
  switchLink: { fontSize: 13, color: colors.primary, fontWeight: '700' },
});
