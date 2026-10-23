import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, fonts, radius, space, tones, type CardTone } from '@/theme';

export function Screen({
  children,
  scroll = true,
  scrollEnabled = true,
  edges = ['top'],
}: {
  children: ReactNode;
  scroll?: boolean;
  /** Turn off while the user drags something inside the screen. */
  scrollEnabled?: boolean;
  edges?: Edge[];
}) {
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" scrollEnabled={scrollEnabled}>
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.scroll, styles.inner, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const textStyle = (base: object) =>
  function StyledText({ style, ...props }: TextProps) {
    return <Text {...props} style={[base, style]} />;
  };

export const H1 = textStyle({ fontFamily: fonts.black, fontSize: 28, lineHeight: 34, color: colors.ink });
export const H2 = textStyle({ fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: colors.ink });
export const Body = textStyle({ fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text });
export const Strong = textStyle({ fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.ink });
export const Small = textStyle({ fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted });
export const Eyebrow = textStyle({
  fontFamily: fonts.bold,
  fontSize: 11,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: colors.rose,
});

export function Card({
  tone = 'white',
  children,
  style,
  onPress,
}: {
  tone?: CardTone;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const base = [styles.card, { backgroundColor: tones[tone] }, tone === 'white' && styles.cardOutline, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && styles.pressed]} accessibilityRole="button">
      {children}
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        inactive && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.plum} />
      ) : (
        <Text style={[styles.buttonText, variant !== 'primary' && { color: colors.plum }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

export function Chips({ children }: { children: ReactNode }) {
  return <View style={styles.chips}>{children}</View>;
}

export function Progress({ value, color = colors.rose }: { value: number; color?: string }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.field, props.multiline && styles.fieldMulti, props.style]} />;
}

export function Gap({ size = space.md }: { size?: number }) {
  return <View style={{ height: size }} />;
}

export function Row({ children, gap = space.sm, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: space.xl - 4, paddingBottom: space.xxl * 2 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: space.md },
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  cardOutline: { borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  button: { minHeight: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  buttonPrimary: { backgroundColor: colors.plum },
  buttonSecondary: { backgroundColor: colors.pink },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonText: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { backgroundColor: colors.white, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line },
  chipSelected: { backgroundColor: colors.plum, borderColor: colors.plum },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.plum },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(110,45,92,0.1)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  field: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  fieldMulti: { minHeight: 110, textAlignVertical: 'top' },
});
