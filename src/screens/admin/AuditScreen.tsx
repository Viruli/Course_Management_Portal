import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import {
  Download, CheckCircle, User, Key, BookOpen, Activity,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { DebugPanel } from '../../components/DebugPanel';
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

// Map UI filter → API category param.
// Note: the backend must populate the `category` field on log entries for
// these filters to return results. If category is null on all entries,
// only the "All" tab will show data — this is a backend data issue.
const filterToCategory = (f: FilterId): string | undefined => {
  if (f === 'approvals') return 'enrollment';
  if (f === 'changes')   return 'user';
  if (f === 'warnings')  return 'auth';   // auth failures, token revocations
  return undefined;                        // 'all' → no filter
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

  const [entries,   setEntries]   = useState<ApiAuditEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);
  const [filter,    setFilter]    = useState<FilterId>('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const result = await getAuditLog({ category: filterToCategory(filter) });
        if (!cancelled) setEntries(result.data.items ?? []);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof ApiError
            ? `[${err.code}] ${err.message}${err.status ? ` (HTTP ${err.status})` : ''}`
            : String(err);
          setErrorMsg(msg);
          toast.error('Failed to load audit log — see details below.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filter]);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch up to 100 entries with the active filter for the export.
      const result = await getAuditLog({
        category: filterToCategory(filter),
        limit:    100,
      });
      const items = result.data.items ?? [];

      if (items.length === 0) {
        toast.info('No entries to export.');
        return;
      }

      // Build a CSV string. Wrap every cell in quotes and escape inner quotes.
      const cell = (v: string | null | undefined) =>
        `"${String(v ?? '').replace(/"/g, '""')}"`;

      const header = ['When', 'Actor', 'Action', 'Category', 'Target Type', 'Target ID', 'Request ID']
        .map(cell).join(',');

      const rows = items.map((e) =>
        [
          e.when,
          e.actor?.email ?? 'System',
          e.action,
          e.category,
          e.targetType,
          e.targetId,
          e.requestId,
        ].map(cell).join(','),
      );

      const csv = [header, ...rows].join('\n');

      await Share.share(
        { message: csv, title: 'Audit Log Export' },
        { dialogTitle: 'Export audit log as CSV' },
      );
    } catch (err) {
      if ((err as any)?.message !== 'User did not share') {
        toast.error('Export failed. Please try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Audit log"
        trailing={
          <IconBtn onPress={exporting || loading ? undefined : handleExport}>
            {exporting
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Download size={18} color={loading ? colors.muted : colors.primary} />}
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
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Failed to load audit log</Text>
            <Text style={styles.errorDetail}>{errorMsg}</Text>
          </View>
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

        <DebugPanel tags={['audit.list']} title="Audit log debug" />
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
  errorBox: {
    padding: 16, borderRadius: 14,
    backgroundColor: colors.errorBg,
    borderColor: colors.error, borderWidth: 1,
    gap: 6,
  },
  errorTitle:  { fontSize: 13, fontWeight: '700', color: colors.error },
  errorDetail: { fontSize: 12, color: colors.error, lineHeight: 17, fontFamily: 'monospace' as any },
});
