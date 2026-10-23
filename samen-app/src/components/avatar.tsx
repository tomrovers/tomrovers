import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { AvatarConfig, Expression } from '@/lib/types';

export const skinTones = ['#FFE3CC', '#F6CBA8', '#E3AC84', '#C08560', '#8E5A3C', '#5F3B27'];
export const hairColors = ['#2B1B14', '#5A3825', '#8B5A2B', '#C98B4B', '#E8C27A', '#B4462F', '#A3A3A8'];
export const outfitColors = ['#6E2D5C', '#E0558A', '#7FB8A4', '#F2B15C', '#6C8BD6', '#3D3D4E'];
export const hairStyles = ['Kort', 'Krullen', 'Lang', 'Knotje', 'Opgeschoren', 'Bob'];
export const facialHairStyles = ['Geen', 'Stoppels', 'Baard'];
export const accessories = ['Geen', 'Bril', 'Oorbellen', 'Bloemetje', 'Pet'];

export const defaultAvatar: AvatarConfig = { skin: 1, hair: 0, hairColor: 1, facialHair: 0, outfit: 0, accessory: 0 };

const INK = '#3D2240';

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + amount))));
  const r = ch(n >> 16);
  const g = ch((n >> 8) & 0xff);
  const b = ch(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function BackHair({ style, color }: { style: number; color: string }) {
  if (style === 1)
    return (
      <G fill={color}>
        {[
          [30, 50, 16], [26, 72, 14], [28, 94, 13], [36, 112, 12], [90, 50, 16], [94, 72, 14], [92, 94, 13], [84, 112, 12],
        ].map(([cx, cy, r]) => <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
      </G>
    );
  if (style === 2) return <Path d="M26 60C24 24 96 24 94 60l4 58c-10 7-20 3-24-5H46c-4 8-14 12-24 5z" fill={color} />;
  if (style === 5) return <Path d="M24 64C22 26 98 26 96 64v32c-6 5-12 3-14-3H38c-2 6-8 8-14 3z" fill={color} />;
  return null;
}

function FrontHair({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 0:
      return <Path d="M28 60c-3-30 15-38 33-37 21 0 35 13 31 39-6-14-16-21-32-21-14 1-24 7-32 19z" fill={color} />;
    case 1:
      return (
        <G fill={color}>
          {[[36, 40, 12], [50, 31, 13], [66, 30, 13], [81, 38, 12], [90, 52, 9], [30, 53, 9]].map(([cx, cy, r]) => (
            <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </G>
      );
    case 2:
      return <Path d="M28 62c2-28 22-36 36-34 20 2 30 16 28 36-8-14-22-20-36-20-10 2-22 8-28 18z" fill={color} />;
    case 3:
      return (
        <G fill={color}>
          <Circle cx={60} cy={20} r={13} />
          <Path d="M29 58c-1-26 14-33 31-33s33 8 31 33c-8-12-18-17-31-17s-23 5-31 17z" />
        </G>
      );
    case 4:
      return <Path d="M30 56c2-20 14-28 30-28s28 8 30 28c-8-8-18-12-30-12s-22 4-30 12z" fill={color} opacity={0.85} />;
    default:
      return <Path d="M30 56c0-22 15-28 30-28s30 6 30 28z" fill={color} />;
  }
}

function Eyes({ expression }: { expression: Expression }) {
  const xs = [47, 73];
  if (expression === 'happy')
    return <G>{xs.map(x => <Path key={x} d={`M${x - 5} 67q5-6 10 0`} stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />)}</G>;
  if (expression === 'sleepy')
    return <G>{xs.map(x => <Path key={x} d={`M${x - 5} 66q5 4 10 0`} stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />)}</G>;
  if (expression === 'love')
    return (
      <G fill="#E0558A">
        {xs.map(x => (
          <Path key={x} d={`M${x} 71c-4-3-7-5-7-8a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1c0 3-3 5-7 8z`} />
        ))}
      </G>
    );
  return (
    <G>
      {xs.map(x => (
        <G key={x}>
          <Ellipse cx={x} cy={66} rx={4.4} ry={5.4} fill={INK} />
          <Circle cx={x + 1.5} cy={64} r={1.5} fill="#fff" />
        </G>
      ))}
    </G>
  );
}

function Mouth({ expression }: { expression: Expression }) {
  if (expression === 'happy' || expression === 'love') return <Path d="M50 80q10 14 20 0z" fill="#8C2F4E" />;
  if (expression === 'sleepy') return <Path d="M55 84q5 2.5 10 0" stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none" />;
  return <Path d="M52 81q8 7 16 0" stroke={INK} strokeWidth={2.8} strokeLinecap="round" fill="none" />;
}

export function Avatar({ config, size = 120, expression = 'neutral' }: { config: AvatarConfig; size?: number; expression?: Expression }) {
  const skin = skinTones[config.skin] ?? skinTones[0];
  const hair = hairColors[config.hairColor] ?? hairColors[0];
  const outfit = outfitColors[config.outfit] ?? outfitColors[0];
  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 120 150">
      <BackHair style={config.hair} color={hair} />
      <Path d="M18 150c0-32 20-44 42-44s42 12 42 44z" fill={outfit} />
      <Path d="M48 106q12 10 24 0" stroke={shade(outfit, -0.25)} strokeWidth={3} fill="none" />
      <Rect x={52} y={90} width={16} height={18} rx={6} fill={shade(skin, -0.08)} />
      <Circle cx={28} cy={68} r={6.5} fill={skin} />
      <Circle cx={92} cy={68} r={6.5} fill={skin} />
      <Ellipse cx={60} cy={63} rx={32} ry={34} fill={skin} />
      <FrontHair style={config.hair} color={hair} />
      <Path d="M41 56q6-4 12 0M67 56q6-4 12 0" stroke={shade(hair, 0.1)} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <Eyes expression={expression} />
      <Ellipse cx={39} cy={78} rx={6} ry={3.8} fill="#F59AB0" opacity={0.5} />
      <Ellipse cx={81} cy={78} rx={6} ry={3.8} fill="#F59AB0" opacity={0.5} />
      {config.facialHair === 1 && <Path d="M36 80c4 18 44 18 48 0 0 22-48 22-48 0z" fill={hair} opacity={0.25} />}
      {config.facialHair === 2 && <Path d="M33 74c2 30 52 30 54 0 4 16-4 30-27 30s-31-14-27-30zm17 7q10 8 20 0" fill={hair} />}
      <Mouth expression={expression} />
      {config.accessory === 1 && (
        <G stroke={INK} strokeWidth={2.4} fill="rgba(255,255,255,0.25)">
          <Circle cx={47} cy={66} r={9} />
          <Circle cx={73} cy={66} r={9} />
          <Path d="M56 66h8" fill="none" />
        </G>
      )}
      {config.accessory === 2 && (
        <G fill="#E9B949">
          <Circle cx={27} cy={77} r={3} />
          <Circle cx={93} cy={77} r={3} />
        </G>
      )}
      {config.accessory === 3 && (
        <G>
          {[0, 72, 144, 216, 288].map(a => (
            <Circle key={a} cx={34 + 6 * Math.cos((a * Math.PI) / 180)} cy={36 + 6 * Math.sin((a * Math.PI) / 180)} r={4.5} fill="#F7A6C0" />
          ))}
          <Circle cx={34} cy={36} r={3} fill="#F2C14E" />
        </G>
      )}
      {config.accessory === 4 && (
        <G>
          <Path d="M27 50c0-22 14-30 33-30s33 8 33 30z" fill={shade(outfit, 0.15)} />
          <Path d="M60 50h40c3 0 3 6 0 6H60z" fill={shade(outfit, -0.2)} />
        </G>
      )}
    </Svg>
  );
}
