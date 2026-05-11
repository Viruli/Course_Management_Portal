import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { GraduationCap } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function SplashScreen({ onGetStarted, onSignIn }: Props) {
  return (
    <ScreenContainer dark edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.halo} pointerEvents="none" />
      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <GraduationCap size={48} color={colors.accent} strokeWidth={1.5} />
        </View>
        <Text style={styles.brand}>EduPath</Text>
        <Text style={styles.tagline}>Learn at your pace. Grow without limits.</Text>
      </View>
      <View style={styles.actions}>
        <Button full size="lg" variant="lime" onPress={onGetStarted}>Get started</Button>
        <Button full size="lg" variant="ghost-on-dark" onPress={onSignIn}>I already have an account</Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 32, justifyContent: 'space-between' },
  halo: {
    position: 'absolute',
    top: -100,
    left: '50%',
    width: 400,
    height: 400,
    borderRadius: 200,
    transform: [{ translateX: -200 }],
    backgroundColor: 'rgba(188,233,85,0.06)',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  logoWrap: {
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: 'rgba(188,233,85,0.10)',
    borderColor: 'rgba(188,233,85,0.30)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  brand: { color: colors.white, fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  tagline: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14, textAlign: 'center', maxWidth: 260, lineHeight: 20,
  },
  actions: { gap: 10 },
});
