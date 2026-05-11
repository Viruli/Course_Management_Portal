import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface Props {
  children: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
}

export function Badge({ children, tone = 'success', icon }: Props) {
  const palette = (() => {
    switch (tone) {
      case 'success': return { bg: colors.successBg, fg: colors.successDeep };
      case 'warning': return { bg: colors.warningBg, fg: colors.warning };
      case 'error':   return { bg: colors.errorBg, fg: colors.errorDeep };
      case 'info':    return { bg: colors.infoBg, fg: colors.info };
      case 'neutral': return { bg: colors.lightGray, fg: colors.primary };
    }
  })();

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      {icon}
      <Text style={[styles.text, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
