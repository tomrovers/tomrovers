import type { Href } from 'expo-router';

import type { CardTone } from '@/theme';

import type { CoupleState } from './state';

// Every part of Samen is a "station": a place you go to do one thing together. Today the
// stations are cards on the Vandaag screen; later each becomes a spot in the 3D house
// (the calendar, the card box, the game cabinet). New features are added here and
// nothing else needs to know about them.

export type Station = {
  id: string;
  title: string;
  /** What you do there, in a few words. */
  blurb: string;
  emoji: string;
  tone: CardTone;
  route: Href;
  /** Where it would stand in the house, for the 3D version later. */
  houseSpot: string;
  /** A short note when something is waiting for you here. */
  waiting?: (s: CoupleState) => string | null;
  /** Shown in the night look of After Dark. */
  dark?: boolean;
};

export const stations: Station[] = [
  {
    id: 'kaarten',
    title: 'Gesprekskaarten',
    blurb: 'Vragen die een gesprek op gang brengen',
    emoji: '🃏',
    tone: 'lav',
    route: '/kaarten',
    houseSpot: 'de kaartendoos op tafel',
    waiting: s => (Object.values(s.cards).some(c => c.partnerDone && !c.mine) ? 'Er wacht een antwoord op jou' : null),
  },
  {
    id: 'spelen',
    title: 'Samen spelen',
    blurb: 'Ken je mij? en Reflex Battle',
    emoji: '🎲',
    tone: 'mint',
    route: '/spelen',
    houseSpot: 'de spelletjeskast',
    waiting: s => (s.kjm.partnerDone && !s.kjm.mine ? 'Jij bent aan de beurt' : null),
  },
  {
    id: 'kompas',
    title: 'Ons Kompas',
    blurb: 'Wat jullie over elkaar weten',
    emoji: '🧭',
    tone: 'blue',
    route: '/kompas',
    houseSpot: 'het prikbord',
    waiting: s => (!s.loveLang.mine ? 'Vul je liefdestalen in' : null),
  },
  {
    id: 'beloningen',
    title: 'Beloningenpot',
    blurb: 'Wat de winnaar mag kiezen',
    emoji: '🎁',
    tone: 'peach',
    route: '/beloningen',
    houseSpot: 'de cadeautafel',
    waiting: s => (s.openWins.some(w => w.winnerId === s.myId) ? 'Kies je beloning' : null),
  },
  {
    id: 'afterdark',
    title: 'After Dark',
    blurb: 'Vonk, afstemmen, wensen en stickers · 18+',
    emoji: '😈',
    tone: 'lav',
    dark: true,
    route: '/afterdark',
    houseSpot: 'de slaapkamerdeur, die alleen samen opengaat',
    waiting: s => {
      const ad = s.afterDark;
      if (!ad.active) return ad.mine?.on ? 'Staat aan voor jou' : null;
      if (ad.spark.match === 'vuur') return 'Jullie hebben allebei veel zin 🔥';
      if (ad.awards.some(a => a.to === s.myId && a.status === 'open')) return 'Er wacht een sticker op je';
      if (Object.entries(s.cards).some(([id, c]) => id.startsWith('ad') && c.partnerDone && !c.mine)) return 'Er wacht een antwoord op jou';
      return null;
    },
  },
  {
    id: 'prestaties',
    title: 'Stickerboek',
    blurb: 'Wat jullie samen verdienden',
    emoji: '🏅',
    tone: 'pink',
    route: '/prestaties',
    houseSpot: 'de prijzenkast',
  },
];
