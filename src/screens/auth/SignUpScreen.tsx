import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { IconBtn } from '../../components/IconBtn';
import { AppBar } from '../../components/AppBar';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import { registerStudent } from '../../services/auth';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import { DebugPanel } from '../../components/DebugPanel';

interface Props {
  onSubmit: (message: string) => void;
  onSwitchToSignIn: () => void;
  onBack: () => void;
}

// Matches the server-side password policy in the API doc:
// min 10 chars + uppercase + lowercase + number + special character.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

export function SignUpScreen({ onSubmit, onSwitchToSignIn, onBack }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [firstName, setFirstName] = useState('Anjali');
  const [lastName, setLastName]   = useState('Silva');
  const [email, setEmail]         = useState('anjali.silva@edupath.lk');
  const [password, setPassword]   = useState('Demo@Pass2026');
  const [confirm, setConfirm]     = useState('Demo@Pass2026');
  const [agreed, setAgreed]       = useState(true);
  const [touched, setTouched]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const passwordMismatch = useMemo(
    () => password.length > 0 && confirm.length > 0 && password !== confirm,
    [password, confirm],
  );

  const passwordValid = PASSWORD_RULE.test(password);

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length  > 0 &&
    email.includes('@') &&
    passwordValid &&
    confirm === password &&
    agreed;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setFieldErrors({});
    try {
      const result = await registerStudent({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      onSubmit(result.data.message);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'VALIDATION_ERROR' && err.details) {
          setFieldErrors(err.details);
          toast.error('Please fix the highlighted fields.');
        } else if (err.code === 'EMAIL_EXISTS') {
          toast.error('This email is already registered.');
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
    <ScreenContainer edges={['top', 'bottom']} scroll contentStyle={styles.scrollContent}>
      <AppBar
        transparent
        leading={<IconBtn onPress={onBack}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
      />
      <View style={styles.body}>
        <Text style={styles.brand}>EduPath</Text>
        <Text style={styles.h1}>
          Create your <Text style={styles.h1Soft}>account.</Text>
        </Text>
        <Text style={styles.sub}>Sign up once — your role is set after admin approval.</Text>

        <View style={styles.fields}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="First name" autoCapitalize="words" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Last name"  value={lastName}  onChangeText={setLastName}  placeholder="Last name"  autoCapitalize="words" />
            </View>
          </View>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {fieldErrors.email ? (
            <View style={styles.errorRow}>
              <AlertCircle size={13} color={colors.error} />
              <Text style={styles.errorText}>{fieldErrors.email[0]}</Text>
            </View>
          ) : null}

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 10 characters"
            password
            hint="At least 10 characters with uppercase, lowercase, a number and a symbol."
          />

          <Input
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repeat your password"
            password
          />

          {passwordMismatch ? (
            <View style={styles.errorRow}>
              <AlertCircle size={13} color={colors.error} />
              <Text style={styles.errorText}>Passwords don't match.</Text>
            </View>
          ) : null}

          {touched && !passwordMismatch && password.length > 0 && !passwordValid ? (
            <View style={styles.errorRow}>
              <AlertCircle size={13} color={colors.error} />
              <Text style={styles.errorText}>
                Password must be 10+ chars with uppercase, lowercase, a number and a symbol.
              </Text>
            </View>
          ) : null}

          {fieldErrors.password ? (
            <View style={styles.errorRow}>
              <AlertCircle size={13} color={colors.error} />
              <Text style={styles.errorText}>{fieldErrors.password[0]}</Text>
            </View>
          ) : null}

          <Pressable onPress={() => setAgreed(!agreed)} style={styles.agreeRow}>
            <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
              {agreed ? <Check size={12} color={colors.white} /> : null}
            </View>
            <Text style={styles.agreeText}>
              I agree to the <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Button
            full
            size="lg"
            disabled={submitting || (touched && !canSubmit)}
            onPress={handleSubmit}
          >
            {submitting ? 'Submitting…' : 'Request account'}
          </Button>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have one? </Text>
            <Pressable onPress={onSwitchToSignIn}>
              <Text style={styles.switchLink}>Sign in</Text>
            </Pressable>
          </View>
          <DebugPanel tags={['auth.register']} title="Sign up debug" />
        </View>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'space-between' },
  brand: { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: -0.4 },
  h1: { fontSize: 26, fontWeight: '700', color: colors.primary, marginTop: 22, letterSpacing: -0.6 },
  h1Soft: { color: colors.bodyGreen, fontWeight: '600' },
  sub: { fontSize: 13, color: colors.bodyGreen, marginTop: 6 },
  fields: { marginTop: 18, gap: 12 },
  row: { flexDirection: 'row', gap: 10 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4 },
  errorText: { fontSize: 12, color: colors.error, fontWeight: '600' },
  agreeRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderColor: colors.stroke, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.brand, borderColor: colors.primary },
  agreeText: { flex: 1, fontSize: 12, color: colors.bodyGreen, lineHeight: 16 },
  link: { color: colors.primary, fontWeight: '700' },
  actions: { gap: 12, paddingTop: 14 },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { fontSize: 13, color: colors.bodyGreen },
  switchLink: { fontSize: 13, color: colors.primary, fontWeight: '700' },
});
