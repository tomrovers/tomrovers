import type { HouseItemId } from '../content';

export type RoomId = 'woonkamer' | 'slaapkamer' | 'tuin' | 'spelkamer';

export type Room = {
  id: RoomId;
  name: string;
  level: number; // connection level that unlocks the room
  floor: [string, string]; // checkerboard colors
  wall: string | null; // null = outdoors
};

export const rooms: Room[] = [
  { id: 'woonkamer', name: 'Woonkamer', level: 1, floor: ['#E9C9A9', '#E2BE9C'], wall: '#F6D7DC' },
  { id: 'slaapkamer', name: 'Slaapkamer', level: 2, floor: ['#D9C6E8', '#D0BBE1'], wall: '#E6DDF5' },
  { id: 'tuin', name: 'Tuin', level: 3, floor: ['#A9D49A', '#9ECB8F'], wall: null },
  { id: 'spelkamer', name: 'Spelkamer', level: 4, floor: ['#BFD3EE', '#B3C9E8'], wall: '#DCE7F7' },
];

/** What happens when you tap an object in the house. */
export type ItemAction = 'checkin' | 'kaarten' | 'spelen' | 'kompas' | 'avatar' | 'prestaties' | 'beloningen';

export const actionLabels: Record<ItemAction, string> = {
  checkin: 'Check-in van vandaag',
  kaarten: 'Gesprekskaarten',
  spelen: 'Samen spelen',
  kompas: 'Ons Kompas',
  avatar: 'Outfit wisselen',
  prestaties: 'Onze prestaties',
  beloningen: 'Beloningenpot',
};

export type ItemKind = {
  id: string;
  name: string;
  /** Floor footprint in tiles (unrotated). Wall items use w as their width along the wall. */
  w: number;
  d: number;
  place: 'floor' | 'flat' | 'wall'; // flat = lies on the floor, can be walked over
  seat?: boolean; // figures can sit on it
  action?: ItemAction;
  rooms: RoomId[]; // where it fits
  /** How you get it: as a starter in a room, from an achievement, or at a connection level. */
  from: { room: RoomId } | { achievement: HouseItemId } | { level: number };
};

export const kinds: ItemKind[] = [
  // Woonkamer
  { id: 'bank', name: 'Knusse bank', w: 2, d: 1, place: 'floor', seat: true, rooms: ['woonkamer', 'spelkamer'], from: { room: 'woonkamer' } },
  { id: 'salontafel', name: 'Salontafel met kaarten', w: 1, d: 1, place: 'floor', action: 'kaarten', rooms: ['woonkamer', 'tuin', 'spelkamer'], from: { room: 'woonkamer' } },
  { id: 'vloerkleed', name: 'Rond vloerkleed', w: 2, d: 2, place: 'flat', rooms: ['woonkamer', 'slaapkamer', 'spelkamer'], from: { room: 'woonkamer' } },
  { id: 'arcade', name: 'Arcadekast', w: 1, d: 1, place: 'floor', action: 'spelen', rooms: ['woonkamer', 'spelkamer'], from: { room: 'woonkamer' } },
  { id: 'raam', name: 'Raam', w: 1, d: 1, place: 'wall', rooms: ['woonkamer', 'slaapkamer', 'spelkamer'], from: { room: 'woonkamer' } },
  { id: 'kalender', name: 'Kalender', w: 1, d: 1, place: 'wall', action: 'checkin', rooms: ['woonkamer', 'slaapkamer'], from: { room: 'woonkamer' } },
  { id: 'prikbord', name: 'Prikbord vol inzichten', w: 1, d: 1, place: 'wall', action: 'kompas', rooms: ['woonkamer', 'slaapkamer', 'spelkamer'], from: { room: 'woonkamer' } },
  // Achievements
  { id: 'plant', name: 'Plantje', w: 1, d: 1, place: 'floor', rooms: ['woonkamer', 'slaapkamer', 'tuin', 'spelkamer'], from: { achievement: 'plant' } },
  { id: 'sfeerlamp', name: 'Sfeerlamp', w: 1, d: 1, place: 'floor', rooms: ['woonkamer', 'slaapkamer', 'tuin', 'spelkamer'], from: { achievement: 'sfeerlamp' } },
  { id: 'fotolijst', name: 'Gouden fotolijst', w: 1, d: 1, place: 'wall', rooms: ['woonkamer', 'slaapkamer', 'spelkamer'], from: { achievement: 'fotolijst' } },
  { id: 'boekenkast', name: 'Boekenkast', w: 1, d: 1, place: 'floor', rooms: ['woonkamer', 'slaapkamer', 'spelkamer'], from: { achievement: 'boekenkast' } },
  { id: 'kristallen-bol', name: 'Kristallen bol', w: 1, d: 1, place: 'floor', rooms: ['woonkamer', 'slaapkamer', 'tuin', 'spelkamer'], from: { achievement: 'kristallen-bol' } },
  { id: 'arcadetrofee', name: 'Arcadetrofee', w: 1, d: 1, place: 'floor', action: 'prestaties', rooms: ['woonkamer', 'slaapkamer', 'spelkamer'], from: { achievement: 'arcadetrofee' } },
  { id: 'poef', name: 'Zachte poef', w: 1, d: 1, place: 'floor', seat: true, rooms: ['woonkamer', 'slaapkamer', 'tuin', 'spelkamer'], from: { achievement: 'kussens' } },
  { id: 'kompas-schilderij', name: 'Kompas-schilderij', w: 1, d: 1, place: 'wall', rooms: ['woonkamer', 'slaapkamer', 'spelkamer'], from: { achievement: 'kompas-schilderij' } },
  { id: 'lichtslinger', name: 'Lichtslinger', w: 2, d: 1, place: 'wall', rooms: ['woonkamer', 'slaapkamer', 'spelkamer'], from: { achievement: 'lichtslinger' } },
  // Slaapkamer
  { id: 'bed', name: 'Tweepersoonsbed', w: 2, d: 2, place: 'floor', seat: true, rooms: ['slaapkamer'], from: { room: 'slaapkamer' } },
  { id: 'nachtkastje', name: 'Nachtkastje', w: 1, d: 1, place: 'floor', rooms: ['slaapkamer'], from: { room: 'slaapkamer' } },
  { id: 'kledingkast', name: 'Kledingkast', w: 1, d: 1, place: 'floor', action: 'avatar', rooms: ['slaapkamer'], from: { room: 'slaapkamer' } },
  { id: 'hartkleed', name: 'Hartjeskleed', w: 2, d: 1, place: 'flat', rooms: ['slaapkamer', 'woonkamer'], from: { room: 'slaapkamer' } },
  // Tuin
  { id: 'boom', name: 'Appelboom', w: 1, d: 1, place: 'floor', rooms: ['tuin'], from: { room: 'tuin' } },
  { id: 'tuinbank', name: 'Tuinbank', w: 2, d: 1, place: 'floor', seat: true, rooms: ['tuin'], from: { room: 'tuin' } },
  { id: 'vuurkorf', name: 'Vuurkorf', w: 1, d: 1, place: 'floor', rooms: ['tuin'], from: { room: 'tuin' } },
  { id: 'bloemen', name: 'Bloemenperk', w: 1, d: 1, place: 'floor', rooms: ['tuin'], from: { room: 'tuin' } },
  { id: 'hangmat', name: 'Hangmat', w: 2, d: 1, place: 'floor', seat: true, rooms: ['tuin'], from: { level: 4 } },
  // Spelkamer
  { id: 'trofeekast', name: 'Trofeeënkast', w: 1, d: 1, place: 'floor', action: 'prestaties', rooms: ['spelkamer'], from: { room: 'spelkamer' } },
  { id: 'cadeautafel', name: 'Beloningenpot', w: 1, d: 1, place: 'floor', action: 'beloningen', rooms: ['spelkamer', 'woonkamer'], from: { room: 'spelkamer' } },
  { id: 'zitzak', name: 'Zitzak', w: 1, d: 1, place: 'floor', seat: true, rooms: ['spelkamer', 'woonkamer', 'slaapkamer'], from: { room: 'spelkamer' } },
];

export const kindById = new Map(kinds.map(k => [k.id, k]));
