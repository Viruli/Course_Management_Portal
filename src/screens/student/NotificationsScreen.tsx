import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowLeft, Bell,
  UserCheck, UserX, CheckCircle, XCircle, Clock, BookOpen,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { EmptyState } from '../../components/EmptyState';
import { DebugPanel } from '../../components/DebugPanel';
import { toast } from '../../store/uiStore';
import { ApiNotification, NotificationCategory } from '../../services/notifications';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  items:      ApiNotification[];
  onBack:     () => void;
  onMarkAll?: () => Promise<number>; // returns markedCount
  onItemPress?: (id: string) => void;
}

// Maps API category → icon component
const categoryIcon = (category: NotificationCategory) => {
  switch (category) {
    case 'registration_approved': return UserCheck;
    case 'registration_rejected': return UserX;
    case 'enrollment_approved':   return CheckCircle;
    case 'enrollment_rejected':   return XCircle;
    case 'enrollment_pending':    return Clock;
    case 'course_published':      return BookOpen;
    default:                      return Bell;
  }
};

const categoryColor = (category: NotificationCategory, colors: Colors) => {
  switch (category) {
    case 'registration_approved':
    case 'enrollment_approved':   return colors.success;
    case 'registration_rejected':
    case 'enrollment_rejected':   return colors.error;
    case 'enrollment_pending':    return colors.warning;
    default:                      return colors.info;
  }
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs  = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMins < 1)  return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs  < 24) return `${diffHrs}h ago`;
  if (diffDays < 7)  return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function NotificationsScreen({ items, onBack, onMarkAll, onItemPress }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const unread = items.filter((n) => n.readAt === null).length;

  const handleMarkAll = async () => {
    if (!onMarkAll) return;
    const count = await onMarkAll();
    if (count > 0) toast.success(`Marked ${count} notification${count === 1 ? '' : 's'} as read.`);
    else           toast.info('Nothing to mark.');
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface}>
      <AppBar
        title="Notifications"
        leading={<IconBtn onPress={onBack}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
        trailing={
          <Pressable onPress={handleMarkAll} style={styles.markAll}>
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
          const isUnread = n.readAt === null;
          const Icon     = categoryIcon(n.category);
          const iconColor = categoryColor(n.category, colors);
          return (
            <Pressable
              key={n.id}
              onPress={() => { if (isUnread && onItemPress) onItemPress(n.id); }}
              style={[
                styles.row,
                {
                  backgroundColor: isUnread ? 'rgba(188,233,85,0.06)' : colors.surface,
                  borderLeftWidth: isUnread ? 3 : 0,
                  borderLeftColor: colors.accent,
                  paddingLeft:     isUnread ? 13 : 16,
                },
              ]}
            >
              <View style={styles.icoWrap}>
                <Icon size={16} color={iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text style={styles.when}>{formatDate(n.createdAt)}</Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>{n.body}</Text>
              </View>
              {isUnread ? <View style={styles.unreadDot} /> : null}
            </Pressable>
          );
        })}

        {/* DEBUG — remove before PR */}
        <DebugPanel
          tags={['notifications.list', 'notifications.markRead', 'notifications.markAll']}
          title="Notifications debug"
        />
        {/* END DEBUG */}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  markAll:      { paddingHorizontal: 8, paddingVertical: 6 },
  markAllText:  { fontSize: 13, fontWeight: '700', color: colors.primary },
  row: {
    flexDirection: 'row', gap: 12,
    paddingVertical: 14, paddingRight: 16,
    borderBottomColor: colors.stroke2, borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  icoWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  titleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title:       { flex: 1, fontSize: 14, fontWeight: '600', color: colors.primary },
  titleUnread: { fontWeight: '700' },
  when:        { fontSize: 11, color: colors.muted },
  body:        { fontSize: 12, color: colors.bodyGreen, marginTop: 2, lineHeight: 16 },
  unreadDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
});
