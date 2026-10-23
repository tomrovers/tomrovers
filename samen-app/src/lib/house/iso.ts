// Isometric projection shared by the house scene and its sprites.
// Grid coordinates: gx runs to the lower right, gy to the lower left; z goes up.

export const TW = 64; // tile width in scene units
export const TH = 32; // tile height
export const ZH = 34; // one unit of height
export const GRID = 7; // every room is GRID x GRID tiles
export const WALL = 3.2; // wall height in units

export const SCENE_W = GRID * TW; // the floor diamond is exactly GRID * TW wide
export const ORIGIN_X = (GRID * TW) / 2;
export const ORIGIN_Y = WALL * ZH + 18;
export const SCENE_H = ORIGIN_Y + GRID * TH + 26;

/** Scene position of a floor point (in tiles) at height z. */
export function project(u: number, v: number, z = 0): [number, number] {
  return [ORIGIN_X + ((u - v) * TW) / 2, ORIGIN_Y + ((u + v) * TH) / 2 - z * ZH];
}

/** Floor point (in tiles, fractional) under a scene position. */
export function unproject(x: number, y: number): [number, number] {
  const a = (x - ORIGIN_X) / (TW / 2);
  const b = (y - ORIGIN_Y) / (TH / 2);
  return [(a + b) / 2, (b - a) / 2];
}

export const pts = (list: [number, number][]) => list.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/** Lighten (amount > 0) or darken (amount < 0) a #rrggbb color. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
  const r = mix(n >> 16);
  const g = mix((n >> 8) & 0xff);
  const b = mix(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
