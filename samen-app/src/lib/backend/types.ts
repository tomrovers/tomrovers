import type { HouseLayout, Presence } from '../house/layout';
import type { NewEvent, SamenEvent } from '../types';

export type Session = {
  userId: string;
  coupleId: string | null;
  code: string | null; // invite code the partner uses to join
  memberIds: string[];
};

export interface Backend {
  readonly mode: 'demo' | 'cloud' | 'shared';
  start(): Promise<Session>;
  createCouple(): Promise<Session>;
  joinCouple(code: string): Promise<Session>;
  refreshSession(): Promise<Session>;
  fetchEvents(): Promise<SamenEvent[]>;
  post(event: NewEvent): Promise<void>;
  /** Calls onChange whenever new events may be available. Returns an unsubscribe function. */
  subscribe(onChange: () => void): () => void;
  /** Leaves the couple and removes this user's events from it. */
  leaveCouple(): Promise<void>;

  /** The couple's house: one shared layout, last writer wins. */
  loadHouse(): Promise<HouseLayout | null>;
  saveHouse(layout: HouseLayout): Promise<void>;
  subscribeHouse(onChange: (layout: HouseLayout | null) => void): () => void;

  /** Where my figure is right now; never stored, only shared with whoever is here. */
  setPresence(p: Presence): void;
  subscribePresence(onChange: (others: Presence[]) => void): () => void;
}

export class BackendError extends Error {}
