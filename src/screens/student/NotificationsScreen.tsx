import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { EmptyState } from '../../components/EmptyState';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { Notification } from '../../data/types';

interface Props {
  items: Notification[];
  onBack: () => void;
  onMarkAll?: () => number; // returns count marked
  onItemPress?: (id: string) => void;
}

const toneColor = (t: Notification['tone'], colors: Colors) => {
  if (t === 'success') return colors.success;
  if (t === 'warning') return colors.warning;
  if (t === 'info')    return colors.info;
  return colors.primary;
};

export function NotificationsScreen({ items, onBack, onMarkAll, onItemPress }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const unread = items.filter((n) => !n.read).length;

  return (
    <ScreenContainer edges={['top']} bg={colors.surface}>
      <AppBar
        title="Notifications"
        leading={<IconBtn onPress={onBack}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
        trailing={
          <Pressable
            onPress={() => {
              if (!onMarkAll) return;
              const n = onMarkAll();
              if (n > 0) toast.success(`Marked ${n} notification${n === 1 ? '' : 's'} as read.`);
              else       toast.info('Nothing to mark.');
            }}
            style={styles.markAll}
          >
            <Text style={[styles.markAllText, unread === 0 && { color: colors.muted }]}>
              Mark all read
            </Text>
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <EmptyState icon="Bell" title="No notifications" body="You're all caught up." />
        ) : items.map((n) => {
          const Icon = (Icons as any)[n.ico] ?? Icons.Bell;
          return (
            <Pressable
              key={n.id}
              onPress={() => {
                if (!n.read && onItemPress) onItemPress(n.id);
              }}
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
                <Icon size={16} color={toneColor(n.tone, colors)} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>{n.title}</Text>
                  <Text style={styles.when}>{n.when}</Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>{n.body}</Text>
              </View>
              {!n.read ? <View style={styles.unreadDot} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  markAll: { paddingHorizontal: 8, paddingVertical: 6 },
  markAllText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomColor: colors.stroke2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
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
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.error,
  },
});
