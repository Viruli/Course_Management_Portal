import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { resetPassword } from '../../services/auth';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onBack: () => void;
  initialEmail?: string;
}

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PasswordResetScreen({ onBack, initialEmail = '' }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [email,    setEmail]    = useState(initialEmail);
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [blurred,  setBlurred]  = useState(false);

  const emailValid = EMAIL_RULE.test(email.trim());
  const showEmailError = blurred && email.trim().length > 0 && !emailValid;

  const handleSubmit = async () => {
    if (!emailValid || sending) return;
    setSending(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT')) {
        toast.error("Couldn't reach the server. Check your connection.");
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setSending(false);
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
          Reset your <Text style={styles.h1Soft}>password.</Text>
        </Text>

        {sent ? (
          <View style={styles.confirmation}>
            <CheckCircle size={40} color={colors.success} />
            <Text style={styles.confirmTitle}>Check your email</Text>
            <Text style={styles.confirmBody}>
              If an account exists for {email.trim()}, a reset link has been sent. Check your inbox and spam folder.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sub}>
              Enter the email address you registered with and we'll send you a reset link.
            </Text>
            <View style={styles.fields}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                onBlur={() => setBlurred(true)}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {showEmailError ? (
                <Text style={styles.errorText}>Enter a valid email address.</Text>
              ) : null}
            </View>
          </>
        )}

        <View style={styles.actions}>
          {sent ? (
            <Button full size="lg" variant="secondary" onPress={onBack}>
              Back to sign in
            </Button>
          ) : (
            <Button
              full size="lg"
              disabled={sending || !emailValid}
              onPress={handleSubmit}
            >
              {sending ? 'Sending…' : 'Send reset link'}
            </Button>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body:          { flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'space-between' },
  brand:         { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: -0.4 },
  h1:            { fontSize: 26, fontWeight: '700', color: colors.primary, marginTop: 22, letterSpacing: -0.6 },
  h1Soft:        { color: colors.bodyGreen, fontWeight: '600' },
  sub:           { fontSize: 14, color: colors.bodyGreen, marginTop: 6 },
  fields:        { marginTop: 24, gap: 8 },
  errorText:     { fontSize: 12, color: colors.error, fontWeight: '600', marginTop: -4 },
  confirmation:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 8 },
  confirmTitle:  { fontSize: 20, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  confirmBody:   { fontSize: 14, color: colors.bodyGreen, textAlign: 'center', lineHeight: 22 },
  actions:       { gap: 12, paddingTop: 14 },
});
