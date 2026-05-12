import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react-native';
import { useUiStore, Toast, ToastKind } from '../store/uiStore';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';

const buildPalette = (colors: Colors): Record<ToastKind, { bg: string; fg: string; Icon: any }> => ({
  success: { bg: colors.brand,  fg: colors.white, Icon: CheckCircle2 },
  info:    { bg: colors.brand,  fg: colors.white, Icon: Info },
  error:   { bg: colors.errorDeep, fg: colors.white, Icon: AlertCircle },
});

export function ToastHost() {
  const styles = useThemedStyles(createStyles);
  const toasts = useUiStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.host}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </SafeAreaView>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const palette = buildPalette(colors);
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,   { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    return () => {
      Animated.parallel([
        Animated.timing(opacity,   { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(translate, { toValue: -12, duration: 160, useNativeDriver: true }),
      ]).start();
    };
  }, [opacity, translate]);

  const { Icon, bg, fg } = palette[toast.kind];

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.toast,
        { backgroundColor: bg, opacity, transform: [{ translateY: translate }] },
      ]}
    >
      <Icon size={16} color={toast.kind === 'success' ? colors.accent : fg} />
      <Text style={[styles.text, { color: fg }]} numberOfLines={3}>{toast.message}</Text>
    </Animated.View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 9999,
  },
  toast: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  text: { flex: 1, fontSize: 13, fontWeight: '600' },
});
