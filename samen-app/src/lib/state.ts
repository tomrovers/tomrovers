import {
  achievements,
  cards,
  kjmRoundQuestions,
  loveLanguages,
  type HouseItemId,
} from './content';
import type {
  CheckInPayload,
  GestureKind,
  LoveLanguageScores,
  Profile,
  SamenEvent,
} from './types';

export type CheckInDay = { day: string; mine?: CheckInPayload; partner?: CheckInPayload; partnerDone: boolean };
export type CardState = { mine?: string; partner?: string; partnerDone: boolean };
export type KjmSubmission = { self: number[]; guess: number[] };
export type KjmRound = {
  round: number;
  mine?: KjmSubmission;
  partner?: KjmSubmission;
  partnerDone: boolean;
  result?: { myScore: number; partnerScore: number };
};
export type Claim = { id: string; gameKey: string; rewardTitle: string; winnerId: string; redeemed: boolean; at: string };
export type Win = { gameKey: string; title: string; winnerId: string; at: string; claim?: Claim };
export type Gesture = { id: string; from: string; kind: GestureKind; text?: string; at: string };
export type CompassNote = { id: string; authorId: string; theme: string; text: string; private: boolean; at: string };
export type Reward = { id: string; title: string };

export type CoupleState = {
  myId: string;
  partnerId?: string;
  me?: Profile;
  partner?: Profile;
  xp: number;
  level: number;
  levelProgress: number; // 0..1 within the current level
  today: CheckInDay;
  sharedDays: number;
  cards: Record<string, CardState>;
  cardsAnsweredTogether: number;
  kjm: KjmRound; // the round that is currently open
  kjmHistory: KjmRound[];
  gamesPlayed: number;
  wins: Win[];
  openWins: Win[]; // won games where the winner has not picked a reward yet
  claims: Claim[];
  rewards: Reward[];
  gestures: Gesture[];
  compass: CompassNote[];
  loveLang: { mine?: LoveLanguageScores; partner?: LoveLanguageScores; minePrivate: boolean };
  unlocked: Set<string>; // achievement ids
  items: Set<HouseItemId>;
};

export const XP_PER_LEVEL = 120;

export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const xpFor: Partial<Record<SamenEvent['type'], number>> = {
  checkin: 10,
  'card.answer': 10,
  'kjm.submit': 15,
  'compass.note': 5,
  lovelang: 10,
  gesture: 5,
  'game.result': 15,
  'reward.redeem': 10,
};

export function deriveState(all: SamenEvent[], myId: string, memberIds: string[]): CoupleState {
  const events = [...all].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const partnerId = memberIds.find(id => id !== myId) ?? events.find(e => e.authorId !== myId)?.authorId;

  const mySealedKeys = new Set(events.filter(e => e.authorId === myId && e.sealKey).map(e => e.sealKey!));
  const partnerSealedKeys = new Set<string>();
  for (const e of events) {
    if (e.authorId === partnerId && e.sealKey) partnerSealedKeys.add(e.sealKey);
    if (e.authorId === partnerId && e.type === 'sealed.ping') partnerSealedKeys.add(e.payload.key);
  }
  // The server already enforces this; applying it here as well keeps the demo honest.
  const visible = events.filter(e => {
    if (e.authorId === myId || e.visibility === 'public') return true;
    if (e.visibility === 'sealed') return !!e.sealKey && mySealedKeys.has(e.sealKey);
    return false;
  });

  const state: CoupleState = {
    myId,
    partnerId,
    xp: 0,
    level: 1,
    levelProgress: 0,
    today: { day: dayKey(), partnerDone: false },
    sharedDays: 0,
    cards: {},
    cardsAnsweredTogether: 0,
    kjm: { round: 1, partnerDone: false },
    kjmHistory: [],
    gamesPlayed: 0,
    wins: [],
    openWins: [],
    claims: [],
    rewards: [],
    gestures: [],
    compass: [],
    loveLang: { minePrivate: false },
    unlocked: new Set(),
    items: new Set(),
  };

  const checkins = new Map<string, { mine?: CheckInPayload; partner?: CheckInPayload }>();
  const kjmRounds = new Map<number, { mine?: KjmSubmission; partner?: KjmSubmission }>();
  const rewards = new Map<string, Reward>();
  const rewardTitles = new Map<string, string>();
  const reflexResults: { winnerId: string | null; at: string; id: string }[] = [];
  const claimsByGame = new Map<string, Claim>();
  const redeemed = new Set<string>();

  for (const e of visible) {
    const mine = e.authorId === myId;
    state.xp += xpFor[e.type] ?? 0;
    switch (e.type) {
      case 'profile':
        if (mine) state.me = e.payload;
        else state.partner = e.payload;
        break;
      case 'checkin': {
        const entry = checkins.get(e.payload.day) ?? {};
        entry[mine ? 'mine' : 'partner'] = e.payload;
        checkins.set(e.payload.day, entry);
        break;
      }
      case 'card.answer': {
        const c = (state.cards[e.payload.cardId] ??= { partnerDone: false });
        if (mine) c.mine = e.payload.text;
        else c.partner = e.payload.text;
        break;
      }
      case 'kjm.submit': {
        const r = kjmRounds.get(e.payload.round) ?? {};
        r[mine ? 'mine' : 'partner'] = { self: e.payload.self, guess: e.payload.guess };
        kjmRounds.set(e.payload.round, r);
        break;
      }
      case 'compass.note':
        state.compass.push({ id: e.id, authorId: e.authorId, theme: e.payload.theme, text: e.payload.text, private: e.visibility === 'private', at: e.createdAt });
        break;
      case 'lovelang':
        if (mine) {
          state.loveLang.mine = e.payload;
          state.loveLang.minePrivate = e.visibility === 'private';
        } else {
          state.loveLang.partner = e.payload;
        }
        break;
      case 'gesture':
        state.gestures.push({ id: e.id, from: e.authorId, kind: e.payload.kind, text: e.payload.text, at: e.createdAt });
        break;
      case 'game.result':
        state.gamesPlayed += 1;
        reflexResults.push({ winnerId: e.payload.winnerId, at: e.createdAt, id: e.id });
        break;
      case 'reward.add':
        rewards.set(e.payload.id, { id: e.payload.id, title: e.payload.title });
        rewardTitles.set(e.payload.id, e.payload.title);
        break;
      case 'reward.remove':
        rewards.delete(e.payload.id);
        break;
      case 'reward.claim':
        if (!claimsByGame.has(e.payload.gameKey)) {
          claimsByGame.set(e.payload.gameKey, {
            id: e.id,
            gameKey: e.payload.gameKey,
            rewardTitle: rewardTitles.get(e.payload.rewardId) ?? 'Een verrassing',
            winnerId: e.authorId,
            redeemed: false,
            at: e.createdAt,
          });
        }
        break;
      case 'reward.redeem':
        redeemed.add(e.payload.claimId);
        break;
    }
  }

  // Check-ins
  for (const [day, entry] of checkins) {
    if (entry.mine && entry.partner) state.sharedDays += 1;
    if (day === state.today.day) state.today = { day, ...entry, partnerDone: false };
  }
  state.today.partnerDone = !!state.today.partner || partnerSealedKeys.has(`checkin:${state.today.day}`);

  // Cards
  for (const card of cards) {
    const key = `card:${card.id}`;
    if (!partnerSealedKeys.has(key) && !state.cards[card.id]) continue;
    const c = (state.cards[card.id] ??= { partnerDone: false });
    c.partnerDone = partnerSealedKeys.has(key);
    if (c.mine && c.partner) state.cardsAnsweredTogether += 1;
  }

  // Ken je mij?
  let round = 1;
  for (;;) {
    const r = kjmRounds.get(round);
    if (!(r?.mine && r.partner)) break;
    const questions = kjmRoundQuestions(round);
    const score = (guess: number[], truth: number[]) => questions.filter((_, i) => guess[i] === truth[i]).length;
    const done: KjmRound = {
      round,
      ...r,
      partnerDone: true,
      result: { myScore: score(r.mine.guess, r.partner.self), partnerScore: score(r.partner.guess, r.mine.self) },
    };
    state.kjmHistory.push(done);
    state.gamesPlayed += 1;
    round += 1;
  }
  const open = kjmRounds.get(round);
  state.kjm = { round, mine: open?.mine, partnerDone: partnerSealedKeys.has(`kjm:${round}`) };

  // Wins and rewards
  for (const r of reflexResults) {
    if (r.winnerId) state.wins.push({ gameKey: `reflex:${r.id}`, title: 'Reflex Battle', winnerId: r.winnerId, at: r.at });
  }
  for (const r of state.kjmHistory) {
    const { myScore, partnerScore } = r.result!;
    if (myScore === partnerScore || !partnerId) continue;
    state.wins.push({ gameKey: `kjm:${r.round}`, title: 'Ken je mij?', winnerId: myScore > partnerScore ? myId : partnerId, at: '' });
  }
  for (const claim of claimsByGame.values()) claim.redeemed = redeemed.has(claim.id);
  state.claims = [...claimsByGame.values()].reverse();
  for (const w of state.wins) w.claim = claimsByGame.get(w.gameKey);
  state.openWins = state.wins.filter(w => !w.claim);
  state.rewards = [...rewards.values()];
  state.gestures.reverse();
  state.compass.reverse();

  // Level
  state.level = Math.floor(state.xp / XP_PER_LEVEL) + 1;
  state.levelProgress = (state.xp % XP_PER_LEVEL) / XP_PER_LEVEL;

  // Achievements unlock items in the house
  const compliments = state.gestures.filter(g => g.kind === 'compliment' || g.kind === 'bericht').length;
  let revenge = false;
  for (let i = 1; i < reflexResults.length; i++) {
    const prev = reflexResults[i - 1];
    const cur = reflexResults[i];
    if (prev.winnerId && cur.winnerId && prev.winnerId !== cur.winnerId) revenge = true;
  }
  const checks: Record<string, boolean> = {
    'eerste-dagbeeld': state.sharedDays >= 1,
    'qualitytime-helden': state.sharedDays >= 7,
    'de-charmeur': compliments >= 5,
    'diepe-gesprekken': state.cardsAnsweredTogether >= 5,
    'de-gedachtenlezer': state.kjmHistory.some(r => r.result!.myScore >= 4 || r.result!.partnerScore >= 4),
    'de-revanchekoning': revenge,
    verwenmoment: state.claims.some(c => c.redeemed),
    'kompas-ontdekkers': !!state.loveLang.mine && !!state.loveLang.partner,
    spelletjesavond: state.gamesPlayed >= 5,
  };
  for (const a of achievements) {
    if (checks[a.id]) {
      state.unlocked.add(a.id);
      state.items.add(a.item);
    }
  }

  return state;
}

export function daySuggestion(mine: CheckInPayload, partner: CheckInPayload, partnerName: string): string {
  const needs = [mine.need, partner.need];
  const tired = (c: CheckInPayload) => c.need === 'rust' || c.energy <= 2 || c.mood === 'moe';
  const oneTired = tired(mine) !== tired(partner);
  if (needs.every(n => n === 'rust')) return 'Jullie hebben allebei zin in rust. Een dekentje, thee en een fijne serie?';
  if (needs.includes('ruimte')) return 'Een van jullie heeft even tijd voor zichzelf nodig. Spreek af wanneer jullie weer samen bijkletsen.';
  if (oneTired) {
    const who = tired(mine) ? 'Jij bent' : `${partnerName} is`;
    return `${who} toe aan rust. Maak er een rustig avondje samen van, met een klein liefdevol moment: een knuffel op de bank of een kop thee.`;
  }
  if (tired(mine) && tired(partner)) return 'Het was voor jullie allebei een drukke dag. Houd het klein en lief: een knuffel en vroeg naar bed.';
  if (needs.includes('intimiteit')) return 'Maak tijd voor een romantisch moment, met kaarsjes of een lange knuffel.';
  if (needs.includes('aandacht')) return `Neem tien minuten om echt te vragen hoe de dag van ${partnerName} was.`;
  if (needs.includes('gezelligheid')) return 'Genoeg energie voor gezelligheid: samen koken of een potje in de Playground?';
  return 'Een gewone fijne dag. Een klein gebaar maakt hem extra mooi.';
}

export function loveLanguageTip(scores?: LoveLanguageScores): string | undefined {
  if (!scores) return undefined;
  const top = loveLanguages.reduce((best, l) => (scores[l.id] > scores[best.id] ? l : best), loveLanguages[0]);
  return top.tip;
}
