import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Download, CheckCircle, User, Key, BookOpen, Activity, ShieldAlert,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { getAuditLog, ApiAuditEntry } from '../../services/auditLog';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

type FilterId = 'all' | 'approvals' | 'changes' | 'warnings';

const filters: { id: FilterId; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'changes',   label: 'Changes' },
  { id: 'warnings',  label: 'Warnings' },
];

// Map UI filter → API category param
const filterToCategory = (f: FilterId): string | undefined => {
  if (f === 'approvals') return 'enrollment';
  if (f === 'changes')   return 'user';
  return undefined; // 'all' and 'warnings' → no filter
};

// Map category → icon + colour
function categoryIcon(category: string | null) {
  switch (category) {
    case 'enrollment': return { Icon: CheckCircle, bg: 'successBg' as const,  fg: 'successDeep' as const };
    case 'user':       return { Icon: User,         bg: 'infoBg'    as const,  fg: 'info'        as const };
    case 'auth':       return { Icon: Key,          bg: 'warningBg' as const,  fg: 'warning'     as const };
    case 'course':     return { Icon: BookOpen,     bg: 'infoBg'    as const,  fg: 'info'        as const };
    default:           return { Icon: Activity,     bg: 'lightGray' as const,  fg: 'bodyGreen'   as const };
  }
}

function formatWhen(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  const diffMs   = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMins < 1)  return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs  < 24) return `${diffHrs}h ago`;
  if (diffDays < 7)  return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function AuditScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [entries,  setEntries]  = useState<ApiAuditEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<FilterId>('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await getAuditLog({ category: filterToCategory(filter) });
        if (!cancelled) setEntries(result.data.items);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT')) {
            toast.error("Couldn't reach the server. Check your connection.");
          } else {
            toast.error('Failed to load audit log.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filter]);

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Audit log"
        trailing={
          <IconBtn onPress={() => toast.info('Audit log export coming soon.')}>
            <Download size={18} color={colors.primary} />
          </IconBtn>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((f) => (
            <Pill key={f.id} active={filter === f.id} onPress={() => setFilter(f.id)}>
              {f.label}
            </Pill>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : entries.length === 0 ? (
          <EmptyState icon="Activity" title="No log entries" body="Platform events will appear here." />
        ) : (
          <View style={styles.list}>
            {entries.map((entry, i, arr) => {
              const { Icon, bg, fg } = categoryIcon(entry.category);
              const actor = entry.actor?.email ?? 'System';
              return (
                <View key={entry.id} style={[styles.item, i < arr.length - 1 && styles.itemBorder]}>
                  <View style={[styles.icoWrap, { backgroundColor: (colors as any)[bg] }]}>
                    <Icon size={16} color={(colors as any)[fg]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{entry.action}</Text>
                    <Text style={styles.target} numberOfLines={1}>
                      {entry.targetType}{entry.targetId ? ` · ${entry.targetId}` : ''}
                    </Text>
                    <Text style={styles.foot}>{actor} · {formatWhen(entry.when)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body:       { padding: 16, gap: 14, paddingBottom: 100 },
  filterRow:  { gap: 6, paddingRight: 16 },
  list: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, overflow: 'hidden',
  },
  item:       { flexDirection: 'row', gap: 12, padding: 14 },
  itemBorder: { borderBottomColor: colors.stroke2, borderBottomWidth: StyleSheet.hairlineWidth },
  icoWrap:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title:      { fontSize: 13, fontWeight: '700', color: colors.primary },
  target:     { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  foot:       { fontSize: 11, color: colors.muted, marginTop: 2 },
});
