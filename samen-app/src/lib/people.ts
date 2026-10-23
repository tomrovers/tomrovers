import type { CoupleState } from './state';
import type { Expression, Mood } from './types';

const HOUR = 60 * 60 * 1000;

function expressionFor(mood?: Mood, loved?: boolean): Expression {
  if (loved) return 'love';
  if (mood === 'blij') return 'happy';
  if (mood === 'moe' || mood === 'druk') return 'sleepy';
  return 'neutral';
}

/** How each avatar looks right now: based on today's check-in and recent love from the partner. */
export function expressions(state: CoupleState): { me: Expression; partner: Expression } {
  const recentFrom = (id?: string) => state.gestures.some(g => g.from === id && Date.now() - Date.parse(g.at) < HOUR);
  return {
    me: expressionFor(state.today.mine?.mood, recentFrom(state.partnerId)),
    partner: expressionFor(state.today.partner?.mood, recentFrom(state.myId)),
  };
}

export function nameOf(state: CoupleState, id?: string): string {
  if (id === state.myId) return state.me?.name ?? 'Jij';
  return state.partner?.name ?? 'Je partner';
}
