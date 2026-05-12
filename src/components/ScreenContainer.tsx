import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../theme/useThemedStyles';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  dark?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  bg?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenContainer({
  children, scroll, dark, edges = ['top'], bg, style, contentStyle,
}: Props) {
  const colors = useColors();
  const background = bg ?? (dark ? colors.brand : colors.surface);

  const inner = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[{ flexGrow: 1 }, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: background }, style]}>
      {inner}
    </SafeAreaView>
  );
}
