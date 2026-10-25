import { alignmentOf, alignQuestions, type AdLevel, type Alignment, type VonkReply, type WishAnswer } from './afterdark';
import {
  achievements,
  allCards,
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
export type DoneMission = { id: string; by: string; missionId: string; note?: string; day: string; at: string; seen: boolean };
export type AdAward = { id: string; sticker: string; from: string; to: string; status: 'open' | 'accepted' | 'declined' };
export type Vonk = { id: string; from: string; day: string; at: string; reply?: VonkReply };
/** vuur: you both want it a lot; lucht: you both feel like it. Below that nothing is shown, to either of you. */
export type SparkMatch = 'vuur' | 'lucht';
export type AfterDark = {
  mine?: { on: boolean; level: AdLevel };
  partnerOn: boolean;
  /** Open only when both switched it on; the mildest of the two moods applies. */
  active: boolean;
  level: AdLevel;
  wishes: Record<string, { mine?: WishAnswer; partner?: WishAnswer; partnerDone: boolean }>;
  /** Wishes you both answered with ja or misschien. A partner's nee is never shown. */
  matches: { wishId: string; both: 'ja' | 'misschien' }[];
  awards: AdAward[];
  /** Today's spark. The partner's number itself never reaches the screen, only a match. */
  spark: { mine?: number; match?: SparkMatch };
  /** Weekday on which your sparks match most often, once it happened at least twice. */
  rhythm?: string;
  vonken: Vonk[];
  align: Record<string, { mine?: number; partner?: number; partnerDone: boolean; alignment?: Alignment }>;
  trophies: Set<string>;
};
export type WeekDay = { day: string; label: string; checkins: number; acts: number; today: boolean };

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
  /** Today's own opdracht: picked (private) and whether it is done. */
  mission: { picked?: string; done?: DoneMission };
  /** Acts the partner did for me that I have not confirmed yet. */
  forMe: DoneMission[];
  /** Every act either of us did, newest first. */
  acts: DoneMission[];
  confirmedActs: number;
  week: WeekDay[];
  afterDark: AfterDark;
  /** Number of different weeks in which you played a game together. */
  playWeeks: number;
  playedThisWeek: boolean;
  unlocked: Set<string>; // achievement ids
  items: Set<HouseItemId>;
};

export const XP_PER_LEVEL = 80;
/** Weeks of playing together for the trophy "Couples who play together, stay together". */
export const PLAY_WEEKS = 4;

/** The Monday of the week the date falls in, as a day key. */
export function weekKey(date = new Date()): string {
  return dayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7)));
}

export const weekdayNames = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

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
  'mission.done': 10,
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
    mission: {},
    forMe: [],
    acts: [],
    confirmedActs: 0,
    week: [],
    afterDark: { partnerOn: false, active: false, level: 1, wishes: {}, matches: [], awards: [], spark: {}, vonken: [], align: {}, trophies: new Set() },
    playWeeks: 0,
    playedThisWeek: false,
    unlocked: new Set(),
    items: new Set(),
  };

  const checkins = new Map<string, { mine?: CheckInPayload; partner?: CheckInPayload }>();
  const kjmRounds = new Map<number, { mine?: KjmSubmission; partner?: KjmSubmission; at?: string }>();
  const sparks = new Map<string, { mine?: number; partner?: number }>();
  const vonkReplies = new Map<string, VonkReply>();
  const rewards = new Map<string, Reward>();
  const rewardTitles = new Map<string, string>();
  const reflexResults: { winnerId: string | null; at: string; id: string }[] = [];
  const claimsByGame = new Map<string, Claim>();
  const redeemed = new Set<string>();
  const seenActs = new Set<string>();
  let partnerAd: { on: boolean; level: AdLevel } | undefined;
  const awardStatus = new Map<string, 'accepted' | 'declined'>();

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
        r.at = e.createdAt;
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
      case 'mission.pick':
        if (mine && e.payload.day === state.today.day) state.mission.picked = e.payload.missionId;
        break;
      case 'mission.done':
        state.acts.push({ id: e.id, by: e.authorId, missionId: e.payload.missionId, note: e.payload.note, day: e.payload.day, at: e.createdAt, seen: false });
        break;
      case 'mission.seen':
        // Only the partner of the one who did the act can confirm it.
        if (state.acts.some(a => a.id === e.payload.doneId && a.by !== e.authorId)) seenActs.add(e.payload.doneId);
        break;
      case 'ad.optin':
        if (mine) state.afterDark.mine = e.payload;
        else partnerAd = e.payload;
        break;
      case 'ad.wish': {
        const w = (state.afterDark.wishes[e.payload.wishId] ??= { partnerDone: false });
        if (mine) w.mine = e.payload.answer;
        else w.partner = e.payload.answer;
        break;
      }
      case 'ad.award':
        state.afterDark.awards.push({ id: e.id, sticker: e.payload.sticker, from: e.authorId, to: e.payload.to, status: 'open' });
        break;
      case 'ad.accept':
        // Only the one who received the sticker decides.
        if (state.afterDark.awards.some(a => a.id === e.payload.awardId && a.to === e.authorId)) awardStatus.set(e.payload.awardId, e.payload.accept ? 'accepted' : 'declined');
        break;
      case 'ad.spark': {
        // You may change your mind during the day; the latest answer counts.
        const s = sparks.get(e.payload.day) ?? {};
        s[mine ? 'mine' : 'partner'] = e.payload.level;
        sparks.set(e.payload.day, s);
        break;
      }
      case 'ad.vonk':
        state.afterDark.vonken.push({ id: e.id, from: e.authorId, day: e.payload.day, at: e.createdAt });
        break;
      case 'ad.vonkReply':
        // Only the one who received the vonk answers it.
        if (state.afterDark.vonken.some(v => v.id === e.payload.vonkId && v.from !== e.authorId)) vonkReplies.set(e.payload.vonkId, e.payload.reply);
        break;
      case 'ad.align': {
        const a = (state.afterDark.align[e.payload.questionId] ??= { partnerDone: false });
        if (mine) a.mine = e.payload.answer;
        else if (e.payload.alignment) a.alignment = e.payload.alignment;
        else a.partner = e.payload.answer;
        break;
      }
    }
  }

  // Check-ins
  for (const [day, entry] of checkins) {
    if (entry.mine && entry.partner) state.sharedDays += 1;
    if (day === state.today.day) state.today = { day, ...entry, partnerDone: false };
  }
  state.today.partnerDone = !!state.today.partner || partnerSealedKeys.has(`checkin:${state.today.day}`);

  // After Dark
  const ad = state.afterDark;
  ad.partnerOn = !!partnerAd?.on;
  ad.active = !!ad.mine?.on && ad.partnerOn;
  ad.level = Math.min(ad.mine?.level ?? 1, partnerAd?.level ?? 1) as AdLevel;
  for (const [id, w] of Object.entries(ad.wishes)) {
    w.partnerDone = partnerSealedKeys.has(`ad:wish:${id}`);
    const yes = (a?: WishAnswer) => a === 'ja' || a === 'misschien';
    if (yes(w.mine) && yes(w.partner)) ad.matches.push({ wishId: id, both: w.mine === 'ja' && w.partner === 'ja' ? 'ja' : 'misschien' });
  }
  for (const a of ad.awards) a.status = awardStatus.get(a.id) ?? 'open';
  ad.awards.reverse();
  const matchOf = (s?: { mine?: number; partner?: number }): SparkMatch | undefined => {
    if (s?.mine === undefined || s.partner === undefined) return undefined;
    const low = Math.min(s.mine, s.partner);
    return low >= 3 ? 'vuur' : low >= 2 ? 'lucht' : undefined;
  };
  const todaySpark = sparks.get(state.today.day);
  ad.spark = { mine: todaySpark?.mine, match: matchOf(todaySpark) };
  const byWeekday = new Map<number, number>();
  let fireDays = 0;
  for (const [day, s] of sparks) {
    const m = matchOf(s);
    if (!m) continue;
    if (m === 'vuur') fireDays += 1;
    const [y, mo, d] = day.split('-').map(Number);
    const wd = new Date(y, mo - 1, d).getDay();
    byWeekday.set(wd, (byWeekday.get(wd) ?? 0) + 1);
  }
  const best = [...byWeekday].sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] >= 2) ad.rhythm = weekdayNames[best[0]];
  for (const v of ad.vonken) v.reply = vonkReplies.get(v.id);
  ad.vonken.reverse();
  for (const q of alignQuestions) {
    if (partnerSealedKeys.has(`ad:align:${q.id}`)) ad.align[q.id] ??= { partnerDone: true };
    const a = ad.align[q.id];
    if (!a) continue;
    a.partnerDone = partnerSealedKeys.has(`ad:align:${q.id}`);
    // The real server already sends the alignment; the demo and test page compare here.
    if (a.mine === undefined) a.alignment = undefined;
    else if (!a.alignment && a.partner !== undefined) a.alignment = alignmentOf(q, a.mine, a.partner);
  }
  if (alignQuestions.every(q => ad.align[q.id]?.alignment)) ad.trophies.add('op-een-lijn');
  if (fireDays >= 3) ad.trophies.add('vonkenregen');

  // Cards
  for (const card of allCards) {
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

  // Couples who play together, stay together: count the weeks in which you played.
  const playWeeks = new Set<string>();
  const weekOf = (at: string) => weekKey(new Date(at));
  for (const r of reflexResults) playWeeks.add(weekOf(r.at));
  for (const r of state.kjmHistory) {
    const at = kjmRounds.get(r.round)?.at;
    if (at) playWeeks.add(weekOf(at));
  }
  state.playWeeks = playWeeks.size;
  state.playedThisWeek = playWeeks.has(weekKey());

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

  // Opdrachten: an act counts once the partner confirms they noticed it.
  for (const a of state.acts) a.seen = seenActs.has(a.id);
  state.confirmedActs = state.acts.filter(a => a.seen).length;
  state.mission.done = state.acts.find(a => a.by === myId && a.day === state.today.day);
  state.forMe = state.acts.filter(a => a.by !== myId && !a.seen).reverse();
  state.acts.reverse();
  state.xp += state.confirmedActs * 20;

  // This week, Monday to Sunday.
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const labels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
  state.week = labels.map((label, i) => {
    const d = dayKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
    const c = checkins.get(d);
    return {
      day: d,
      label,
      checkins: (c?.mine ? 1 : 0) + (c?.partner ? 1 : 0),
      acts: state.acts.filter(a => a.day === d && a.seen).length,
      today: d === state.today.day,
    };
  });

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
    'samen-spelen': state.playWeeks >= PLAY_WEEKS,
  };
  for (const a of achievements) {
    if (checks[a.id]) {
      state.unlocked.add(a.id);
      if (a.item) state.items.add(a.item);
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
