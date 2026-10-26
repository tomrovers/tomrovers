// Visual language of Samen, taken from the conceptbook and refined in design round 01 ("Dicht bij elkaar"):
// warm cream, plum ink and soft pastel cards. Decorative colours are kept apart from the darker ones
// used for small text, so text stays readable on every pastel.
export const colors = {
  cream: '#FFF8F5',
  white: '#FFFFFF',
  ink: '#3D2240',
  plum: '#6E2D5C',
  text: '#5C4A5F',
  muted: '#746177',
  /** Decorative pink: dots, bars and fills, not for small text. */
  rose: '#E0558A',
  /** Pink for text. */
  roseText: '#A82C5C',
  pink: '#FBE4E8',
  lav: '#EFE5F8',
  mint: '#E6F3EE',
  peach: '#FFF0DC',
  blue: '#E5EAFB',
  /** Divider and card outline. */
  line: '#ECD9DF',
  /** Outline of things you tap: options, fields and secondary buttons. */
  control: '#9C879F',
  success: '#2E7659',
  disabledBg: '#E6DCE3',
  disabledText: '#66516B',
} as const;

export type CardTone = 'pink' | 'lav' | 'mint' | 'peach' | 'blue' | 'white';

export const tones: Record<CardTone, string> = {
  pink: colors.pink,
  lav: colors.lav,
  mint: colors.mint,
  peach: colors.peach,
  blue: colors.blue,
  white: colors.white,
};

export const fonts = {
  regular: 'Lato',
  bold: 'Lato-Bold',
  black: 'Lato-Black',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
/** sm: buttons and options, md: tiles, lg: cards. */
export const radius = { sm: 12, md: 14, lg: 18, pill: 999 } as const;

/** After Dark has its own night look, so it never feels like part of the everyday screens. */
export const night = {
  bg: '#24142B',
  card: '#33203B',
  cardHi: '#43294D',
  line: '#4E3459',
  control: '#94739E',
  text: '#F7E9F0',
  muted: '#C7AFC9',
  rose: '#FF7AA8',
  gold: '#F2C14E',
} as const;
