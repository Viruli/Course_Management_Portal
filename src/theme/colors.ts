// EduPath design tokens — mirrors src/CMP/src/tokens.css

export const colors = {
  // Brand
  primary:       '#152A24',
  primary2:      '#1F3626',
  accent:        '#BCE955',
  accentHover:   '#A8D43D',
  bodyGreen:     '#41574A',

  // Neutrals
  black:         '#000000',
  white:         '#FFFFFF',
  pageBg:        '#F1EFEA',
  surface:       '#FFFFFF',
  surface2:      '#FAFAFA',
  stroke:        '#E5E2DD',
  stroke2:       '#F4F2EC',
  lightGray:     '#EEF1EF',
  muted:         '#A0ACA6',

  // Semantic
  success:       '#3DB55F',
  successDeep:   '#15803D',
  successBg:     '#ECFDF0',
  warning:       '#D97706',
  warningBg:     '#FEF3E2',
  error:         '#DC2626',
  errorDeep:     '#B91C1C',
  errorBg:       '#FEF2F2',
  info:          '#0891B2',
  infoBg:        '#F0FAFF',
  archive:       '#6B7280',
  archiveBg:     '#F3F4F6',

  // Course cover gradients (background + icon)
  coverMath:    '#E7DDF7', coverMathIco:    '#5B3FA1',
  coverSci:     '#D8ECE0', coverSciIco:     '#2E7D32',
  coverLit:     '#F7E7D1', coverLitIco:     '#B5651F',
  coverSoc:     '#E5E1D0', coverSocIco:     '#6B6231',
  coverLang:    '#F5D7DA', coverLangIco:    '#B23A48',
  coverCs:      '#D6E3F2', coverCsIco:      '#2F5BAB',

  // On-dark
  onDarkPrimary:   'rgba(255,255,255,1)',
  onDarkSecondary: 'rgba(255,255,255,0.80)',
  onDarkMuted:     'rgba(255,255,255,0.60)',
  onDarkFaint:     'rgba(255,255,255,0.40)',
  onDarkStroke:    'rgba(255,255,255,0.10)',
  onDarkAccent:    'rgba(188,233,85,0.15)',
};

export const shadows = {
  xs:   { shadowColor: '#152A24', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  sm:   { shadowColor: '#152A24', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  md:   { shadowColor: '#152A24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  lg:   { shadowColor: '#152A24', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 8 },
  card: { shadowColor: '#152A24', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
};

// Helper: pick cover colors for a given course "kind"
export function coverPalette(kind: string): { bg: string; ico: string } {
  switch (kind) {
    case 'math': return { bg: colors.coverMath, ico: colors.coverMathIco };
    case 'sci':  return { bg: colors.coverSci,  ico: colors.coverSciIco };
    case 'lit':  return { bg: colors.coverLit,  ico: colors.coverLitIco };
    case 'soc':  return { bg: colors.coverSoc,  ico: colors.coverSocIco };
    case 'lang': return { bg: colors.coverLang, ico: colors.coverLangIco };
    case 'cs':   return { bg: colors.coverCs,   ico: colors.coverCsIco };
    default:     return { bg: colors.lightGray, ico: colors.primary };
  }
}
