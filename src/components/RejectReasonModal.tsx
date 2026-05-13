import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';

interface Props {
  visible:   boolean;
  title?:    string;
  onConfirm: (reason?: string) => void;
  onCancel:  () => void;
}

const MAX_CHARS = 500;

export function RejectReasonModal({ visible, title = 'Reject', onConfirm, onCancel }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    const trimmed = reason.trim();
    onConfirm(trimmed || undefined);
    setReason('');
  };

  const handleSkip = () => {
    onConfirm(undefined);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Optionally provide a reason. The student will be notified.
            </Text>

            <TextInput
              style={styles.input}
              value={reason}
              onChangeText={setReason}
              placeholder="Optional reason for the student…"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={MAX_CHARS}
              autoFocus
            />
            <Text style={styles.counter}>{reason.length} / {MAX_CHARS}</Text>

            <View style={styles.buttons}>
              <Pressable style={[styles.btn, styles.skipBtn]} onPress={handleSkip}>
                <Text style={[styles.btnText, { color: colors.bodyGreen }]}>Skip reason</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.rejectBtn]} onPress={handleConfirm}>
                <Text style={[styles.btnText, { color: colors.white }]}>Reject</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 12,
  },
  title:    { fontSize: 17, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: 13, color: colors.bodyGreen },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: colors.primary,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  counter:  { fontSize: 11, color: colors.muted, textAlign: 'right' },
  buttons:  { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  skipBtn:   { backgroundColor: colors.lightGray },
  rejectBtn: { backgroundColor: colors.error },
  btnText:   { fontSize: 15, fontWeight: '700' },
});
