import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { colors } from '../../theme/colors';
import type { Notification } from '../../data/types';

interface Props {
  items: Notification[];
  onBack: () => void;
  onMarkAll?: () => void;
}

const toneColor = (t: Notification['tone']) => {
  if (t === 'success') return colors.success;
  if (t === 'warning') return colors.warning;
  if (t === 'info') return colors.info;
  return colors.primary;
};

export function NotificationsScreen({ items, onBack, onMarkAll }: Props) {
  return (
    <ScreenContainer edges={['top']} bg={colors.surface}>
      <AppBar
        title="Notifications"
        leading={<IconBtn onPress={onBack}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
        trailing={
          <Pressable onPress={onMarkAll} style={styles.markAll}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map(n => {
          const Icon = (Icons as any)[n.ico] ?? Icons.Bell;
          return (
            <View
              key={n.id}
              style={[
                styles.row,
                {
                  backgroundColor: n.read ? colors.surface : 'rgba(188,233,85,0.06)',
                  borderLeftWidth: n.read ? 0 : 3,
                  borderLeftColor: colors.accent,
                  paddingLeft: n.read ? 16 : 13,
                },
              ]}
            >
              <View style={styles.icoWrap}>
                <Icon size={16} color={toneColor(n.tone)} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>{n.title}</Text>
                  <Text style={styles.when}>{n.when}</Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>{n.body}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  markAll: { paddingHorizontal: 8, paddingVertical: 6 },
  markAllText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomColor: colors.stroke2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  icoWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.primary },
  when: { fontSize: 11, color: colors.muted },
  body: { fontSize: 12, color: colors.bodyGreen, marginTop: 2, lineHeight: 16 },
});
