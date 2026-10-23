import type { NewEvent, SamenEvent } from '../types';

export type Session = {
  userId: string;
  coupleId: string | null;
  code: string | null; // invite code the partner uses to join
  memberIds: string[];
};

export interface Backend {
  readonly mode: 'demo' | 'cloud';
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
}

export class BackendError extends Error {}
