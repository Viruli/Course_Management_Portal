import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bug, ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';
import { useDebugStore, type DebugEntry } from '../store/debugStore';

interface Props {
  /** Filter entries by tag(s). If omitted, shows all entries. */
  tags?: string[];
  /** Max entries to render (newest first). Defaults to 5. */
  max?: number;
  /** Card title shown in the header. Defaults to "Debug". */
  title?: string;
  /** Expanded by default. */
  defaultOpen?: boolean;
}

export function DebugPanel({ tags, max = 5, title = 'Debug', defaultOpen = true }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const enabled = useDebugStore((s) => s.enabled);
  const allEntries = useDebugStore((s) => s.entries);
  const clearTag = useDebugStore((s) => s.clearTag);
  const clear = useDebugStore((s) => s.clear);
  const [open, setOpen] = useState(defaultOpen);

  const entries = useMemo(() => {
    const filtered = tags && tags.length
      ? allEntries.filter((e) => tags.includes(e.tag))
      : allEntries;
    return filtered.slice(0, max);
  }, [allEntries, tags, max]);

  if (!enabled || entries.length === 0) return null;

  const handleClear = () => {
    if (tags && tags.length === 1) clearTag(tags[0]);
    else if (tags && tags.length > 1) tags.forEach(clearTag);
    else clear();
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.header}>
        <Bug size={14} color={colors.bodyGreen} />
        <Text style={styles.headerText}>{title} ({entries.length})</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={handleClear} hitSlop={6} style={styles.iconBtn}>
          <Trash2 size={13} color={colors.bodyGreen} />
        </Pressable>
        {open ? (
          <ChevronUp size={14} color={colors.bodyGreen} />
        ) : (
          <ChevronDown size={14} color={colors.bodyGreen} />
        )}
      </Pressable>

      {open
        ? entries.map((e, i) => (
            <View key={e.id} style={[styles.entry, i > 0 && styles.entryDivider]}>
              <EntryHeader entry={e} colors={colors} styles={styles} />
              <Rows entry={e} styles={styles} />
              {e.requestBody !== undefined ? (
                <CodeBlock label="Request body" value={e.requestBody} styles={styles} />
              ) : null}
              {e.responseBody !== undefined ? (
                <CodeBlock
                  label={e.outcome === 'error' ? 'Error body' : 'Response body'}
                  value={e.responseBody}
                  styles={styles}
                />
              ) : null}
              {e.errorMessage ? (
                <View style={styles.errorRow}>
                  <Text style={styles.errorLabel}>Error</Text>
                  <Text style={styles.errorValue} selectable>
                    [{e.errorCode}] {e.errorMessage}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        : null}
    </View>
  );
}

function EntryHeader({
  entry,
  colors,
  styles,
}: {
  entry: DebugEntry;
  colors: Colors;
  styles: ReturnType<typeof createStyles>;
}) {
  const isError = entry.outcome === 'error';
  return (
    <View style={styles.entryHeader}>
      <View
        style={[
          styles.statusPill,
          { backgroundColor: isError ? colors.errorBg : colors.successBg },
        ]}
      >
        <Text style={[styles.statusText, { color: isError ? colors.error : colors.success }]}>
          {entry.status || 'ERR'}
        </Text>
      </View>
      <Text style={styles.tagText} numberOfLines={1}>{entry.tag}</Text>
      <View style={{ flex: 1 }} />
      <Text style={styles.durationText}>{entry.durationMs} ms</Text>
    </View>
  );
}

function Rows({
  entry,
  styles,
}: {
  entry: DebugEntry;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={{ gap: 4, marginTop: 6 }}>
      <Row label="Time" value={entry.timestamp} styles={styles} />
      <Row label="URL" value={`${entry.method} ${entry.url}`} styles={styles} />
      {entry.requestId ? <Row label="Request ID" value={entry.requestId} styles={styles} /> : null}
    </View>
  );
}

function Row({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} selectable>{value}</Text>
    </View>
  );
}

function CodeBlock({
  label,
  value,
  styles,
}: {
  label: string;
  value: unknown;
  styles: ReturnType<typeof createStyles>;
}) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  return (
    <View>
      <Text style={styles.section}>{label}</Text>
      <ScrollView
        horizontal
        style={styles.codeBlock}
        showsHorizontalScrollIndicator={false}
      >
        <Text style={styles.codeText} selectable>{text}</Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface2, borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 12, padding: 12, marginTop: 12, gap: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerText: {
    fontSize: 11, fontWeight: '700', color: colors.bodyGreen,
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  iconBtn: { paddingHorizontal: 4 },
  entry: { gap: 4 },
  entryDivider: { borderTopWidth: 1, borderTopColor: colors.stroke, paddingTop: 10, marginTop: 4 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  tagText: { fontSize: 12, fontWeight: '700', color: colors.primary, flexShrink: 1 },
  durationText: { fontSize: 10, color: colors.bodyGreen },
  row: { flexDirection: 'row', gap: 8 },
  rowLabel: { width: 78, fontSize: 11, color: colors.bodyGreen, fontWeight: '600' },
  rowValue: { flex: 1, fontSize: 11, color: colors.primary },
  section: {
    fontSize: 11, fontWeight: '700', color: colors.bodyGreen,
    marginTop: 8, letterSpacing: 0.4, textTransform: 'uppercase',
  },
  codeBlock: {
    backgroundColor: colors.lightGray, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8, marginTop: 4,
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11, color: colors.primary, lineHeight: 16,
  },
  errorRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  errorLabel: { width: 78, fontSize: 11, color: colors.bodyGreen, fontWeight: '600' },
  errorValue: { flex: 1, fontSize: 11, color: colors.error, fontWeight: '600' },
});
