import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Layers } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { SearchField } from '../../components/SearchField';
import { EmptyState } from '../../components/EmptyState';
import { listCourses, ApiCourse } from '../../services/courses';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { shadows } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  onCourse: (courseId: string) => void;
}

export function StudentBrowseScreen({ onCourse }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await listCourses({ limit: 20 });
        if (!cancelled) setCourses(result.data.items);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
            toast.error("Couldn't reach the server. Check your connection.");
          } else {
            toast.error('Failed to load courses.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = courses.filter(c =>
    !q || c.title.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Browse Courses"
        trailing={
          <IconBtn onPress={() => toast.info('Advanced filters coming soon.')}>
            {/* filter icon placeholder */}
            <Layers size={18} color={colors.primary} />
          </IconBtn>
        }
      />
      <View style={styles.filterBar}>
        <SearchField value={q} onChange={setQ} placeholder="Search courses…" />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="SearchX"
            title="No courses found"
            body={q ? 'Try a different search term.' : 'No published courses yet.'}
          />
        ) : (
          <>
            <Text style={styles.count}>{filtered.length} course{filtered.length === 1 ? '' : 's'}</Text>
            <View style={styles.grid}>
              {filtered.map(c => (
                <Pressable
                  key={c.id}
                  style={({ pressed }) => [styles.card, { opacity: pressed ? 0.88 : 1 }]}
                  onPress={() => onCourse(c.id)}
                >
                  {c.coverImageUrl ? (
                    <Image source={{ uri: c.coverImageUrl }} style={styles.cover} resizeMode="cover" />
                  ) : (
                    <View style={[styles.cover, styles.coverFallback]}>
                      <Layers size={28} color={colors.accent} />
                    </View>
                  )}
                  <View style={styles.cardBody}>
                    <Text numberOfLines={2} style={styles.cardTitle}>{c.title}</Text>
                    <Text numberOfLines={2} style={styles.cardDesc}>{c.description}</Text>
                    <View style={styles.cardMeta}>
                      <Layers size={11} color={colors.bodyGreen} />
                      <Text style={styles.metaText}>{c.semesterCount} semester{c.semesterCount === 1 ? '' : 's'}</Text>
                      {c.createdByName ? (
                        <>
                          <View style={styles.dot} />
                          <Text style={styles.metaText} numberOfLines={1}>{c.createdByName}</Text>
                        </>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  filterBar:   { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  body:        { padding: 16, gap: 14, paddingBottom: 100 },
  count:       { fontSize: 13, color: colors.bodyGreen, fontWeight: '600', marginBottom: 2 },
  grid:        { gap: 14 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1,
    borderRadius: 16, overflow: 'hidden',
    ...shadows.xs,
  },
  cover:         { width: '100%', height: 130, backgroundColor: colors.lightGray },
  coverFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand },
  cardBody:      { padding: 12, gap: 6 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: colors.primary, letterSpacing: -0.2 },
  cardDesc:      { fontSize: 12, color: colors.bodyGreen, lineHeight: 17 },
  cardMeta:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText:      { fontSize: 11, fontWeight: '500', color: colors.bodyGreen, flexShrink: 1 },
  dot:           { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted, marginHorizontal: 2 },
});
