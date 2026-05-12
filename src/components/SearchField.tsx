import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dark?: boolean;
}

export function SearchField({ value, onChange, placeholder = 'Search', dark }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: dark ? 'rgba(255,255,255,0.08)' : colors.lightGray,
          borderColor: dark ? 'rgba(255,255,255,0.10)' : colors.stroke,
        },
      ]}
    >
      <Search size={16} color={dark ? colors.onDarkMuted : colors.bodyGreen} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={dark ? colors.onDarkMuted : colors.bodyGreen}
        style={[styles.input, { color: dark ? colors.white : colors.primary }]}
      />
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
});
