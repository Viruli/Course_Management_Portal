import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  scrollable?: boolean;
}

export function Tabs({ items, active, onChange, scrollable }: Props) {
  const content = items.map(it => {
    const isActive = it.id === active;
    return (
      <Pressable
        key={it.id}
        onPress={() => onChange(it.id)}
        style={[styles.item, isActive && styles.itemActive]}
      >
        <Text style={[styles.label, isActive && styles.labelActive]}>{it.label}</Text>
        {it.count != null && (
          <View style={[styles.count, { backgroundColor: isActive ? colors.accent : 'rgba(21,42,36,0.08)' }]}>
            <Text style={styles.countText}>{it.count}</Text>
          </View>
        )}
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: colors.lightGray, borderRadius: 12 },
  scrollRow: { gap: 8, paddingHorizontal: 4 },
  item: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  itemActive: { backgroundColor: colors.surface },
  label: { fontSize: 13, fontWeight: '600', color: colors.bodyGreen },
  labelActive: { color: colors.primary },
  count: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 9999 },
  countText: { fontSize: 10, fontWeight: '700', color: colors.primary },
});
