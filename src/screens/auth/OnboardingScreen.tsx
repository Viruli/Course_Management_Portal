import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, GraduationCap, TrendingUp, Video, Sparkle } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Eyebrow } from '../../components/Eyebrow';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onDone: () => void;
}

const slides = [
  { Icon: GraduationCap, tag: 'Structured learning', title: 'Courses built around your goals',
    body: 'Step-by-step semesters with bite-sized video lessons designed for working professionals.' },
  { Icon: Video, tag: 'Watch and learn', title: 'Expert-led video lessons',
    body: 'Pause, rewind, and revisit any lesson. Download worksheets and quizzes to practice offline.' },
  { Icon: TrendingUp, tag: 'Track your progress', title: 'Stay on course every day',
    body: 'Build streaks, watch your completion grow, and pick up where you left off — anywhere.' },
];

export function OnboardingScreen({ onDone }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [step, setStep] = useState(0);
  const s = slides[step];
  const last = step === slides.length - 1;
  const Icon = s.Icon;

  return (
    <ScreenContainer dark edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={onDone}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <View style={styles.hero}>
          <Icon size={84} color={colors.accent} strokeWidth={1.25} />
        </View>
        <Eyebrow dark icon={<Sparkle size={12} color={colors.white} />}>{s.tag}</Eyebrow>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.body}>{s.body}</Text>
      </View>

      <View>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === step ? 22 : 6,
                  backgroundColor: i === step ? colors.accent : 'rgba(255,255,255,0.2)',
                },
              ]}
            />
          ))}
        </View>
        <Button
          full
          size="lg"
          variant="lime"
          onPress={() => (last ? onDone() : setStep(step + 1))}
          rightIcon={last ? undefined : <ArrowRight size={18} color={colors.primary} />}
        >
          {last ? 'Get started' : 'Next'}
        </Button>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  content: { padding: 24, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'flex-end' },
  skip: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '600', padding: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hero: {
    width: 188, height: 188, borderRadius: 32,
    backgroundColor: 'rgba(188,233,85,0.10)',
    borderColor: 'rgba(188,233,85,0.20)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  title: {
    color: colors.white, fontSize: 24, fontWeight: '700',
    textAlign: 'center', letterSpacing: -0.5, lineHeight: 30, marginTop: 10,
  },
  body: {
    color: 'rgba(255,255,255,0.65)', fontSize: 14,
    textAlign: 'center', lineHeight: 20, maxWidth: 300,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { height: 6, borderRadius: 6 },
});
