// Uses system fonts (no custom font loading) so it works in Expo Go without setup.
// Replace with Figtree/Inter via expo-font when ready.

export const typography = {
  h1:        { fontWeight: '700' as const, fontSize: 28, lineHeight: 32, letterSpacing: -0.6 },
  h2:        { fontWeight: '700' as const, fontSize: 24, lineHeight: 28, letterSpacing: -0.5 },
  h3:        { fontWeight: '700' as const, fontSize: 20, lineHeight: 24, letterSpacing: -0.3 },
  h4:        { fontWeight: '600' as const, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  h5:        { fontWeight: '600' as const, fontSize: 15, lineHeight: 20 },

  bodyLg:    { fontWeight: '400' as const, fontSize: 16, lineHeight: 22 },
  body:      { fontWeight: '400' as const, fontSize: 14, lineHeight: 20 },
  bodySm:    { fontWeight: '400' as const, fontSize: 13, lineHeight: 18 },
  caption:   { fontWeight: '500' as const, fontSize: 12, lineHeight: 16 },
  micro:     { fontWeight: '600' as const, fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },

  mono:      { fontFamily: 'Menlo' as const },
};
