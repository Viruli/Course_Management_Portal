import { useMemo } from 'react';
import { getColors, Colors } from './colors';
import { useResolvedScheme } from '../store/themeStore';

/**
 * Returns the active colour palette based on the current theme store.
 * Use inside components for inline colour references.
 */
export function useColors(): Colors {
  const scheme = useResolvedScheme();
  return getColors(scheme);
}

/**
 * Wraps a `(colors) => StyleSheet.create({...})` creator function and
 * memoises the returned styles per-palette. Use inside components so
 * styles automatically re-create when the theme switches.
 *
 * Usage:
 *   const createStyles = (c: Colors) => StyleSheet.create({
 *     wrap: { backgroundColor: c.surface, padding: 16 },
 *   });
 *   function MyScreen() {
 *     const colors = useColors();
 *     const styles = useThemedStyles(createStyles);
 *     return <View style={styles.wrap}>…</View>;
 *   }
 */
export function useThemedStyles<T>(creator: (c: Colors) => T): T {
  const colors = useColors();
  return useMemo(() => creator(colors), [colors]);
}
