import { View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import type { AvatarConfig, Expression } from '@/lib/types';

import { Avatar, outfitColors } from '../avatar';

/** Size of a standing figure in scene units; its feet are at the bottom centre. */
export const FIGURE_W = 52;
export const FIGURE_H = FIGURE_W * 1.25 + 26;

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + amount))));
  return `#${((ch(n >> 16) << 16) | (ch((n >> 8) & 0xff) << 8) | ch(n & 0xff)).toString(16).padStart(6, '0')}`;
}

/**
 * A LoveGotchi from head to toe. `step` alternates the legs while walking;
 * `seated` hides the legs, so the figure sinks into a sofa or bed.
 */
export function Figure({ config, expression, step = 0, seated = false }: { config: AvatarConfig; expression: Expression; step?: number; seated?: boolean }) {
  const outfit = outfitColors[config.outfit] ?? outfitColors[0];
  const pants = shade(outfit, -0.45);
  const swing = step % 2 === 0 ? 3 : -3;
  return (
    <View style={{ width: FIGURE_W, height: FIGURE_H, alignItems: 'center' }} pointerEvents="none">
      {!seated && (
        <Svg width={FIGURE_W} height={30} viewBox="0 0 46 30" style={{ position: 'absolute', bottom: 0 }}>
          <Ellipse cx={23} cy={26} rx={15} ry={4} fill="#3D2240" opacity={0.18} />
          <Rect x={14} y={Math.max(0, swing)} width={7} height={20 - Math.max(0, swing)} rx={3} fill={pants} />
          <Rect x={25} y={Math.max(0, -swing)} width={7} height={20 - Math.max(0, -swing)} rx={3} fill={pants} />
          <Path d="M12 20h10v4h-10z" fill="#3D2240" />
          <Path d="M24 20h10v4h-10z" fill="#3D2240" />
        </Svg>
      )}
      <View style={{ position: 'absolute', top: 0 }}>
        <Avatar config={config} size={FIGURE_W} expression={expression} />
      </View>
    </View>
  );
}
