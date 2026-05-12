import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Clock, Info, LogOut } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Eyebrow } from '../../components/Eyebrow';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { DebugPanel } from '../../components/DebugPanel';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onSignOut: () => void;
  message?: string;
}

export function PendingScreen({ onSignOut, message }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <ScreenContainer edges={['top', 'bottom']} scroll contentStyle={styles.scrollContent}>
      <AppBar
        transparent
        leading={<Text style={styles.brand}>EduPath</Text>}
        trailing={<IconBtn onPress={() => { toast.info('Signed out.'); onSignOut(); }}><LogOut size={18} color={colors.primary} /></IconBtn>}
      />
      <View style={styles.body}>
        <View style={styles.center}>
          <View style={styles.clockWrap}>
            <Clock size={36} color={colors.warning} strokeWidth={1.5} />
          </View>
          <Eyebrow icon={<Clock size={12} color={colors.bodyGreen} />}>Pending approval</Eyebrow>
          <Text style={styles.title}>Account awaiting admin approval.</Text>
          {message ? (
            <View style={styles.successBanner}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={styles.successText}>{message}</Text>
            </View>
          ) : null}
          <Text style={styles.body2}>
            You'll get an email — and a notification here — once an admin grants your access.
          </Text>
          <View style={styles.note}>
            <Info size={16} color={colors.bodyGreen} />
            <Text style={styles.noteText}>
              Average wait time today is <Text style={{ fontWeight: '700', color: colors.primary }}>under 4 hours</Text>.
            </Text>
          </View>

          <DebugPanel tags={['auth.register']} title="Registration debug" />
        </View>
        <View style={styles.actions}>
          <Button full variant="secondary" onPress={() => { toast.info('Signed out.'); onSignOut(); }} leftIcon={<LogOut size={16} color={colors.primary} />}>Sign out</Button>
        </View>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  brand: { fontSize: 16, fontWeight: '800', color: colors.primary, letterSpacing: -0.3 },
  scrollContent: { flexGrow: 1 },
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'space-between' },
  center: { alignItems: 'center', gap: 14, paddingTop: 40 },
  clockWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.warningBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22, fontWeight: '700', color: colors.primary,
    textAlign: 'center', letterSpacing: -0.4, marginTop: 6,
  },
  body2: {
    fontSize: 14, color: colors.bodyGreen, textAlign: 'center',
    lineHeight: 20, maxWidth: 300,
  },
  note: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.lightGray, padding: 14, borderRadius: 12,
    maxWidth: 320, marginTop: 16,
  },
  noteText: { fontSize: 12, color: colors.bodyGreen, flex: 1 },
  successBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.successBg, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 10, maxWidth: 320, marginTop: 4,
  },
  successText: { fontSize: 13, color: colors.success, flex: 1, lineHeight: 18, fontWeight: '600' },
  actions: { gap: 10, marginTop: 16 },
});
