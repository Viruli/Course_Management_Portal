import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';

interface Props extends TextInputProps {
  label?: string;
  hint?: string;
  password?: boolean;
}

export function Input({ label, hint, password, style, ...rest }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [show, setShow] = useState(false);

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.wrap}>
        <TextInput
          {...rest}
          secureTextEntry={password && !show}
          placeholderTextColor={colors.muted}
          style={[styles.input, style]}
        />
        {password ? (
          <Pressable onPress={() => setShow(!show)} style={styles.toggle}>
            {show ? <EyeOff size={18} color={colors.bodyGreen} /> : <Eye size={18} color={colors.bodyGreen} />}
          </Pressable>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: colors.bodyGreen },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.stroke,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  input: { flex: 1, fontSize: 15, color: colors.primary, padding: 0 },
  toggle: { paddingHorizontal: 4, paddingVertical: 4 },
  hint: { fontSize: 11, color: colors.bodyGreen },
});
