import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { Mood } from '@/lib/types';

// Line icons from design round 01: a 24 × 24 grid, 1.7 stroke and round ends.

export type IconName =
  | 'home'
  | 'cards'
  | 'game'
  | 'compass'
  | 'trophy'
  | 'stickers'
  | 'gift'
  | 'moon'
  | 'spark'
  | 'heart'
  | 'hug'
  | 'flower'
  | 'lock'
  | 'check'
  | 'arrow'
  | 'settings'
  | 'back'
  | `mood-${Mood}`;

const face = (features: string) => (
  <>
    <Circle cx={12} cy={12} r={9} />
    <Path d={features} />
  </>
);

const shapes: Record<IconName, ReactNode> = {
  home: <Path d="m3 11 9-7 9 7v9H15v-6H9v6H3Z" />,
  cards: (
    <>
      <Rect x={4} y={6} width={12} height={15} rx={2.5} />
      <Path d="m10 3 9 1.5a2.5 2.5 0 0 1 2 3l-1.5 10M8 11h4M8 15h3" />
    </>
  ),
  game: (
    <>
      <Path d="M7 7h10c4 0 5 4 4 7l-1 4c-.5 2-2 2-3.5.5L14 16h-4l-2.5 2.5C6 20 4.5 20 4 18l-1-4C2 11 3 7 7 7Z" />
      <Path d="M8 10v4M6 12h4M16 11h.01M18 13h.01" />
    </>
  ),
  compass: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" />
    </>
  ),
  trophy: <Path d="M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v5m-4 3h8m-7-3h6v3H9Z" />,
  stickers: <Path d="M5 3h14a2 2 0 0 1 2 2v9l-7 7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14 21v-5a2 2 0 0 1 2-2h5M8 10c2 3 6 3 8 0M8 7h.01M16 7h.01" />,
  gift: (
    <>
      <Rect x={4} y={11} width={16} height={10} rx={2} />
      <Path d="M3 7h18v4H3ZM12 7v14M12 7C4 7 5 1 9 3c2 1 3 4 3 4Zm0 0c8 0 7-6 3-4-2 1-3 4-3 4Z" />
    </>
  ),
  moon: <Path d="M19.5 15.5A8.5 8.5 0 0 1 8.5 4.5a8.5 8.5 0 1 0 11 11ZM18 3v4M16 5h4" />,
  spark: <Path d="M13 2c1 6-5 7-5 12 0 2 1 3 2 3-1-4 3-4 3-7 2 2 4 4 4 7 4-4 5-9-4-15ZM8 8C1 16 7 23 13 21c3-1 5-2 6-5" />,
  heart: <Path d="M12 21C8 18 2 13 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 5-6 10-10 13Z" />,
  hug: (
    <>
      <Path d="M6 11c-5 1-5 8 0 9l6 1 6-1c5-1 5-8 0-9M5 16l7 2 7-2" />
      <Circle cx={12} cy={7} r={4} />
    </>
  ),
  flower: (
    <>
      <Path d="M12 14v7m0-4c-4 0-5-2-5-2m5 4c4 0 5-3 5-3M12 4c4-5 8 0 5 3 5 1 3 7-1 6-1 4-7 4-8 0-4 1-6-5-1-6-3-3 1-8 5-3Z" />
      <Circle cx={12} cy={9} r={2} />
    </>
  ),
  lock: (
    <>
      <Rect x={5} y={10} width={14} height={11} rx={3} />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </>
  ),
  check: <Path d="m5 12 4 4L19 6" />,
  arrow: <Path d="M5 12h14m-6-6 6 6-6 6" />,
  settings: (
    <>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M10 2h4l1 3 3-1 3 3-1 3 2 1v3l-3 1 1 3-3 3-3-1-1 2h-3l-1-3-3 1-3-3 1-3-2-1v-3l3-1-1-3 3-3 3 1Z" />
    </>
  ),
  back: <Path d="m14 5-7 7 7 7" />,
  'mood-blij': face('m7 10 2-1 2 1m2 0 2-1 2 1m-9 4q4 5 8 0'),
  'mood-ok': face('M8 9h.01M16 9h.01M8 14q4 4 8 0'),
  'mood-druk': face('m7 8 3 3m0-3-3 3m7-3 3 3m0-3-3 3m-5 5q3-2 6 0'),
  'mood-moe': face('M6 10q3 2 5 0m2 0q3 2 5 0M10 16h4'),
  'mood-verdrietig': face('M8 9h.01M16 9h.01M8 17q4-4 8 0'),
};

export function Icon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {shapes[name]}
    </Svg>
  );
}
