import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { IconBtn } from '../../components/IconBtn';
import { AppBar } from '../../components/AppBar';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onSubmit: (email: string) => void;
  onSwitchToSignUp: () => void;
  onBack: () => void;
}

export function SignInScreen({ onSubmit, onSwitchToSignUp, onBack }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState('anjali.silva@edupath.lk');
  const [password, setPassword] = useState('demo-password');

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
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            password
          />
          <View style={styles.row}>
            <View />
            <Pressable
              onPress={() => {
                if (!email.trim()) {
                  toast.error('Enter your email first.');
                } else {
                  toast.success(`Password reset link sent to ${email}.`);
                }
              }}
            >
              <Text style={styles.forgot}>Forgot?</Text>
            </Pressable>
          </View>

          <View style={styles.demoHint}>
            <Text style={styles.demoHintTitle}>Demo accounts</Text>
            <Text style={styles.demoHintRow}><Text style={styles.demoHintBold}>Student</Text>      · anjali.silva@edupath.lk</Text>
            <Text style={styles.demoHintRow}><Text style={styles.demoHintBold}>Admin</Text>          · sahan.w@edupath.lk</Text>
            <Text style={styles.demoHintRow}><Text style={styles.demoHintBold}>Super Admin</Text>  · dilani.r@edupath.lk</Text>
            <Text style={styles.demoHintFoot}>Any password works in the design build.</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button full size="lg" onPress={() => onSubmit(email)}>Sign in</Button>
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
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'space-between' },
  brand: { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: -0.4 },
  h1: { fontSize: 28, fontWeight: '700', color: colors.primary, marginTop: 32, letterSpacing: -0.6 },
  h1Soft: { color: colors.bodyGreen, fontWeight: '600' },
  sub: { fontSize: 14, color: colors.bodyGreen, marginTop: 6 },
  fields: { marginTop: 28, gap: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgot: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  demoHint: {
    marginTop: 8,
    padding: 12, borderRadius: 12,
    backgroundColor: colors.lightGray,
    gap: 2,
  },
  demoHintTitle: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.4, marginBottom: 4 },
  demoHintRow:   { fontSize: 12, color: colors.bodyGreen },
  demoHintBold:  { fontWeight: '700', color: colors.primary },
  demoHintFoot:  { fontSize: 11, color: colors.muted, marginTop: 4 },
  actions: { gap: 14, paddingTop: 24 },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { fontSize: 13, color: colors.bodyGreen },
  switchLink: { fontSize: 13, color: colors.primary, fontWeight: '700' },
});
