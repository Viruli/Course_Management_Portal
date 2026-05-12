// EduPath design tokens. Two palettes (light/dark) share the same key set
// so any consumer can use the same property name regardless of mode.
//
// Brand colours (`brand`, `accent`, `accentHover`) intentionally stay the
// same in both modes — that's the EduPath identity. Surfaces, text, and
// strokes adapt.

const shared = {
  // Brand — never changes
  brand:       '#152A24',
  brand2:      '#1F3626',
  accent:      '#BCE955',
  accentHover: '#A8D43D',
  black:       '#000000',
  white:       '#FFFFFF',

  // Semantic — same hues in both modes
  success:     '#3DB55F',
  successDeep: '#15803D',
  warning:     '#D97706',
  error:       '#DC2626',
  errorDeep:   '#B91C1C',
  info:        '#0891B2',
  archive:     '#6B7280',

  // Course cover backgrounds
  coverMath:    '#E7DDF7', coverMathIco:    '#5B3FA1',
  coverSci:     '#D8ECE0', coverSciIco:     '#2E7D32',
  coverLit:     '#F7E7D1', coverLitIco:     '#B5651F',
  coverSoc:     '#E5E1D0', coverSocIco:     '#6B6231',
  coverLang:    '#F5D7DA', coverLangIco:    '#B23A48',
  coverCs:      '#D6E3F2', coverCsIco:      '#2F5BAB',
};

const lightAdaptive = {
  // `primary` is the most-used token — historically used for both text
  // and as the brand background. In light mode it equals `brand`.
  primary:   '#152A24',  // same as brand in light
  primary2:  '#1F3626',

  // Body text variants
  bodyGreen: '#41574A',
  muted:     '#A0ACA6',

  // Surfaces
  pageBg:    '#F1EFEA',
  surface:   '#FFFFFF',
  surface2:  '#FAFAFA',
  lightGray: '#EEF1EF',

  // Strokes
  stroke:    '#E5E2DD',
  stroke2:   '#F4F2EC',

  // Semantic backgrounds (lighter tints)
  successBg: '#ECFDF0',
  warningBg: '#FEF3E2',
  errorBg:   '#FEF2F2',
  infoBg:    '#F0FAFF',
  archiveBg: '#F3F4F6',

  // On-dark (kept for components that render on the brand-coloured hero)
  onDarkPrimary:   'rgba(255,255,255,1)',
  onDarkSecondary: 'rgba(255,255,255,0.80)',
  onDarkMuted:     'rgba(255,255,255,0.60)',
  onDarkFaint:     'rgba(255,255,255,0.40)',
  onDarkStroke:    'rgba(255,255,255,0.10)',
  onDarkAccent:    'rgba(188,233,85,0.15)',
};

const darkAdaptive: typeof lightAdaptive = {
  // Flipped — `primary` is now light so text rendered with `colors.primary`
  // shows up correctly on dark surfaces. Heroes that need the brand
  // dark-green background should reference `colors.brand` directly.
  primary:   '#EEF2EE',
  primary2:  '#D7E0DA',

  bodyGreen: '#9BB0A6',
  muted:     '#7C8A84',

  pageBg:    '#0E1614',
  surface:   '#161E1B',
  surface2:  '#111816',
  lightGray: '#1F2825',

  stroke:    '#293330',
  stroke2:   '#1E2723',

  successBg: '#0E2A18',
  warningBg: '#3A2A0D',
  errorBg:   '#3A1212',
  infoBg:    '#0B2530',
  archiveBg: '#222826',

  onDarkPrimary:   'rgba(255,255,255,1)',
  onDarkSecondary: 'rgba(255,255,255,0.80)',
  onDarkMuted:     'rgba(255,255,255,0.60)',
  onDarkFaint:     'rgba(255,255,255,0.40)',
  onDarkStroke:    'rgba(255,255,255,0.10)',
  onDarkAccent:    'rgba(188,233,85,0.15)',
};

export const lightColors = { ...shared, ...lightAdaptive };
export const darkColors  = { ...shared, ...darkAdaptive };

export type ColorScheme = 'light' | 'dark';
export type Colors = typeof lightColors;

// Backwards-compatible default export — modules that import `{ colors }`
// at the top level will get the light palette. Theme-aware components
// should use `useColors()` instead.
export const colors = lightColors;

export function getColors(scheme: ColorScheme): Colors {
  return scheme === 'dark' ? darkColors : lightColors;
}

export const shadows = {
  xs:   { shadowColor: '#152A24', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  sm:   { shadowColor: '#152A24', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  md:   { shadowColor: '#152A24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  lg:   { shadowColor: '#152A24', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 8 },
  card: { shadowColor: '#152A24', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
};

export function coverPalette(kind: string): { bg: string; ico: string } {
  switch (kind) {
    case 'math': return { bg: lightColors.coverMath, ico: lightColors.coverMathIco };
    case 'sci':  return { bg: lightColors.coverSci,  ico: lightColors.coverSciIco };
    case 'lit':  return { bg: lightColors.coverLit,  ico: lightColors.coverLitIco };
    case 'soc':  return { bg: lightColors.coverSoc,  ico: lightColors.coverSocIco };
    case 'lang': return { bg: lightColors.coverLang, ico: lightColors.coverLangIco };
    case 'cs':   return { bg: lightColors.coverCs,   ico: lightColors.coverCsIco };
    default:     return { bg: lightColors.lightGray, ico: lightColors.primary };
  }
}
