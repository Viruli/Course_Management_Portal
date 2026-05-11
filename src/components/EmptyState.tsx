import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Icons from 'lucide-react-native';
import { colors } from '../theme/colors';

interface Props {
  icon?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'Inbox', title, body, action }: Props) {
  const IconCmp = (Icons as any)[icon] ?? Icons.Inbox;
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <IconCmp size={28} color={colors.bodyGreen} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {action ? <View style={{ marginTop: 12 }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 10,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.primary, marginTop: 4 },
  body: { fontSize: 13, color: colors.bodyGreen, textAlign: 'center', lineHeight: 18, maxWidth: 260 },
});
