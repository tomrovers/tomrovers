import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Polygon } from 'react-native-svg';

import { kindById, type ItemAction, type Room } from '@/lib/house/catalog';
import { GRID, ORIGIN_X, project, pts, SCENE_H, SCENE_W, shade, TH, TW, unproject, WALL, ZH } from '@/lib/house/iso';
import { besideItem, blockedTiles, findPath, fits, itemAt, size, tilesOf, type PlacedItem } from '@/lib/house/layout';
import type { AvatarConfig, Expression } from '@/lib/types';
import { colors, fonts } from '@/theme';

import { Figure, FIGURE_H, FIGURE_W } from './figure';
import { ItemSprite, spriteBox, spriteHead, wallSprites } from './sprites';

type Tile = [number, number];
export type Spot = { gx: number; gy: number; seat: boolean };
export type Person = { avatar: AvatarConfig; expression: Expression; name: string };

const NATIVE = Platform.OS !== 'web';
const STEP_MS = 230;
const SEAT_Z = 0.42;

// ---------- geometry helpers ----------

function feet(t: Tile, seated: boolean) {
  const [x, y] = project(t[0] + 0.5, t[1] + 0.5, seated ? SEAT_Z : 0);
  return { x: x - FIGURE_W / 2, y: y - FIGURE_H + 5 };
}

const depth = (it: PlacedItem) => {
  const [w, d] = size(it);
  return it.gx + w - 1 + (it.gy + d - 1);
};

function itemRect(it: PlacedItem) {
  const [w, d] = size(it);
  const [x, y] = project(it.gx, it.gy);
  const box = spriteBox(w, d, it.kind);
  return { left: x - (d * TW) / 2, top: y - spriteHead(it.kind) * ZH, ...box };
}

function wallMatrix(it: PlacedItem) {
  const w = kindById.get(it.kind)!.w;
  const s = 1 / 64;
  if (it.wall === 'R') {
    const [x, y] = project(it.gx, 0, WALL);
    return { a: (TW / 2) * s, b: (TH / 2) * s, x, y };
  }
  const [x, y] = project(0, it.gx + w, WALL);
  return { a: (TW / 2) * s, b: (-TH / 2) * s, x, y };
}

function wallRect(it: PlacedItem) {
  const w = kindById.get(it.kind)!.w;
  const m = wallMatrix(it);
  const corners = [
    [0, 30],
    [64 * w, 30],
    [0, 115],
    [64 * w, 115],
  ].map(([px, py]) => [m.x + m.a * px, m.y + m.b * px + (ZH / 64) * py]);
  const xs = corners.map(c => c[0]);
  const ys = corners.map(c => c[1]);
  return { left: Math.min(...xs), top: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

const inside = (r: { left: number; top: number; width: number; height: number }, x: number, y: number) =>
  x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height;

/** The tile in front of a wall item, where a figure stands to use it. */
function wallFront(it: PlacedItem): Tile {
  const pos = it.gx + Math.floor((kindById.get(it.kind)!.w - 1) / 2);
  return it.wall === 'R' ? [pos, 0] : [0, pos];
}

// ---------- a walking figure ----------

function useWalker(start: Spot) {
  const [tile, setTile] = useState<Tile>([start.gx, start.gy]);
  const [seated, setSeated] = useState(start.seat);
  const [step, setStep] = useState(0);
  const [pos] = useState(() => new Animated.ValueXY(feet([start.gx, start.gy], start.seat)));
  const walk = useRef(0); // bumped to cancel a walk in progress

  const walkTo = useCallback(
    async (path: Tile[], seatAtEnd: boolean, onArrive?: (t: Tile) => void) => {
      const my = ++walk.current;
      setSeated(false);
      let last: Tile | null = null;
      for (let i = 0; i < path.length; i++) {
        if (walk.current !== my) return;
        const t = path[i];
        const sit = seatAtEnd && i === path.length - 1;
        setTile(t);
        setStep(s => s + 1);
        await new Promise<void>(done =>
          Animated.timing(pos, { toValue: feet(t, sit), duration: STEP_MS, easing: Easing.linear, useNativeDriver: NATIVE }).start(() => done()),
        );
        last = t;
      }
      if (walk.current !== my) return;
      setSeated(seatAtEnd);
      if (last || path.length === 0) onArrive?.(last ?? tile);
    },
    [pos, tile],
  );

  const jump = useCallback(
    (s: Spot) => {
      walk.current++;
      setTile([s.gx, s.gy]);
      setSeated(s.seat);
      pos.setValue(feet([s.gx, s.gy], s.seat));
    },
    [pos],
  );

  return { tile, seated, step, pos, walkTo, jump };
}

// ---------- floating heart ----------

function Emote({ trigger }: { trigger: number }) {
  const [anim] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!trigger) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE }).start();
  }, [anim, trigger]);
  return (
    <Animated.Text
      style={[
        styles.emote,
        {
          opacity: anim.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -34] }) }, { scale: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.4, 1.2, 1] }) }],
        },
      ]}>
      ❤️
    </Animated.Text>
  );
}

// ---------- a bubble above an object ----------

function Badge({ x, y, text }: { x: number; y: number; text: string }) {
  const [bob] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE }),
        Animated.timing(bob, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);
  return (
    <Animated.View style={[styles.badge, { left: x - 13, top: Math.max(2, y - 30), transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </Animated.View>
  );
}

// ---------- the scene ----------

type Props = {
  room: Room;
  items: PlacedItem[];
  editing: boolean;
  selected: string | null;
  onSelect: (kind: string | null) => void;
  onItemsChange: (items: PlacedItem[]) => void;
  me: Person;
  myStart: Spot;
  onMyMove: (s: Spot) => void;
  partner?: Person & { spot: Spot | null };
  onPartnerTap: () => void;
  onAction: (a: ItemAction) => void;
  hearts: { me: number; partner: number };
  /** A little bubble above an object that has something waiting, keyed by item kind. */
  badges?: Partial<Record<string, string>>;
};

type Drag = { kind: string; startX: number; startY: number; grab: Tile; item: PlacedItem; valid: boolean; moved: boolean };
type Touch = { sx: number; sy: number; pageX: number; pageY: number };

export function HouseScene(props: Props) {
  const { room, items, editing, selected, me, partner } = props;
  const [width, setWidth] = useState(0);
  const scale = width / SCENE_W;
  const [drag, setDrag] = useState<Drag | null>(null);
  const [touch, setTouch] = useState<Touch | null>(null);
  const myWalker = useWalker(props.myStart);
  const partnerWalker = useWalker(partner?.spot ?? { gx: GRID - 2, gy: GRID - 2, seat: false });

  const shown = drag ? items.map(it => (it.kind === drag.kind ? drag.item : it)) : items;
  const blocked = blockedTiles(items);

  // The partner walks to wherever their presence says they are.
  const target = partner?.spot;
  const partnerTile = partnerWalker.tile;
  const partnerWalk = partnerWalker.walkTo;
  const partnerSeated = partnerWalker.seated;
  useEffect(() => {
    if (!target) return;
    if (target.gx === partnerTile[0] && target.gy === partnerTile[1] && target.seat === partnerSeated) return;
    const path = findPath(partnerTile, [target.gx, target.gy], blockedTiles(items));
    void partnerWalk(path ?? [[target.gx, target.gy]], target.seat);
    // Only a new target should start a walk, not every step of the current one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.gx, target?.gy, target?.seat]);

  // A new room starts the figure where the parent says.
  const jumpMe = myWalker.jump;
  const start = props.myStart;
  useEffect(() => {
    jumpMe(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  const toScene = (e: GestureResponderEvent): Touch => ({
    sx: e.nativeEvent.locationX / scale,
    sy: e.nativeEvent.locationY / scale,
    pageX: e.nativeEvent.pageX,
    pageY: e.nativeEvent.pageY,
  });

  /** The front-most item under a scene point. */
  const hit = (x: number, y: number): PlacedItem | undefined => {
    const [u, v] = unproject(x, y);
    const tile: Tile = [Math.floor(u), Math.floor(v)];
    const floor = [...items].filter(it => !it.wall).sort((a, b) => depth(b) - depth(a));
    const isFlat = (it: PlacedItem) => kindById.get(it.kind)!.place === 'flat';
    // Furniture is hit where it is drawn: its upper part, or a spot whose floor point
    // (looking through the item at a few heights) lies inside its footprint.
    const onFootprint = (it: PlacedItem) =>
      [0, 0.4, 0.8, 1.2].some(z => {
        const [fu, fv] = unproject(x, y + z * ZH);
        const [w, d] = size(it);
        return fu >= it.gx && fu < it.gx + w && fv >= it.gy && fv < it.gy + d;
      });
    const upper = floor.find(it => {
      if (isFlat(it)) return false;
      const r = itemRect(it);
      const [w, d] = size(it);
      return inside(r, x, y) && (y < r.top + r.height - ((w + d) * TH) / 2 || onFootprint(it));
    });
    return (
      upper ??
      itemAt(items, tile[0], tile[1]) ??
      items.filter(it => it.wall).find(it => inside(wallRect(it), x, y)) ??
      floor.find(it => isFlat(it) && tilesOf(it).some(t => t[0] === tile[0] && t[1] === tile[1]))
    );
  };

  const walkMe = (goal: Tile, seat: boolean, then?: () => void) => {
    const path = findPath(myWalker.tile, goal, blocked);
    if (!path) return;
    void myWalker.walkTo(path, seat, t => {
      props.onMyMove({ gx: t[0], gy: t[1], seat });
      then?.();
    });
  };

  const tap = (x: number, y: number) => {
    if (partner?.spot) {
      const p = feet(partnerWalker.tile, partnerWalker.seated);
      if (x >= p.x && x <= p.x + FIGURE_W && y >= p.y && y <= p.y + FIGURE_H) {
        const near = besideItem({ kind: 'plant', gx: partnerWalker.tile[0], gy: partnerWalker.tile[1], rot: 0 }, blocked, myWalker.tile);
        if (near) walkMe(near, false);
        props.onPartnerTap();
        return;
      }
    }
    const it = hit(x, y);
    const kind = it && kindById.get(it.kind);
    if (it && kind?.action) {
      const spot = it.wall ? wallFront(it) : besideItem(it, blocked, myWalker.tile);
      const action = kind.action;
      if (spot && !blocked.has(spot.join(','))) walkMe(spot, false, () => props.onAction(action));
      else props.onAction(action);
      return;
    }
    if (it && kind?.seat) {
      const seatTile = tilesOf(it).sort((a, b) => Math.hypot(a[0] - myWalker.tile[0], a[1] - myWalker.tile[1]) - Math.hypot(b[0] - myWalker.tile[0], b[1] - myWalker.tile[1]))[0];
      walkMe(seatTile, true);
      return;
    }
    const [u, v] = unproject(x, y);
    const t: Tile = [Math.floor(u), Math.floor(v)];
    if (t[0] < 0 || t[1] < 0 || t[0] >= GRID || t[1] >= GRID || blocked.has(t.join(','))) return;
    walkMe(t, false);
  };

  const candidate = (d: Drag, x: number, y: number): PlacedItem => {
    const kind = kindById.get(d.kind)!;
    if (kind.place === 'wall' && room.wall) {
      const wall: 'L' | 'R' = x >= ORIGIN_X ? 'R' : 'L';
      const along = wall === 'R' ? (x - ORIGIN_X) / (TW / 2) : (ORIGIN_X - x) / (TW / 2);
      const gx = Math.round(along - kind.w / 2);
      return { ...d.item, wall, gx: Math.max(0, Math.min(GRID - kind.w, gx)) };
    }
    const [u, v] = unproject(x, y);
    return { ...d.item, gx: Math.floor(u) - d.grab[0], gy: Math.floor(v) - d.grab[1] };
  };

  const onGrant = (e: GestureResponderEvent) => {
    const t = toScene(e);
    setTouch(t);
    if (!editing) return;
    const it = hit(t.sx, t.sy);
    if (!it) {
      props.onSelect(null);
      return;
    }
    const [u, v] = unproject(t.sx, t.sy);
    props.onSelect(it.kind);
    setDrag({ kind: it.kind, startX: t.sx, startY: t.sy, grab: [Math.floor(u) - it.gx, Math.floor(v) - it.gy], item: it, valid: true, moved: false });
  };

  const onMove = (e: GestureResponderEvent) => {
    if (!drag || !touch) return;
    const x = touch.sx + (e.nativeEvent.pageX - touch.pageX) / scale;
    const y = touch.sy + (e.nativeEvent.pageY - touch.pageY) / scale;
    if (!drag.moved && Math.hypot(x - drag.startX, y - drag.startY) < 6) return;
    const item = candidate(drag, x, y);
    setDrag({ ...drag, item, moved: true, valid: fits(item, items) });
  };

  const onRelease = (e: GestureResponderEvent) => {
    const start = touch;
    setTouch(null);
    if (drag) {
      if (drag.moved && drag.valid) props.onItemsChange(items.map(it => (it.kind === drag.kind ? drag.item : it)));
      setDrag(null);
      return;
    }
    if (!editing && start && Math.hypot(e.nativeEvent.pageX - start.pageX, e.nativeEvent.pageY - start.pageY) < 10) tap(start.sx, start.sy);
  };

  // ---------- drawing ----------

  const floorColors = room.floor;
  const tiles = [];
  for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) {
    tiles.push(
      <Polygon key={`${x},${y}`} points={pts([project(x, y), project(x + 1, y), project(x + 1, y + 1), project(x, y + 1)])} fill={floorColors[(x + y) % 2]} />,
    );
  }
  const slab = 0.5;
  const front = shade(floorColors[0], -0.25);

  const sel = shown.find(it => it.kind === selected && !it.wall);
  const highlight = sel && editing && (
    <Polygon
      points={pts(
        (() => {
          const [w, d] = size(sel);
          return [project(sel.gx, sel.gy), project(sel.gx + w, sel.gy), project(sel.gx + w, sel.gy + d), project(sel.gx, sel.gy + d)];
        })(),
      )}
      fill={drag && !drag.valid ? '#E0464E' : '#3E9B76'}
      opacity={0.35}
    />
  );

  const meZ = myWalker.seated ? (itemAt(items, myWalker.tile[0], myWalker.tile[1]) ? depth(itemAt(items, myWalker.tile[0], myWalker.tile[1])!) * 10 + 6 : 50) : (myWalker.tile[0] + myWalker.tile[1]) * 10 + 5;
  const partnerItem = itemAt(items, partnerWalker.tile[0], partnerWalker.tile[1]);
  const partnerZ = partnerWalker.seated && partnerItem ? depth(partnerItem) * 10 + 6 : (partnerWalker.tile[0] + partnerWalker.tile[1]) * 10 + 4;

  return (
    <View
      style={styles.frame}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => editing}
      onResponderTerminationRequest={() => !drag}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      onResponderRelease={onRelease}
      accessibilityLabel={`${room.name}. Tik op de vloer om te lopen, of op een voorwerp.`}>
      {width > 0 && (
        <View style={[styles.stage, { transform: [{ scale }] }]} pointerEvents="none">
          <Svg width={SCENE_W} height={SCENE_H} style={StyleSheet.absoluteFill}>
            {/* floor slab: makes the room a little diorama */}
            <Polygon points={pts([project(0, GRID), project(GRID, GRID), project(GRID, GRID, -slab), project(0, GRID, -slab)])} fill={front} />
            <Polygon points={pts([project(GRID, 0), project(GRID, GRID), project(GRID, GRID, -slab), project(GRID, 0, -slab)])} fill={shade(front, -0.12)} />
            {room.wall ? (
              <G>
                <Polygon points={pts([project(0, 0), project(0, GRID), project(0, GRID, WALL), project(0, 0, WALL)])} fill={shade(room.wall, -0.06)} />
                <Polygon points={pts([project(0, 0), project(GRID, 0), project(GRID, 0, WALL), project(0, 0, WALL)])} fill={room.wall} />
                <Polygon points={pts([project(0, GRID, WALL), project(0, 0, WALL), project(GRID, 0, WALL), project(GRID, -0.15, WALL), project(-0.15, -0.15, WALL), project(-0.15, GRID, WALL)])} fill={shade(room.wall, 0.4)} />
                <Polygon points={pts([project(0, 0), project(0, GRID), project(0, GRID, 0.18), project(0, 0, 0.18)])} fill={shade(room.wall, -0.2)} />
                <Polygon points={pts([project(0, 0), project(GRID, 0), project(GRID, 0, 0.18), project(0, 0, 0.18)])} fill={shade(room.wall, -0.14)} />
              </G>
            ) : (
              <G>
                {Array.from({ length: GRID * 2 }, (_, i) => {
                  const along = i % GRID;
                  const [x, y] = i < GRID ? project(along + 0.5, -0.05, 0.35) : project(-0.05, along + 0.5, 0.35);
                  return (
                    <G key={i}>
                      <Circle cx={x} cy={y} r={24} fill="#6FB98B" />
                      <Circle cx={x - 6} cy={y - 8} r={9} fill="#8FD0A5" opacity={0.7} />
                    </G>
                  );
                })}
              </G>
            )}
            {tiles}
            {editing &&
              Array.from({ length: GRID + 1 }, (_, i) => {
                const [ax, ay] = project(i, 0);
                const [bx, by] = project(i, GRID);
                const [cx, cy] = project(0, i);
                const [dx, dy] = project(GRID, i);
                return (
                  <G key={`g${i}`} opacity={0.6}>
                    <Line x1={ax} y1={ay} x2={bx} y2={by} stroke="#FFFFFF" strokeWidth={1} />
                    <Line x1={cx} y1={cy} x2={dx} y2={dy} stroke="#FFFFFF" strokeWidth={1} />
                  </G>
                );
              })}
            {room.wall &&
              shown
                .filter(it => it.wall)
                .map(it => {
                  const m = wallMatrix(it);
                  const sprite = wallSprites[it.kind];
                  return (
                    <G key={it.kind} transform={`matrix(${m.a} ${m.b} 0 ${ZH / 64} ${m.x} ${m.y})`} opacity={editing && selected === it.kind ? 0.7 : 1}>
                      {sprite?.(kindById.get(it.kind)!.w)}
                    </G>
                  );
                })}
          </Svg>

          {shown
            .filter(it => !it.wall)
            .map(it => {
              const r = itemRect(it);
              const flat = kindById.get(it.kind)!.place === 'flat';
              const invalid = drag?.kind === it.kind && !drag.valid;
              return (
                <View key={it.kind} style={[styles.abs, { left: r.left, top: r.top, zIndex: flat ? 1 : depth(it) * 10 }]}>
                  <ItemSprite kind={it.kind} rot={it.rot} tint={invalid ? '#E0464E' : undefined} />
                </View>
              );
            })}

          <Svg width={SCENE_W} height={SCENE_H} style={[StyleSheet.absoluteFill, { zIndex: 2 }]}>
            {highlight}
          </Svg>

          {!editing &&
            Object.entries(props.badges ?? {}).map(([kind, text]) => {
              const it = items.find(i => i.kind === kind);
              if (!it || !text) return null;
              const r = it.wall ? wallRect(it) : itemRect(it);
              return <Badge key={kind} x={r.left + r.width / 2} y={r.top + (it.wall ? 4 : 10)} text={text} />;
            })}

          {partner?.spot && (
            <Animated.View style={[styles.abs, { zIndex: partnerZ, transform: partnerWalker.pos.getTranslateTransform() }]}>
              <Figure config={partner.avatar} expression={partner.expression} step={partnerWalker.step} seated={partnerWalker.seated} />
              <Text style={styles.name} numberOfLines={1}>
                {partner.name}
              </Text>
              <Emote trigger={props.hearts.partner} />
            </Animated.View>
          )}
          <Animated.View style={[styles.abs, { zIndex: meZ, transform: myWalker.pos.getTranslateTransform() }]}>
            <Figure config={me.avatar} expression={me.expression} step={myWalker.step} seated={myWalker.seated} />
            <Text style={[styles.name, styles.meName]} numberOfLines={1}>
              {me.name}
            </Text>
            <Emote trigger={props.hearts.me} />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: SCENE_W / SCENE_H, overflow: 'hidden' },
  stage: { position: 'absolute', left: 0, top: 0, width: SCENE_W, height: SCENE_H, transformOrigin: 'left top' },
  abs: { position: 'absolute', left: 0, top: 0 },
  name: {
    position: 'absolute',
    top: -14,
    left: -12,
    width: FIGURE_W + 24,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.plum,
  },
  meName: { color: colors.roseDark },
  emote: { position: 'absolute', top: -30, left: FIGURE_W / 2 - 11, fontSize: 20 },
  badge: {
    position: 'absolute',
    zIndex: 500,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.rose,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.black, fontSize: 13, color: colors.white },
});
