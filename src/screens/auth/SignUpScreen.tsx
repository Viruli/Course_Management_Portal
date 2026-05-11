import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { IconBtn } from '../../components/IconBtn';
import { AppBar } from '../../components/AppBar';
import { colors } from '../../theme/colors';

interface Props {
  onSubmit: () => void;
  onSwitchToSignIn: () => void;
  onBack: () => void;
}

export function SignUpScreen({ onSubmit, onSwitchToSignIn, onBack }: Props) {
  const [name, setName] = useState('Anjali Silva');
  const [email, setEmail] = useState('anjali.silva@edupath.lk');
  const [password, setPassword] = useState('demo-password');
  const [agreed, setAgreed] = useState(true);

  return (
    <ScreenContainer edges={['top', 'bottom']} contentStyle={{ flex: 1 }}>
      <AppBar
        transparent
        leading={<IconBtn onPress={onBack}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
      />
      <View style={styles.body}>
        <Text style={styles.brand}>EduPath</Text>
        <Text style={styles.h1}>
          Start your <Text style={styles.h1Soft}>journey.</Text>
        </Text>
        <Text style={styles.sub}>Create an account to enrol in courses.</Text>

        <View style={styles.fields}>
          <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            password
            hint="Use 8+ characters with a number and a symbol."
          />
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
          <Button full size="lg" onPress={onSubmit} disabled={!agreed}>Create account</Button>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have one? </Text>
            <Pressable onPress={onSwitchToSignIn}>
              <Text style={styles.switchLink}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'space-between' },
  brand: { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: -0.4 },
  h1: { fontSize: 28, fontWeight: '700', color: colors.primary, marginTop: 28, letterSpacing: -0.6 },
  h1Soft: { color: colors.bodyGreen, fontWeight: '600' },
  sub: { fontSize: 14, color: colors.bodyGreen, marginTop: 6 },
  fields: { marginTop: 24, gap: 14 },
  agreeRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderColor: colors.stroke, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  agreeText: { flex: 1, fontSize: 12, color: colors.bodyGreen, lineHeight: 16 },
  link: { color: colors.primary, fontWeight: '700' },
  actions: { gap: 14, paddingTop: 18 },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { fontSize: 13, color: colors.bodyGreen },
  switchLink: { fontSize: 13, color: colors.primary, fontWeight: '700' },
});
