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

import { Icon, type IconName } from './icon';

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
  fontFamily: fonts.black,
  fontSize: 11,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: colors.plum,
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
  icon,
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Shown after the title, for example an arrow. */
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = disabled || loading;
  const textColor = disabled ? colors.disabledText : variant === 'primary' ? colors.white : colors.plum;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive }}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        disabled && variant !== 'ghost' && styles.buttonDisabled,
        disabled && variant === 'ghost' && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.buttonInner}>
          <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
          {icon && <Icon name={icon} color={textColor} size={18} />}
        </View>
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
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

/** A small line with a lock: who can see what. */
export function PrivacyNote({ children, color = colors.muted }: { children: ReactNode; color?: string }) {
  return (
    <View style={styles.privacy}>
      <Icon name="lock" color={color} size={15} />
      <Text style={[styles.privacyText, { color }]}>{children}</Text>
    </View>
  );
}

export function Chips({ children }: { children: ReactNode }) {
  return <View style={styles.chips}>{children}</View>;
}

export function Progress({ value, color = colors.plum }: { value: number; color?: string }) {
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
  card: { borderRadius: radius.lg, padding: 18, gap: space.sm },
  cardOutline: { borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  button: { minHeight: 48, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg, paddingVertical: 10, borderWidth: 1, borderColor: 'transparent' },
  buttonPrimary: { backgroundColor: colors.plum },
  buttonSecondary: { backgroundColor: 'transparent', borderColor: colors.control },
  buttonGhost: { backgroundColor: 'transparent', minHeight: 44 },
  buttonDisabled: { backgroundColor: colors.disabledBg, borderColor: '#D6C7D1' },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  buttonText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { minHeight: 44, justifyContent: 'center', backgroundColor: colors.white, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.control },
  chipSelected: { backgroundColor: colors.lav, borderColor: colors.plum, borderWidth: 2, paddingVertical: 8, paddingHorizontal: 14 },
  chipText: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink },
  chipTextSelected: { fontFamily: fonts.bold, color: colors.plum },
  privacy: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  privacyText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(110,45,92,0.12)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  field: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.control,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  fieldMulti: { minHeight: 110, textAlignVertical: 'top' },
});
