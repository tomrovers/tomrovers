import { dayKey } from './state';
import type { CheckInPayload, GestureKind, LoveLanguageScores, NewEvent, Profile } from './types';

// Builders for every event the app can post, so screens never hand-craft visibility rules.

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const actions = {
  profile: (profile: Profile): NewEvent => ({ type: 'profile', payload: profile, visibility: 'public' }),

  checkIn: (payload: Omit<CheckInPayload, 'day'>): NewEvent => {
    const day = dayKey();
    return { type: 'checkin', payload: { ...payload, day }, visibility: 'sealed', sealKey: `checkin:${day}` };
  },

  answerCard: (cardId: string, text: string): NewEvent => ({
    type: 'card.answer',
    payload: { cardId, text },
    visibility: 'sealed',
    sealKey: `card:${cardId}`,
  }),

  submitKjm: (round: number, self: number[], guess: number[]): NewEvent => ({
    type: 'kjm.submit',
    payload: { round, self, guess },
    visibility: 'sealed',
    sealKey: `kjm:${round}`,
  }),

  note: (theme: string, text: string, isPrivate: boolean): NewEvent => ({
    type: 'compass.note',
    payload: { theme, text },
    visibility: isPrivate ? 'private' : 'public',
  }),

  loveLanguages: (scores: LoveLanguageScores, isPrivate: boolean): NewEvent => ({
    type: 'lovelang',
    payload: scores,
    visibility: isPrivate ? 'private' : 'public',
  }),

  gesture: (kind: GestureKind, text?: string): NewEvent => ({ type: 'gesture', payload: { kind, text }, visibility: 'public' }),

  reflexResult: (players: [string, string], score: [number, number]): NewEvent => ({
    type: 'game.result',
    payload: {
      game: 'reflex',
      players,
      score,
      winnerId: score[0] === score[1] ? null : score[0] > score[1] ? players[0] : players[1],
    },
    visibility: 'public',
  }),

  addReward: (title: string): NewEvent => ({ type: 'reward.add', payload: { id: newId(), title }, visibility: 'public' }),
  removeReward: (id: string): NewEvent => ({ type: 'reward.remove', payload: { id }, visibility: 'public' }),
  claimReward: (gameKey: string, rewardId: string): NewEvent => ({ type: 'reward.claim', payload: { gameKey, rewardId }, visibility: 'public' }),
  redeemReward: (claimId: string): NewEvent => ({ type: 'reward.redeem', payload: { claimId }, visibility: 'public' }),

  /** Picking stays private, so the act can still be a surprise. */
  pickMission: (missionId: string): NewEvent => ({ type: 'mission.pick', payload: { day: dayKey(), missionId }, visibility: 'private' }),
  missionDone: (missionId: string, note?: string): NewEvent => ({ type: 'mission.done', payload: { day: dayKey(), missionId, note }, visibility: 'public' }),
  missionSeen: (doneId: string): NewEvent => ({ type: 'mission.seen', payload: { doneId }, visibility: 'public' }),

  // After Dark
  adOptIn: (on: boolean, level: 1 | 2 | 3): NewEvent => ({ type: 'ad.optin', payload: { on, level }, visibility: 'public' }),
  /** Sealed: the partner's answer only opens up once you answered the same wish yourself. */
  adWish: (wishId: string, answer: 'ja' | 'misschien' | 'nee'): NewEvent => ({
    type: 'ad.wish',
    payload: { wishId, answer },
    visibility: 'sealed',
    sealKey: `ad:wish:${wishId}`,
  }),
  adAward: (sticker: string, to: string): NewEvent => ({ type: 'ad.award', payload: { sticker, to }, visibility: 'public' }),
  adAccept: (awardId: string, accept: boolean): NewEvent => ({ type: 'ad.accept', payload: { awardId, accept }, visibility: 'public' }),
};
