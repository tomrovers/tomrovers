import { Pressable, StyleSheet, Text } from 'react-native';

import { fonts, night, radius, space } from '@/theme';

// Building blocks in the After Dark night look.

export const T = ({ children, style, kind = 'body' }: { children: React.ReactNode; style?: object; kind?: 'h1' | 'h2' | 'body' | 'small' | 'tag' }) => (
  <Text style={[nightStyles[kind], style]}>{children}</Text>
);

export function Chip({ label, on, onPress, a11y }: { label: string; on?: boolean; onPress: () => void; a11y?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} accessibilityState={{ selected: on }} style={[nightStyles.chip, on && nightStyles.chipOn]}>
      <Text style={[nightStyles.chipText, on && { color: night.bg }]}>{label}</Text>
    </Pressable>
  );
}

export function Btn({ title, onPress, ghost, disabled }: { title: string; onPress: () => void; ghost?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [nightStyles.btn, ghost && nightStyles.btnGhost, (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 }]}>
      <Text style={[nightStyles.btnText, ghost && { color: night.text }]}>{title}</Text>
    </Pressable>
  );
}

export const nightStyles = StyleSheet.create({
  h1: { fontFamily: fonts.black, fontSize: 28, lineHeight: 34, color: night.text },
  h2: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: night.text },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: night.text },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: night.muted },
  tag: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: night.rose },
  card: { backgroundColor: night.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm, borderWidth: 1, borderColor: night.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  btn: { minHeight: 50, borderRadius: radius.pill, backgroundColor: night.rose, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: night.line },
  btnText: { fontFamily: fonts.bold, fontSize: 15, color: night.bg },
  chip: { borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: night.line, backgroundColor: night.card },
  chipOn: { backgroundColor: night.rose, borderColor: night.rose },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: night.text },
});
