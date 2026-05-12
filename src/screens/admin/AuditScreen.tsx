import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Download } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Pill } from '../../components/Pill';
import { AUDIT } from '../../data/mock';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';
import type { AuditTone } from '../../data/types';

type Filter = 'all' | AuditTone;

const filters: { id: Filter; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'success', label: 'Approvals' },
  { id: 'info',    label: 'Changes' },
  { id: 'warning', label: 'Warnings' },
];

const toneBg = (t: AuditTone, colors: Colors) =>
  t === 'success' ? colors.successBg : t === 'warning' ? colors.warningBg : colors.infoBg;
const toneFg = (t: AuditTone, colors: Colors) =>
  t === 'success' ? colors.successDeep : t === 'warning' ? colors.warning : colors.info;

export function AuditScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [filter, setFilter] = useState<Filter>('all');
  const list = filter === 'all' ? AUDIT : AUDIT.filter(a => a.tone === filter);

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Audit log"
        trailing={
          <IconBtn onPress={() => toast.success('Audit log exported.')}>
            <Download size={18} color={colors.primary} />
          </IconBtn>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map(f => {
            const count = f.id === 'all' ? AUDIT.length : AUDIT.filter(a => a.tone === f.id).length;
            return (
              <Pill key={f.id} active={filter === f.id} onPress={() => setFilter(f.id)}>
                {`${f.label} · ${count}`}
              </Pill>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {list.map((l, i, arr) => {
            const Icon = (Icons as any)[l.ico] ?? Icons.Activity;
            return (
              <View key={l.id} style={[styles.item, i < arr.length - 1 && styles.itemBorder]}>
                <View style={[styles.icoWrap, { backgroundColor: toneBg(l.tone, colors) }]}>
                  <Icon size={16} color={toneFg(l.tone, colors)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{l.what}</Text>
                  <Text style={styles.target} numberOfLines={1}>{l.target}</Text>
                  <Text style={styles.foot}>{l.who} · {l.when}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 100 },
  filterRow: { gap: 6, paddingRight: 16 },
  list: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, overflow: 'hidden',
  },
  item: { flexDirection: 'row', gap: 12, padding: 14 },
  itemBorder: { borderBottomColor: colors.stroke2, borderBottomWidth: StyleSheet.hairlineWidth },
  icoWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 13, fontWeight: '700', color: colors.primary },
  target: { fontSize: 12, color: colors.bodyGreen, marginTop: 2 },
  foot: { fontSize: 11, color: colors.muted, marginTop: 4 },
});
