import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { kindById } from '@/lib/house/catalog';
import { pts, shade, TH, TW, ZH } from '@/lib/house/iso';

// Every floor sprite is drawn for its unrotated footprint (w x d tiles) in a local frame;
// a rotated item is the same drawing mirrored. "Clay" look: soft rounded edges (a stroke in
// the face's own color), a light top, darker sides and a soft shadow on the floor.

type P = {
  w: number;
  d: number;
  head: number; // room above the floor, in height units
  at: (u: number, v: number, z?: number) => [number, number];
};

function frame(w: number, d: number, head: number): P {
  return { w, d, head, at: (u, v, z = 0) => [((u - v) * TW) / 2 + (d * TW) / 2, ((u + v) * TH) / 2 + head * ZH - z * ZH] };
}

function box(p: P, u: number, v: number, z: number, w: number, d: number, h: number, color: string, round = 3): ReactNode {
  const top = shade(color, 0.22);
  const left = color;
  const right = shade(color, -0.14);
  const face = (c: string, list: [number, number][]) => (
    <Polygon points={pts(list)} fill={c} stroke={c} strokeWidth={round} strokeLinejoin="round" />
  );
  return (
    <G>
      {face(left, [p.at(u, v + d, z + h), p.at(u + w, v + d, z + h), p.at(u + w, v + d, z), p.at(u, v + d, z)])}
      {face(right, [p.at(u + w, v, z + h), p.at(u + w, v + d, z + h), p.at(u + w, v + d, z), p.at(u + w, v, z)])}
      {face(top, [p.at(u, v, z + h), p.at(u + w, v, z + h), p.at(u + w, v + d, z + h), p.at(u, v + d, z + h)])}
    </G>
  );
}

/** A flat shape on the face that looks to the lower left (plane v = const). */
function onFront(p: P, v: number, u0: number, u1: number, z0: number, z1: number, color: string, round = 2): ReactNode {
  return (
    <Polygon points={pts([p.at(u0, v, z1), p.at(u1, v, z1), p.at(u1, v, z0), p.at(u0, v, z0)])} fill={color} stroke={color} strokeWidth={round} strokeLinejoin="round" />
  );
}

function ellipse(p: P, u: number, v: number, z: number, r: number, color: string, opacity = 1): ReactNode {
  const [x, y] = p.at(u, v, z);
  return <Ellipse cx={x} cy={y} rx={r * TW * 0.7} ry={r * TW * 0.35} fill={color} opacity={opacity} />;
}

function cylinder(p: P, u: number, v: number, z: number, r: number, h: number, color: string): ReactNode {
  const [x, yb] = p.at(u, v, z);
  const [, yt] = p.at(u, v, z + h);
  const rx = r * TW * 0.7;
  const ry = rx / 2;
  return (
    <G>
      <Ellipse cx={x} cy={yb} rx={rx} ry={ry} fill={shade(color, -0.15)} />
      <Rect x={x - rx} y={yt} width={rx * 2} height={yb - yt} fill={shade(color, -0.05)} />
      <Ellipse cx={x} cy={yt} rx={rx} ry={ry} fill={shade(color, 0.2)} />
    </G>
  );
}

function ball(p: P, u: number, v: number, z: number, r: number, color: string): ReactNode {
  const [x, y] = p.at(u, v, z);
  const rr = r * TW * 0.6;
  return (
    <G>
      <Circle cx={x} cy={y} r={rr} fill={color} />
      <Circle cx={x + rr * 0.15} cy={y + rr * 0.2} r={rr * 0.8} fill={shade(color, -0.12)} opacity={0.5} />
      <Circle cx={x - rr * 0.35} cy={y - rr * 0.35} r={rr * 0.3} fill={shade(color, 0.45)} opacity={0.8} />
    </G>
  );
}

function floorShadow(p: P, inset = 0.08): ReactNode {
  return (
    <Polygon
     
      points={pts([p.at(inset, inset), p.at(p.w - inset, inset), p.at(p.w - inset, p.d - inset), p.at(inset, p.d - inset)])}
      fill="#3D2240"
      opacity={0.12}
    />
  );
}

/** Art drawn flat (64 units per tile, y down) and laid onto the floor. */
function onFloor(p: P, children: ReactNode): ReactNode {
  const [x, y] = p.at(0, 0);
  const s = 1 / 64;
  return (
    <G transform={`matrix(${(TW / 2) * s} ${(TH / 2) * s} ${(-TW / 2) * s} ${(TH / 2) * s} ${x} ${y})`}>
      {children}
    </G>
  );
}

const WOOD = '#C48A5E';
const PINK = '#E58FAA';
const GOLD = '#E8B84A';
const CREAM = '#FFF3E4';

type Sprite = { head: number; draw: (p: P) => ReactNode[] };

/** The parts of a drawing, back to front. */
const parts = (...list: ReactNode[]) => list;

const flatten = (list: ReactNode[]): ReactNode[] => list.flatMap(x => (Array.isArray(x) ? flatten(x) : [x]));

const heart = (x: number, y: number, s: number, color: string) => (
  <Path d={`M${x} ${y + s * 0.9}c${-s} ${-s * 0.6} ${-s * 1.2} ${-s * 1.3} ${-s * 0.6} ${-s * 1.6}c${s * 0.35} ${-s * 0.2} ${s * 0.6} 0 ${s * 0.6} ${s * 0.3}c0 ${-s * 0.3} ${s * 0.25} ${-s * 0.5} ${s * 0.6} ${-s * 0.3}c${s * 0.6} ${s * 0.3} ${s * 0.4} ${s} ${-s * 0.6} ${s * 1.6}z`} fill={color} />
);

const sprites: Record<string, Sprite> = {
  bank: {
    head: 1.3,
    draw: p =>
      parts(
      floorShadow(p),
      box(p, 0.06, 0.12, 0, 1.88, 0.8, 0.42, PINK),
      box(p, 0.06, 0.06, 0.42, 1.88, 0.26, 0.6, shade(PINK, -0.05)),
      box(p, 0.06, 0.12, 0.42, 0.26, 0.8, 0.28, shade(PINK, 0.05)),
      box(p, 1.68, 0.12, 0.42, 0.26, 0.8, 0.28, shade(PINK, 0.05)),
      box(p, 0.36, 0.34, 0.42, 0.6, 0.52, 0.1, '#F4B6C8', 5),
      box(p, 1.04, 0.34, 0.42, 0.6, 0.52, 0.1, '#F4B6C8', 5),
      box(p, 0.4, 0.2, 0.55, 0.36, 0.14, 0.32, '#FFD9A8', 6),
      ),
  },
  salontafel: {
    head: 1,
    draw: p =>
      parts(
      floorShadow(p, 0.16),
      box(p, 0.2, 0.2, 0, 0.08, 0.08, 0.42, shade(WOOD, -0.2)),
      box(p, 0.72, 0.2, 0, 0.08, 0.08, 0.42, shade(WOOD, -0.2)),
      box(p, 0.2, 0.72, 0, 0.08, 0.08, 0.42, shade(WOOD, -0.2)),
      box(p, 0.72, 0.72, 0, 0.08, 0.08, 0.42, shade(WOOD, -0.2)),
      box(p, 0.12, 0.12, 0.42, 0.76, 0.76, 0.1, WOOD, 4),
      box(p, 0.32, 0.36, 0.52, 0.36, 0.26, 0.14, '#E0558A', 3),
      box(p, 0.36, 0.38, 0.66, 0.3, 0.22, 0.05, CREAM, 2),
      ),
  },
  vloerkleed: {
    head: 0.1,
    draw: p =>
      parts(
      onFloor(
        p,
        <G>
          <Ellipse cx={64} cy={64} rx={60} ry={60} fill="#F1C7A6" />
          <Ellipse cx={64} cy={64} rx={50} ry={50} fill="none" stroke="#E8A98A" strokeWidth={5} />
          <Ellipse cx={64} cy={64} rx={34} ry={34} fill="#F7D9C2" />
          <Ellipse cx={64} cy={64} rx={20} ry={20} fill="none" stroke="#E8A98A" strokeWidth={4} strokeDasharray="6 6" />
        </G>,
      ),
      ),
  },
  hartkleed: {
    head: 0.1,
    draw: p =>
      parts(
      onFloor(
        p,
        <G>
          <Rect x={6} y={8} width={116} height={48} rx={22} fill="#F4C2D2" />
          <Rect x={14} y={15} width={100} height={34} rx={16} fill="none" stroke="#E58FAA" strokeWidth={3} strokeDasharray="5 5" />
          {heart(64, 22, 12, '#E0558A')}
        </G>,
      ),
      ),
  },
  arcade: {
    head: 2,
    draw: p =>
      parts(
      floorShadow(p, 0.12),
      box(p, 0.16, 0.16, 0, 0.68, 0.68, 1.55, '#6E4FC4'),
      box(p, 0.14, 0.14, 1.55, 0.72, 0.72, 0.18, '#E0558A', 2),
      onFront(p, 0.84, 0.24, 0.76, 0.92, 1.38, '#2A2350'),
      onFront(p, 0.84, 0.3, 0.7, 0.98, 1.32, '#5ED1E8'),
      box(p, 0.18, 0.62, 0.7, 0.64, 0.24, 0.1, '#4A3796', 2),
      ellipse(p, 0.36, 0.76, 0.82, 0.05, '#FFDB5C'),
      ellipse(p, 0.62, 0.76, 0.82, 0.05, '#FF6B8A'),
      ),
  },
  plant: {
    head: 1.4,
    draw: p =>
      parts(
      ellipse(p, 0.5, 0.5, 0, 0.3, '#3D2240', 0.12),
      cylinder(p, 0.5, 0.5, 0, 0.2, 0.36, '#D9825B'),
      ball(p, 0.36, 0.5, 0.75, 0.2, '#5FA77F'),
      ball(p, 0.62, 0.45, 0.85, 0.22, '#79BE93'),
      ball(p, 0.5, 0.62, 1.05, 0.2, '#5FA77F'),
      ),
  },
  sfeerlamp: {
    head: 2.2,
    draw: p => {
      const [x, y] = p.at(0.5, 0.5, 1.55);
      return parts(
        <Circle cx={x} cy={y} r={34} fill="#FFE7A8" opacity={0.45} />,
        ellipse(p, 0.5, 0.5, 0, 0.22, '#3D2240', 0.12),
        cylinder(p, 0.5, 0.5, 0, 0.16, 0.06, '#6E2D5C'),
        box(p, 0.47, 0.47, 0.06, 0.06, 0.06, 1.35, '#6E2D5C', 2),
        cylinder(p, 0.5, 0.5, 1.35, 0.24, 0.4, '#F7C948'),
      );
    },
  },
  boekenkast: {
    head: 2.1,
    draw: p => {
      const books: ReactNode[] = [];
      const colors = ['#6C8BD6', '#E0558A', '#86C3A8', '#F2B15C', '#6E2D5C', '#B59BDD'];
      [0.25, 0.75, 1.25].forEach((z, row) =>
        [0, 1, 2, 3].forEach(i => {
          const u0 = 0.2 + i * 0.15;
          books.push(onFront(p, 0.81, u0, u0 + 0.11, z, z + 0.32 - ((i + row) % 2) * 0.06, colors[(i + row * 2) % colors.length], 1));
        }),
      );
      return parts(floorShadow(p, 0.1), box(p, 0.12, 0.2, 0, 0.76, 0.6, 1.75, WOOD), onFront(p, 0.8, 0.17, 0.83, 0.1, 1.68, shade(WOOD, -0.3)), ...books);
    },
  },
  'kristallen-bol': {
    head: 1.6,
    draw: p =>
      parts(
      ellipse(p, 0.5, 0.5, 0, 0.26, '#3D2240', 0.12),
      cylinder(p, 0.5, 0.5, 0, 0.16, 0.6, '#A8705A'),
      cylinder(p, 0.5, 0.5, 0.6, 0.2, 0.08, '#8A5A45'),
      ball(p, 0.5, 0.5, 1.0, 0.27, '#B9A2E6'),
      ),
  },
  arcadetrofee: {
    head: 1.8,
    draw: p => {
      const [x, y] = p.at(0.5, 0.5, 1.05);
      return parts(
        floorShadow(p, 0.2),
        box(p, 0.25, 0.25, 0, 0.5, 0.5, 0.6, '#6E2D5C'),
        box(p, 0.4, 0.4, 0.6, 0.2, 0.2, 0.18, '#C99A2E', 2),
        <Path d={`M${x - 15} ${y - 20}h30v8a15 15 0 0 1 -30 0z`} fill={GOLD} />,
        <Path d={`M${x - 15} ${y - 16}h-6a6 6 0 0 0 6 10M${x + 15} ${y - 16}h6a6 6 0 0 1 -6 10`} stroke={GOLD} strokeWidth={3} fill="none" />,
        <Circle cx={x - 6} cy={y - 14} r={3} fill="#FFF5CC" />,
      );
    },
  },
  poef: {
    head: 0.9,
    draw: p => parts(ellipse(p, 0.5, 0.5, 0, 0.36, '#3D2240', 0.12), cylinder(p, 0.5, 0.5, 0, 0.32, 0.36, '#F2B15C'), ellipse(p, 0.5, 0.5, 0.36, 0.08, '#D9902E')),
  },
  zitzak: {
    head: 0.9,
    draw: p => {
      const [x, y] = p.at(0.5, 0.5, 0.2);
      return parts(
        ellipse(p, 0.5, 0.5, 0, 0.38, '#3D2240', 0.12),
        <Path d={`M${x - 26} ${y + 8}c-4 -26 14 -34 26 -34s30 6 26 34c-6 10 -46 10 -52 0z`} fill="#6C8BD6" />,
        <Path d={`M${x - 14} ${y - 14}c6 -8 16 -8 22 -4`} stroke="#9DB3EA" strokeWidth={4} strokeLinecap="round" fill="none" />,
      );
    },
  },
  bed: {
    head: 1.4,
    draw: p =>
      parts(
      floorShadow(p),
      box(p, 0.06, 0.06, 0, 1.88, 1.88, 0.32, WOOD),
      box(p, 0.06, 0.06, 0, 1.88, 0.18, 1.05, shade(WOOD, -0.08)),
      box(p, 0.12, 0.26, 0.32, 1.76, 1.62, 0.16, CREAM, 4),
      box(p, 0.12, 0.86, 0.48, 1.76, 1.02, 0.14, '#E58FAA', 5),
      box(p, 0.24, 0.32, 0.48, 0.62, 0.4, 0.16, '#FFFFFF', 6),
      box(p, 1.08, 0.32, 0.48, 0.62, 0.4, 0.16, '#FFFFFF', 6),
      ),
  },
  nachtkastje: {
    head: 1.3,
    draw: p => {
      const [x, y] = p.at(0.5, 0.5, 0.95);
      return parts(
        floorShadow(p, 0.15),
        box(p, 0.18, 0.18, 0, 0.64, 0.64, 0.55, WOOD),
        onFront(p, 0.82, 0.3, 0.7, 0.2, 0.42, shade(WOOD, -0.25)),
        <Circle cx={x} cy={y} r={20} fill="#FFE7A8" opacity={0.45} />,
        cylinder(p, 0.5, 0.5, 0.55, 0.1, 0.28, '#B59BDD'),
        cylinder(p, 0.5, 0.5, 0.83, 0.16, 0.2, '#FBE4E8'),
      );
    },
  },
  kledingkast: {
    head: 2.3,
    draw: p =>
      parts(
      floorShadow(p, 0.1),
      box(p, 0.12, 0.2, 0, 0.76, 0.66, 1.95, '#D9A6C4'),
      onFront(p, 0.86, 0.49, 0.51, 0.12, 1.85, shade('#D9A6C4', -0.3), 1),
      onFront(p, 0.86, 0.4, 0.45, 0.85, 1.05, GOLD, 1),
      onFront(p, 0.86, 0.55, 0.6, 0.85, 1.05, GOLD, 1),
      box(p, 0.1, 0.18, 1.95, 0.8, 0.7, 0.1, shade('#D9A6C4', 0.1), 2),
      ),
  },
  boom: {
    head: 3,
    draw: p => {
      const [x, y] = p.at(0.5, 0.5, 2.1);
      return parts(
        ellipse(p, 0.5, 0.5, 0, 0.45, '#3D2240', 0.14),
        cylinder(p, 0.5, 0.5, 0, 0.1, 1.3, '#8A5A45'),
        ball(p, 0.32, 0.5, 1.7, 0.36, '#5FA77F'),
        ball(p, 0.7, 0.42, 1.85, 0.36, '#6FB98B'),
        ball(p, 0.5, 0.55, 2.3, 0.38, '#79BE93'),
        <Circle cx={x - 14} cy={y + 18} r={5} fill="#E0464E" />,
        <Circle cx={x + 16} cy={y + 4} r={5} fill="#E0464E" />,
        <Circle cx={x + 2} cy={y - 14} r={5} fill="#E0464E" />,
      );
    },
  },
  tuinbank: {
    head: 1.2,
    draw: p =>
      parts(
      floorShadow(p),
      box(p, 0.15, 0.25, 0, 0.1, 0.6, 0.4, '#5C7A5E'),
      box(p, 1.75, 0.25, 0, 0.1, 0.6, 0.4, '#5C7A5E'),
      box(p, 0.1, 0.25, 0.4, 1.8, 0.6, 0.08, '#C48A5E', 2),
      box(p, 0.1, 0.15, 0.48, 1.8, 0.1, 0.5, '#B47A50', 2),
      ),
  },
  vuurkorf: {
    head: 1.4,
    draw: p => {
      const [x, y] = p.at(0.5, 0.5, 0.45);
      return parts(
        <Circle cx={x} cy={y - 10} r={36} fill="#FFB65C" opacity={0.3} />,
        ellipse(p, 0.5, 0.5, 0, 0.3, '#3D2240', 0.15),
        cylinder(p, 0.5, 0.5, 0, 0.24, 0.4, '#4A3B45'),
        <Path d={`M${x - 14} ${y}c-4 -16 8 -20 6 -34c10 8 18 18 10 34z`} fill="#FF7A3D" />,
        <Path d={`M${x - 4} ${y}c-2 -12 6 -14 6 -24c8 8 10 16 4 24z`} fill="#FFD25C" />,
      );
    },
  },
  bloemen: {
    head: 0.9,
    draw: p => {
      const flowers: ReactNode[] = [];
      const colors = ['#F59AB0', '#FFD25C', '#B59BDD', '#FF8A80', '#FFFFFF'];
      [[0.3, 0.3], [0.65, 0.3], [0.3, 0.68], [0.68, 0.66], [0.5, 0.5]].forEach(([u, v], i) => {
        const [x, y] = p.at(u, v, 0.5);
        flowers.push(<Path d={`M${x} ${y}v14`} stroke="#4E8F62" strokeWidth={2} />);
        flowers.push(<Circle cx={x} cy={y} r={6} fill={colors[i]} />);
        flowers.push(<Circle cx={x} cy={y} r={2.2} fill="#F2B15C" />);
      });
      return parts(box(p, 0.1, 0.1, 0, 0.8, 0.8, 0.22, '#8A6248', 4), ...flowers);
    },
  },
  hangmat: {
    head: 1.6,
    draw: p => {
      const [ax, ay] = p.at(0.2, 0.5, 1);
      const [bx, by] = p.at(1.8, 0.5, 1);
      return parts(
        floorShadow(p, 0.2),
        cylinder(p, 0.2, 0.5, 0, 0.06, 1.2, '#8A5A45'),
        cylinder(p, 1.8, 0.5, 0, 0.06, 1.2, '#8A5A45'),
        <Path d={`M${ax} ${ay}Q${(ax + bx) / 2} ${(ay + by) / 2 + 40} ${bx} ${by}`} stroke="#E0558A" strokeWidth={14} fill="none" strokeLinecap="round" />,
        <Path d={`M${ax} ${ay}Q${(ax + bx) / 2} ${(ay + by) / 2 + 40} ${bx} ${by}`} stroke="#F7B6CB" strokeWidth={4} fill="none" strokeDasharray="6 8" />,
      );
    },
  },
  trofeekast: {
    head: 2.2,
    draw: p => {
      const cups: ReactNode[] = [];
      [0.55, 1.15].forEach(z =>
        [0.32, 0.62].forEach(u => {
          const [x, y] = p.at(u, 0.82, z + 0.25);
          cups.push(<Path d={`M${x - 6} ${y - 8}h12v4a6 6 0 0 1 -12 0z`} fill={GOLD} />);
        }),
      );
      return parts(floorShadow(p, 0.1), box(p, 0.12, 0.2, 0, 0.76, 0.6, 1.8, '#6E2D5C'), onFront(p, 0.81, 0.18, 0.82, 0.15, 1.7, '#CFE3F4'), ...cups);
    },
  },
  cadeautafel: {
    head: 1.5,
    draw: p =>
      parts(
      floorShadow(p, 0.16),
      box(p, 0.18, 0.18, 0, 0.64, 0.64, 0.45, WOOD),
      box(p, 0.28, 0.28, 0.45, 0.44, 0.44, 0.38, '#E0558A', 2),
      box(p, 0.46, 0.27, 0.45, 0.08, 0.46, 0.39, GOLD, 1),
      box(p, 0.27, 0.46, 0.45, 0.46, 0.08, 0.39, GOLD, 1),
      ball(p, 0.5, 0.5, 0.92, 0.08, GOLD),
      ),
  },
};

// ---- Wall art: flat drawings 64 units per tile wide, WALL height = 205 units, y down ----

type WallSprite = (w: number) => ReactNode;

export const wallSprites: Record<string, WallSprite> = {
  raam: () => (
    <G>
      <Rect x={8} y={38} width={48} height={64} rx={8} fill="#FFFFFF" />
      <Rect x={13} y={43} width={38} height={54} rx={5} fill="#A9C7F2" />
      <Rect x={13} y={43} width={38} height={26} rx={5} fill="#C8DBF7" />
      <Circle cx={40} cy={54} r={6} fill="#FFF3C4" />
      <Rect x={30.5} y={43} width={3} height={54} fill="#FFFFFF" />
      <Rect x={13} y={68} width={38} height={3} fill="#FFFFFF" />
      <Rect x={4} y={100} width={56} height={7} rx={3} fill="#F2DDE2" />
    </G>
  ),
  kalender: () => (
    <G>
      <Rect x={14} y={50} width={36} height={42} rx={6} fill="#FFFFFF" />
      <Rect x={14} y={50} width={36} height={12} rx={6} fill="#E0558A" />
      <SvgText x={32} y={84} fontSize={18} fontWeight="bold" fill="#6E2D5C" textAnchor="middle">
        {new Date().getDate()}
      </SvgText>
      <Circle cx={22} cy={50} r={3} fill="#6E2D5C" />
      <Circle cx={42} cy={50} r={3} fill="#6E2D5C" />
    </G>
  ),
  prikbord: () => (
    <G>
      <Rect x={6} y={44} width={52} height={44} rx={6} fill="#C99A6B" />
      <Rect x={10} y={48} width={44} height={36} rx={4} fill="#E2B98A" />
      <Rect x={14} y={52} width={14} height={14} fill="#FFF3A8" transform="rotate(-6 21 59)" />
      <Rect x={33} y={54} width={16} height={12} fill="#FBE4E8" transform="rotate(5 41 60)" />
      <Rect x={20} y={68} width={18} height={12} fill="#E6F3EE" transform="rotate(3 29 74)" />
      <Circle cx={21} cy={53} r={2} fill="#E0558A" />
      <Circle cx={41} cy={55} r={2} fill="#6C8BD6" />
      <Circle cx={29} cy={69} r={2} fill="#E0558A" />
    </G>
  ),
  fotolijst: () => (
    <G>
      <Rect x={12} y={46} width={40} height={44} rx={4} fill="#E8B84A" />
      <Rect x={17} y={51} width={30} height={34} rx={2} fill="#FFF8F0" />
      {heart(32, 61, 9, '#E0558A')}
    </G>
  ),
  'kompas-schilderij': () => (
    <G>
      <Rect x={10} y={44} width={44} height={44} rx={5} fill="#A8705A" />
      <Rect x={14} y={48} width={36} height={36} rx={3} fill="#E5EAFB" />
      <Circle cx={32} cy={66} r={12} fill="none" stroke="#6E2D5C" strokeWidth={2.5} />
      <Path d="M36 60l-6 10-6 2 6-10z" fill="#E0558A" />
    </G>
  ),
  lichtslinger: w => {
    const width = 64 * w;
    const bulbs = Array.from({ length: 7 * w }, (_, i) => {
      const x = 6 + (i * (width - 12)) / (7 * w - 1);
      const y = 22 + Math.sin((i / (7 * w - 1)) * Math.PI * 2 * w) * 6 + 6;
      return <Circle key={i} cx={x} cy={y} r={4} fill={['#F7C948', '#F59AB0', '#9AD3BC', '#B9A2E6'][i % 4]} />;
    });
    return (
      <G>
        <Path d={`M2 20 Q${width / 4} 40 ${width / 2} 20 T${width - 2} 20`} stroke="#6E2D5C" strokeWidth={1.5} fill="none" />
        {bulbs}
      </G>
    );
  },
};

export function spriteHead(kind: string) {
  return sprites[kind]?.head ?? 1;
}

/** Size of a floor sprite's box, in scene units. */
export function spriteBox(w: number, d: number, kind: string) {
  return { width: ((w + d) * TW) / 2, height: ((w + d) * TH) / 2 + spriteHead(kind) * ZH };
}

/** One floor or flat item, drawn in its own box. */
export function ItemSprite({ kind, rot, scale = 1, tint }: { kind: string; rot: 0 | 1; scale?: number; tint?: string }) {
  const def = kindById.get(kind);
  const s = sprites[kind];
  if (!def || !s) return null;
  const p = frame(def.w, def.d, s.head);
  const { width, height } = spriteBox(def.w, def.d, kind);
  return (
    <Svg width={width * scale} height={height * scale} viewBox={`0 0 ${width} ${height}`}>
      <G transform={rot ? `translate(${width} 0) scale(-1 1)` : undefined} opacity={tint ? 0.75 : 1}>
        {flatten(s.draw(p)).map((el, i) => (
          <G key={i}>{el}</G>
        ))}
      </G>
      {tint && <Rect x={0} y={0} width={width} height={height} fill={tint} opacity={0.18} />}
    </Svg>
  );
}

/** Small picture for the inventory. */
export function ItemIcon({ kind, size = 54 }: { kind: string; size?: number }) {
  const def = kindById.get(kind);
  if (!def) return null;
  if (def.place === 'wall') {
    return (
      <Svg width={size} height={size} viewBox={`0 30 ${64 * def.w} ${64 * def.w}`}>
        {wallSprites[kind]?.(def.w)}
      </Svg>
    );
  }
  const { width, height } = spriteBox(def.w, def.d, kind);
  const scale = size / Math.max(width, height);
  return <ItemSprite kind={kind} rot={0} scale={scale} />;
}
