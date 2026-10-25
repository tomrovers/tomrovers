// Visual language of Samen, taken from the conceptbook: warm cream, plum ink and soft pastel cards.
export const colors = {
  cream: '#FFF8F5',
  white: '#FFFFFF',
  ink: '#3D2240',
  plum: '#6E2D5C',
  text: '#5C4A5F',
  muted: '#8A7A8D',
  rose: '#E0558A',
  roseDark: '#C93F74',
  pink: '#FBE4E8',
  lav: '#EFE5F8',
  mint: '#E6F3EE',
  peach: '#FFF0DC',
  blue: '#E5EAFB',
  line: '#ECD9DF',
  success: '#3E9B76',
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
export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;

/** After Dark has its own night look, so it never feels like part of the everyday screens. */
export const night = {
  bg: '#24142B',
  card: '#33203B',
  cardHi: '#43294D',
  line: '#4E3459',
  text: '#F7E9F0',
  muted: '#C7AFC9',
  rose: '#FF7AA8',
  gold: '#F2C14E',
} as const;
