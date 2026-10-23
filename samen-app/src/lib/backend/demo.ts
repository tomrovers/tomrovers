import { kjmRoundQuestions } from '../content';
import { dayKey } from '../state';
import * as storage from '../storage';
import type { AvatarConfig, CheckInPayload, NewEvent, SamenEvent } from '../types';
import type { Backend, Session } from './types';

// The demo runs entirely on this device. A simulated partner answers after a short
// pause, so every feature can be tried without a server or a second phone.

const KEY = 'samen.demo.v1';
const ME = 'demo-me';
const PARTNER = 'demo-partner';
const COUPLE = 'demo-couple';

const partnerAvatar: AvatarConfig = { skin: 1, hair: 1, hairColor: 3, facialHair: 0, outfit: 2, accessory: 2 };

const cardAnswers: Record<string, string[]> = {
  liefde: ['Als je zomaar vraagt hoe het écht met me gaat.', 'Als je onverwacht een knuffel geeft.', 'Als je onthoudt wat ik vertelde.'],
  dagelijks: ['Een kop koffie in alle rust, voordat de dag begint.', 'Samen boodschappen doen en dan koken.', 'Een wandeling zonder telefoon.'],
  communicatie: ['Even een knuffel, en daarna pas praten.', 'Dat je eerst luistert voordat je oplossingen geeft.', 'Een rustig moment op de bank.'],
  dromen: ['Samen een roadtrip door Schotland.', 'Een huisje met een grote tuin.', 'Ooit een maand op reis zonder planning.'],
  intimiteit: ['Lekker tegen elkaar aan liggen op de bank.', 'Als je mijn hand pakt als we buiten lopen.', 'Een avond met alleen ons tweetjes.'],
};

type Stored = { coupleId: string | null; events: SamenEvent[] };

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export class DemoBackend implements Backend {
  readonly mode = 'demo' as const;
  private data: Stored = { coupleId: null, events: [] };
  private listeners = new Set<() => void>();

  async start(): Promise<Session> {
    try {
      const raw = await storage.load(KEY);
      if (raw) this.data = JSON.parse(raw);
    } catch {
      // A broken demo state simply starts fresh.
    }
    return this.session();
  }

  private session(): Session {
    const joined = !!this.data.coupleId;
    return { userId: ME, coupleId: this.data.coupleId, code: joined ? 'DEMO01' : null, memberIds: joined ? [ME, PARTNER] : [ME] };
  }

  private async save() {
    await storage.save(KEY, JSON.stringify(this.data));
    this.listeners.forEach(l => l());
  }

  private add(authorId: string, event: NewEvent) {
    this.data.events.push({ ...event, id: newId(), coupleId: COUPLE, authorId, createdAt: new Date().toISOString() } as SamenEvent);
  }

  private later(ms: number, fn: () => void) {
    setTimeout(() => {
      fn();
      void this.save();
    }, ms);
  }

  async createCouple(): Promise<Session> {
    this.data = { coupleId: COUPLE, events: [] };
    this.add(PARTNER, { type: 'profile', payload: { name: 'Sam', avatar: partnerAvatar }, visibility: 'public' });
    this.add(PARTNER, { type: 'gesture', payload: { kind: 'hartje' }, visibility: 'public' });
    await this.save();
    return this.session();
  }

  async joinCouple(): Promise<Session> {
    return this.createCouple();
  }

  async refreshSession(): Promise<Session> {
    return this.session();
  }

  async fetchEvents(): Promise<SamenEvent[]> {
    return [...this.data.events];
  }

  async post(event: NewEvent): Promise<void> {
    this.add(ME, event);
    await this.save();
    this.reactAsPartner(event);
  }

  subscribe(onChange: () => void) {
    this.listeners.add(onChange);
    return () => {
      this.listeners.delete(onChange);
    };
  }

  async leaveCouple(): Promise<void> {
    this.data = { coupleId: null, events: [] };
    await storage.remove(KEY);
    this.listeners.forEach(l => l());
  }

  private partnerHas(sealKey: string) {
    return this.data.events.some(e => e.authorId === PARTNER && e.sealKey === sealKey);
  }

  private reactAsPartner(event: NewEvent) {
    const sealKey = event.sealKey;
    if (sealKey && this.partnerHas(sealKey)) return;

    switch (event.type) {
      case 'checkin': {
        const payload: CheckInPayload = {
          day: dayKey(),
          mood: pick(['blij', 'ok', 'druk', 'moe']),
          energy: rand(2, 5),
          need: pick(['rust', 'aandacht', 'gezelligheid', 'intimiteit']),
          note: pick([undefined, 'Zin in vanavond!', 'Lange dag gehad, maar nu thuis.']),
        };
        this.later(1800, () => this.add(PARTNER, { type: 'checkin', payload, visibility: 'sealed', sealKey }));
        break;
      }
      case 'card.answer': {
        const theme = event.payload.cardId.split('-')[0];
        const text = pick(cardAnswers[theme] ?? cardAnswers.liefde);
        this.later(2000, () => this.add(PARTNER, { type: 'card.answer', payload: { cardId: event.payload.cardId, text }, visibility: 'sealed', sealKey }));
        break;
      }
      case 'kjm.submit': {
        const questions = kjmRoundQuestions(event.payload.round);
        const self = questions.map(q => rand(0, q.options.length - 1));
        // The demo partner knows you fairly well: most guesses are right.
        const guess = event.payload.self.map((answer, i) => (Math.random() < 0.6 ? answer : rand(0, questions[i].options.length - 1)));
        const round = event.payload.round;
        const myGuess = event.payload.guess;
        this.later(2200, () => {
          this.add(PARTNER, { type: 'kjm.submit', payload: { round, self, guess }, visibility: 'sealed', sealKey });
          const partnerScore = guess.filter((g, i) => g === event.payload.self[i]).length;
          const myScore = myGuess.filter((g, i) => g === self[i]).length;
          if (partnerScore > myScore) this.partnerClaims(`kjm:${round}`);
        });
        break;
      }
      case 'lovelang':
        if (!this.data.events.some(e => e.authorId === PARTNER && e.type === 'lovelang')) {
          this.later(1500, () =>
            this.add(PARTNER, {
              type: 'lovelang',
              payload: { qualitytime: 5, aanraking: 4, woorden: 3, hulp: 2, cadeautjes: 2 },
              visibility: 'public',
            }),
          );
        }
        break;
      case 'gesture':
        if (Math.random() < 0.5) {
          this.later(2500, () => this.add(PARTNER, { type: 'gesture', payload: { kind: pick(['hartje', 'knuffel', 'compliment']) }, visibility: 'public' }));
        }
        break;
      case 'game.result':
        if (event.payload.winnerId === PARTNER) this.partnerClaims(`reflex:${this.data.events[this.data.events.length - 1].id}`);
        break;
    }
  }

  private partnerClaims(gameKey: string) {
    const removed = new Set(this.data.events.filter(e => e.type === 'reward.remove').map(e => (e.payload as { id: string }).id));
    const rewards = this.data.events.filter(e => e.type === 'reward.add' && !removed.has((e.payload as { id: string }).id));
    if (!rewards.length) return;
    const reward = pick(rewards).payload as { id: string };
    this.later(2000, () => this.add(PARTNER, { type: 'reward.claim', payload: { gameKey, rewardId: reward.id }, visibility: 'public' }));
  }
}
