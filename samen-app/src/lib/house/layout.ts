import type { HouseItemId } from '../content';
import { kindById, kinds, rooms, type ItemKind, type RoomId } from './catalog';
import { GRID } from './iso';

/** A placed object. Floor items use (gx, gy); wall items use `wall` and gx as their position along it. */
export type PlacedItem = { kind: string; gx: number; gy: number; rot: 0 | 1; wall?: 'L' | 'R' };
export type HouseLayout = { rooms: Partial<Record<RoomId, PlacedItem[]>>; updatedAt: number };

/** Where a figure is, shared live with the partner. */
export type Presence = { uid: string; room: RoomId; gx: number; gy: number; seat: boolean; at: number };

const defaults: Record<RoomId, PlacedItem[]> = {
  woonkamer: [
    { kind: 'vloerkleed', gx: 2, gy: 2, rot: 0 },
    { kind: 'bank', gx: 2, gy: 0, rot: 0 },
    { kind: 'salontafel', gx: 3, gy: 2, rot: 0 },
    { kind: 'arcade', gx: 0, gy: 5, rot: 1 },
    { kind: 'raam', gx: 4, gy: 0, rot: 0, wall: 'R' },
    { kind: 'kalender', gx: 0, gy: 0, rot: 0, wall: 'R' },
    { kind: 'prikbord', gx: 2, gy: 0, rot: 0, wall: 'L' },
  ],
  slaapkamer: [
    { kind: 'hartkleed', gx: 2, gy: 3, rot: 0 },
    { kind: 'bed', gx: 2, gy: 0, rot: 0 },
    { kind: 'nachtkastje', gx: 4, gy: 0, rot: 0 },
    { kind: 'kledingkast', gx: 0, gy: 4, rot: 1 },
  ],
  tuin: [
    { kind: 'boom', gx: 0, gy: 0, rot: 0 },
    { kind: 'tuinbank', gx: 3, gy: 0, rot: 0 },
    { kind: 'vuurkorf', gx: 4, gy: 3, rot: 0 },
    { kind: 'bloemen', gx: 6, gy: 5, rot: 0 },
  ],
  spelkamer: [
    { kind: 'trofeekast', gx: 0, gy: 2, rot: 1 },
    { kind: 'cadeautafel', gx: 5, gy: 0, rot: 0 },
    { kind: 'zitzak', gx: 3, gy: 3, rot: 0 },
  ],
};

export function roomItems(layout: HouseLayout | null, room: RoomId): PlacedItem[] {
  return layout?.rooms[room] ?? defaults[room];
}

export function unlockedRooms(level: number) {
  return rooms.filter(r => r.level <= level);
}

/** Every kind this couple owns, given its level and achievement items. */
export function ownedKinds(level: number, achievementItems: Set<HouseItemId>): ItemKind[] {
  const open = new Set(unlockedRooms(level).map(r => r.id));
  return kinds.filter(k => {
    if ('room' in k.from) return open.has(k.from.room);
    if ('achievement' in k.from) return achievementItems.has(k.from.achievement);
    return level >= k.from.level;
  });
}

/** Footprint size on the floor, after rotation. */
export function size(item: PlacedItem): [number, number] {
  const k = kindById.get(item.kind)!;
  return item.rot ? [k.d, k.w] : [k.w, k.d];
}

export function tilesOf(item: PlacedItem): [number, number][] {
  const [w, d] = size(item);
  const out: [number, number][] = [];
  for (let x = 0; x < w; x++) for (let y = 0; y < d; y++) out.push([item.gx + x, item.gy + y]);
  return out;
}

/** Whether `item` fits in the room without leaving it or overlapping another item. */
export function fits(item: PlacedItem, others: PlacedItem[]): boolean {
  const k = kindById.get(item.kind)!;
  if (k.place === 'wall') {
    if (item.gx < 0 || item.gx + k.w > GRID) return false;
    return others.every(o => {
      if (o.wall !== item.wall || o.kind === item.kind) return true;
      const ow = kindById.get(o.kind)!.w;
      return item.gx + k.w <= o.gx || o.gx + ow <= item.gx;
    });
  }
  const [w, d] = size(item);
  if (item.gx < 0 || item.gy < 0 || item.gx + w > GRID || item.gy + d > GRID) return false;
  const mine = new Set(tilesOf(item).map(t => t.join(',')));
  return others.every(o => {
    if (o.kind === item.kind || o.wall) return true;
    const ok = kindById.get(o.kind)!;
    // Flat items (rugs) only clash with other flat items; furniture may stand on a rug.
    if ((ok.place === 'flat') !== (k.place === 'flat')) return true;
    return tilesOf(o).every(t => !mine.has(t.join(',')));
  });
}

/** Tiles a figure cannot walk through. */
export function blockedTiles(items: PlacedItem[]): Set<string> {
  const out = new Set<string>();
  for (const it of items) {
    const k = kindById.get(it.kind)!;
    if (k.place === 'floor') tilesOf(it).forEach(t => out.add(t.join(',')));
  }
  return out;
}

export function itemAt(items: PlacedItem[], gx: number, gy: number): PlacedItem | undefined {
  return items.find(it => !it.wall && kindById.get(it.kind)!.place === 'floor' && tilesOf(it).some(([x, y]) => x === gx && y === gy));
}

/** Shortest walk on the grid. `goal` may be blocked (a seat); the path then ends on it. */
export function findPath(from: [number, number], goal: [number, number], blocked: Set<string>): [number, number][] | null {
  const key = (p: [number, number]) => p.join(',');
  const start = key(from);
  const target = key(goal);
  const prev = new Map<string, string | null>([[start, null]]);
  const queue: [number, number][] = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (key(cur) === target) {
      const path: [number, number][] = [];
      for (let k: string | null = target; k && k !== start; k = prev.get(k) ?? null) {
        path.unshift(k.split(',').map(Number) as [number, number]);
      }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next: [number, number] = [cur[0] + dx, cur[1] + dy];
      const k = key(next);
      if (next[0] < 0 || next[1] < 0 || next[0] >= GRID || next[1] >= GRID || prev.has(k)) continue;
      if (blocked.has(k) && k !== target) continue;
      prev.set(k, key(cur));
      queue.push(next);
    }
  }
  return null;
}

/** A free tile next to an item, closest to `near`. */
export function besideItem(item: PlacedItem, blocked: Set<string>, near: [number, number]): [number, number] | null {
  const own = new Set(tilesOf(item).map(t => t.join(',')));
  const options: [number, number][] = [];
  for (const [x, y] of tilesOf(item)) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const t: [number, number] = [x + dx, y + dy];
      const k = t.join(',');
      if (t[0] < 0 || t[1] < 0 || t[0] >= GRID || t[1] >= GRID || own.has(k) || blocked.has(k)) continue;
      options.push(t);
    }
  }
  options.sort((a, b) => Math.hypot(a[0] - near[0], a[1] - near[1]) - Math.hypot(b[0] - near[0], b[1] - near[1]));
  return options[0] ?? null;
}

export function freeTile(blocked: Set<string>, avoid: string[] = []): [number, number] {
  const free: [number, number][] = [];
  for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) {
    const k = `${x},${y}`;
    if (!blocked.has(k) && !avoid.includes(k)) free.push([x, y]);
  }
  return free[Math.floor(Math.random() * free.length)] ?? [GRID - 1, GRID - 1];
}

/** Puts a new item on the first spot where it fits, starting near the middle of the room. */
export function placeNew(kind: string, items: PlacedItem[]): PlacedItem | null {
  const k = kindById.get(kind);
  if (!k) return null;
  if (k.place === 'wall') {
    for (const wall of ['R', 'L'] as const) {
      for (let gx = 0; gx + k.w <= GRID; gx++) {
        const it: PlacedItem = { kind, gx, gy: 0, rot: 0, wall };
        if (fits(it, items)) return it;
      }
    }
    return null;
  }
  const mid = (GRID - 1) / 2;
  const spots: [number, number][] = [];
  for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) spots.push([x, y]);
  spots.sort((a, b) => Math.hypot(a[0] - mid, a[1] - mid) - Math.hypot(b[0] - mid, b[1] - mid));
  for (const [gx, gy] of spots) {
    for (const rot of [0, 1] as const) {
      const it: PlacedItem = { kind, gx, gy, rot };
      if (fits(it, items)) return it;
    }
  }
  return null;
}
