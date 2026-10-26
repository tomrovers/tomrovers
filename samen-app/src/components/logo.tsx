import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { colors, fonts } from '@/theme';

// The Claddagh mark from design round 01: two hands holding a heart, with a crown.
// Still a draft; the shapes come from design/van-chatgpt/2026-10-26-ontwerprichting-v1/.

const crown = 'M78 65 74 43 89 52 100 33 111 52 126 43 122 65Z';
const heart = 'M100 128C91 120 69 105 69 89C69 73 89 67 100 83C111 67 131 73 131 89C131 105 109 120 100 128Z';
const hand = 'M20 111 34 101C39 98 45 100 49 105L53 88C54 82 62 81 65 87L70 109C72 115 77 118 83 117L88 116C94 115 97 121 93 126C86 136 77 142 67 141C56 140 46 133 38 125L24 118Z';
const thumbs = 'M53 116Q67 131 81 128M147 116Q133 131 119 128';

/** `light` is for dark backgrounds: cream hands on plum or night. */
export function Logo({ size = 40, light }: { size?: number; light?: boolean }) {
  const hands = light ? colors.cream : colors.plum;
  const lines = light ? colors.plum : colors.cream;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityLabel="Claddagh: twee handen dragen een hart met een kroon">
      <G transform="translate(0 12)">
        <Path d={crown} fill="#F2C14E" />
        <Path d={heart} fill={colors.rose} />
        <Path d={hand} fill={hands} />
        <Path d={hand} fill={hands} transform="translate(200 0) scale(-1 1)" />
        <Path d={thumbs} fill="none" stroke={lines} strokeWidth={2.5} strokeLinecap="round" />
      </G>
    </Svg>
  );
}

/** The mark with the name next to it, or under it when `stacked`. */
export function Brand({ size = 32, stacked, light }: { size?: number; stacked?: boolean; light?: boolean }) {
  const fontSize = stacked ? size * 0.3 : size * 0.7;
  return (
    <View style={[styles.brand, stacked && styles.stacked]} accessible accessibilityRole="header" accessibilityLabel="Claddagh">
      <Logo size={size} light={light} />
      <Text style={[styles.name, { fontSize, lineHeight: fontSize * 1.15, letterSpacing: -fontSize * 0.04, color: light ? colors.cream : colors.ink }]}>claddagh</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stacked: { flexDirection: 'column', gap: 0 },
  name: { fontFamily: fonts.black },
});
