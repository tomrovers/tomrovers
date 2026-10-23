// Everything a couple does in Samen is stored as an event. The shared state of the
// couple (check-ins, answers, games, rewards, house) is derived from those events.

export type AvatarConfig = {
  skin: number;
  hair: number;
  hairColor: number;
  facialHair: number;
  outfit: number;
  accessory: number;
};

export type Expression = 'neutral' | 'happy' | 'love' | 'sleepy';

export type Profile = { name: string; avatar: AvatarConfig };

export type Mood = 'blij' | 'ok' | 'druk' | 'moe' | 'verdrietig';
export type Need = 'rust' | 'aandacht' | 'gezelligheid' | 'intimiteit' | 'ruimte';

export type CheckInPayload = {
  day: string; // YYYY-MM-DD in local time
  mood: Mood;
  energy: number; // 1-5
  need: Need;
  note?: string;
};

export type LoveLanguage = 'qualitytime' | 'aanraking' | 'woorden' | 'hulp' | 'cadeautjes';
export type LoveLanguageScores = Record<LoveLanguage, number>; // 1-5

export type GestureKind = 'compliment' | 'knuffel' | 'hartje' | 'bericht';

/**
 * public  – visible to both partners
 * sealed  – only visible to the partner once both have submitted an event with the same sealKey
 * private – only visible to the author
 */
export type Visibility = 'public' | 'sealed' | 'private';

export type EventBody =
  | { type: 'profile'; payload: Profile }
  | { type: 'checkin'; payload: CheckInPayload }
  | { type: 'card.answer'; payload: { cardId: string; text: string } }
  | { type: 'kjm.submit'; payload: { round: number; self: number[]; guess: number[] } }
  | { type: 'compass.note'; payload: { theme: string; text: string } }
  | { type: 'lovelang'; payload: LoveLanguageScores }
  | { type: 'gesture'; payload: { kind: GestureKind; text?: string } }
  | {
      type: 'game.result';
      payload: { game: 'reflex'; players: [string, string]; score: [number, number]; winnerId: string | null };
    }
  | { type: 'reward.add'; payload: { id: string; title: string } }
  | { type: 'reward.remove'; payload: { id: string } }
  | { type: 'reward.claim'; payload: { gameKey: string; rewardId: string } }
  | { type: 'reward.redeem'; payload: { claimId: string } }
  | { type: 'sealed.ping'; payload: { key: string } }
  | { type: 'mission.pick'; payload: { day: string; missionId: string } }
  | { type: 'mission.done'; payload: { day: string; missionId: string; note?: string } }
  | { type: 'mission.seen'; payload: { doneId: string } };

export type EventType = EventBody['type'];

export type NewEvent = EventBody & { visibility: Visibility; sealKey?: string };

export type SamenEvent = NewEvent & {
  id: string;
  coupleId: string;
  authorId: string;
  createdAt: string; // ISO timestamp
};
