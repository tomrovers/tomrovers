import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, night, radius, space } from '@/theme';

import { Icon, type IconName } from './icon';

// Building blocks in the After Dark night look.

export const T = ({ children, style, kind = 'body' }: { children: React.ReactNode; style?: object; kind?: 'h1' | 'h2' | 'body' | 'small' | 'tag' }) => (
  <Text style={[nightStyles[kind], style]}>{children}</Text>
);

export function Chip({ label, on, onPress, a11y }: { label: string; on?: boolean; onPress: () => void; a11y?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} accessibilityState={{ selected: on }} style={[nightStyles.chip, on && nightStyles.chipOn]}>
      <Text style={[nightStyles.chipText, on && nightStyles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

/** Pink button; `ghost` is the outlined one next to it, `selected` marks a chosen outlined option. */
export function Btn({ title, onPress, ghost, selected, disabled, icon }: { title: string; onPress: () => void; ghost?: boolean; selected?: boolean; disabled?: boolean; icon?: IconName }) {
  const color = disabled ? night.muted : ghost ? night.text : night.bg;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, selected }}
      style={({ pressed }) => [nightStyles.btn, ghost && nightStyles.btnGhost, selected && nightStyles.btnSelected, disabled && nightStyles.btnDisabled, pressed && { opacity: 0.8 }]}>
      <View style={nightStyles.row}>
        {icon && <Icon name={icon} color={color} size={18} />}
        <Text style={[nightStyles.btnText, { color }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

/** A small line with a lock: who can see what. */
export function Private({ children }: { children: ReactNode }) {
  return (
    <View style={[nightStyles.row, { alignItems: 'flex-start' }]}>
      <Icon name="lock" color={night.muted} size={15} />
      <T kind="small" style={{ flex: 1 }}>
        {children}
      </T>
    </View>
  );
}

export const nightStyles = StyleSheet.create({
  h1: { fontFamily: fonts.black, fontSize: 30, lineHeight: 36, letterSpacing: -0.5, color: night.text },
  h2: { fontFamily: fonts.black, fontSize: 18, lineHeight: 24, color: night.text },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: night.text },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: night.muted },
  tag: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: night.rose },
  card: { backgroundColor: night.card, borderRadius: radius.lg, padding: 18, gap: space.sm, borderWidth: 1, borderColor: night.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  btn: { minHeight: 48, borderRadius: radius.sm, backgroundColor: night.rose, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg, paddingVertical: 10, borderWidth: 1, borderColor: night.rose },
  btnGhost: { backgroundColor: 'transparent', borderColor: night.control, minHeight: 44 },
  btnSelected: { backgroundColor: night.cardHi, borderColor: night.rose },
  btnDisabled: { backgroundColor: night.cardHi, borderColor: night.line },
  btnText: { fontFamily: fonts.bold, fontSize: 15, color: night.bg, textAlign: 'center' },
  chip: { minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 15, borderWidth: 1, borderColor: night.control, backgroundColor: 'transparent' },
  chipOn: { backgroundColor: night.rose, borderColor: night.rose },
  chipText: { fontFamily: fonts.regular, fontSize: 14, color: night.muted },
  chipTextOn: { fontFamily: fonts.bold, color: night.bg },
});
