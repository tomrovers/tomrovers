import { kjmRoundQuestions } from '../content';
import { kindById } from '../house/catalog';
import { adStickers, alignQuestions, wishes } from '../afterdark';
import { missions } from '../missions';
import { besideItem, blockedTiles, freeTile, roomItems, tilesOf, type HouseLayout, type Presence } from '../house/layout';
import { dayKey } from '../state';
import * as storage from '../storage';
import type { AvatarConfig, CheckInPayload, NewEvent, SamenEvent } from '../types';
import type { Backend, Session } from './types';

// The demo runs entirely on this device. A simulated partner answers after a short
// pause, so every feature can be tried without a server or a second phone.

const KEY = 'samen.demo.v1';
const HOUSE_KEY = 'samen.demo.house';
const ME = 'demo-me';
const PARTNER = 'demo-partner';
const COUPLE = 'demo-couple';

/** The simulated partner in the demo. */
const PARTNER_NAME = 'Annelieke';
const partnerAvatar: AvatarConfig = { skin: 1, hair: 1, hairColor: 3, facialHair: 0, outfit: 2, accessory: 2 };

const cardAnswers: Record<string, string[]> = {
  liefde: ['Als je zomaar vraagt hoe het écht met me gaat.', 'Als je onverwacht een knuffel geeft.', 'Als je onthoudt wat ik vertelde.'],
  dagelijks: ['Een kop koffie in alle rust, voordat de dag begint.', 'Samen boodschappen doen en dan koken.', 'Een wandeling zonder telefoon.'],
  communicatie: ['Even een knuffel, en daarna pas praten.', 'Dat je eerst luistert voordat je oplossingen geeft.', 'Een rustig moment op de bank.'],
  dromen: ['Samen een roadtrip door Schotland.', 'Een huisje met een grote tuin.', 'Ooit een maand op reis zonder planning.'],
  intimiteit: ['Lekker tegen elkaar aan liggen op de bank.', 'Als je mijn hand pakt als we buiten lopen.', 'Een avond met alleen ons tweetjes.'],
  afterdark: ['Dat vertel ik je vanavond wel… 😏', 'Als je me zo aankijkt als gisteren.', 'Ons bed zou vooral heel hard lachen.'],
};

type Stored = { coupleId: string | null; events: SamenEvent[] };

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export class DemoBackend implements Backend {
  readonly mode = 'demo' as const;
  private data: Stored = { coupleId: null, events: [] };
  private listeners = new Set<() => void>();
  private house: HouseLayout | null = null;
  private houseListeners = new Set<(l: HouseLayout | null) => void>();
  private mine: Presence | null = null;
  private partner: Presence | null = null;
  private presenceListeners = new Set<(p: Presence[]) => void>();
  private wander: ReturnType<typeof setInterval> | null = null;

  async start(): Promise<Session> {
    try {
      const raw = await storage.load(KEY);
      if (raw) this.data = JSON.parse(raw);
      // Earlier demos had a partner called Sam; the demo partner is Annelieke now.
      for (const e of this.data.events) {
        if (e.type === 'profile' && e.authorId === PARTNER) e.payload = { ...e.payload, name: PARTNER_NAME };
      }
      const house = await storage.load(HOUSE_KEY);
      if (house) this.house = JSON.parse(house);
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
    this.add(PARTNER, { type: 'profile', payload: { name: PARTNER_NAME, avatar: partnerAvatar }, visibility: 'public' });
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
    const id = this.data.events[this.data.events.length - 1].id;
    await this.save();
    this.reactAsPartner(event, id);
  }

  subscribe(onChange: () => void) {
    this.listeners.add(onChange);
    return () => {
      this.listeners.delete(onChange);
    };
  }

  async leaveCouple(): Promise<void> {
    this.data = { coupleId: null, events: [] };
    this.house = null;
    await Promise.all([storage.remove(KEY), storage.remove(HOUSE_KEY)]);
    this.listeners.forEach(l => l());
  }

  async loadHouse() {
    return this.house;
  }

  async saveHouse(layout: HouseLayout) {
    this.house = layout;
    await storage.save(HOUSE_KEY, JSON.stringify(layout));
    this.houseListeners.forEach(l => l(layout));
  }

  subscribeHouse(onChange: (l: HouseLayout | null) => void) {
    this.houseListeners.add(onChange);
    return () => {
      this.houseListeners.delete(onChange);
    };
  }

  setPresence(p: Presence) {
    const moved = this.mine?.room !== p.room;
    this.mine = p;
    // Annelieke follows you into a new room after a moment.
    if (moved) setTimeout(() => this.partnerWalks(), 1200);
  }

  subscribePresence(onChange: (others: Presence[]) => void) {
    this.presenceListeners.add(onChange);
    if (this.partner) onChange([this.partner]);
    this.wander ??= setInterval(() => this.partnerWalks(), 9000);
    return () => {
      this.presenceListeners.delete(onChange);
      if (!this.presenceListeners.size && this.wander) {
        clearInterval(this.wander);
        this.wander = null;
      }
    };
  }

  /** Annelieke strolls around the room you are in, and now and then sits down. */
  private partnerWalks(toYou = false) {
    if (!this.mine) return;
    const items = roomItems(this.house, this.mine.room);
    const blocked = blockedTiles(items);
    const me = `${this.mine.gx},${this.mine.gy}`;
    let spot: Presence = { uid: PARTNER, room: this.mine.room, gx: 0, gy: 0, seat: false, at: Date.now() };
    const seats = items.filter(it => kindById.get(it.kind)?.seat);
    if (toYou) {
      const near = besideItem({ kind: 'plant', gx: this.mine.gx, gy: this.mine.gy, rot: 0 }, blocked, [this.mine.gx, this.mine.gy]);
      if (near) spot = { ...spot, gx: near[0], gy: near[1] };
    } else if (seats.length && Math.random() < 0.3) {
      const free = tilesOf(pick(seats)).filter(t => t.join(',') !== me);
      if (free.length) spot = { ...spot, gx: free[0][0], gy: free[0][1], seat: true };
    } else {
      const [gx, gy] = freeTile(blocked, [me]);
      spot = { ...spot, gx, gy };
    }
    this.partner = spot;
    this.presenceListeners.forEach(l => l([spot]));
  }

  private partnerHas(sealKey: string) {
    return this.data.events.some(e => e.authorId === PARTNER && e.sealKey === sealKey);
  }

  private reactAsPartner(event: NewEvent, id: string) {
    const sealKey = event.sealKey;
    if (sealKey && this.partnerHas(sealKey)) return;

    switch (event.type) {
      case 'ad.optin':
        // Annelieke is always in, at the boldest mood; the mildest of the two choices applies.
        if (event.payload.on && !this.data.events.some(e => e.authorId === PARTNER && e.type === 'ad.optin')) {
          this.later(1500, () => this.add(PARTNER, { type: 'ad.optin', payload: { on: true, level: 3 }, visibility: 'public' }));
          this.later(6000, () => this.add(PARTNER, { type: 'ad.award', payload: { sticker: pick(adStickers).id, to: ME }, visibility: 'public' }));
        }
        break;
      case 'ad.wish': {
        const w = wishes.find(x => x.id === event.payload.wishId);
        if (w) this.later(1200, () => this.add(PARTNER, { type: 'ad.wish', payload: { wishId: w.id, answer: pick(['ja', 'ja', 'misschien', 'nee']) }, visibility: 'sealed', sealKey }));
        break;
      }
      case 'ad.spark':
        // Annelieke answers once a day, with some zin: 2 to 4 flames.
        this.later(1500, () => this.add(PARTNER, { type: 'ad.spark', payload: { day: event.payload.day, level: rand(2, 4) }, visibility: 'sealed', sealKey }));
        // ... and sends a vonk of their own, so you can see what receiving one looks like.
        if (event.payload.level >= 2 && !this.data.events.some(e => e.authorId === PARTNER && e.type === 'ad.vonk' && e.payload.day === event.payload.day)) {
          this.later(5000, () => this.add(PARTNER, { type: 'ad.vonk', payload: { day: event.payload.day }, visibility: 'public' }));
        }
        break;
      case 'ad.align': {
        const q = alignQuestions.find(x => x.id === event.payload.questionId);
        if (q) this.later(1200, () => this.add(PARTNER, { type: 'ad.align', payload: { questionId: q.id, answer: rand(0, q.options.length - 1) }, visibility: 'sealed', sealKey }));
        break;
      }
      case 'ad.vonk':
        this.later(2000, () => this.add(PARTNER, { type: 'ad.vonkReply', payload: { vonkId: id, reply: 'ja' }, visibility: 'public' }));
        break;
      case 'ad.award':
        this.later(2000, () => this.add(PARTNER, { type: 'ad.accept', payload: { awardId: id, accept: true }, visibility: 'public' }));
        break;
      case 'mission.done':
        this.later(3000, () => this.add(PARTNER, { type: 'mission.seen', payload: { doneId: id }, visibility: 'public' }));
        break;
      case 'checkin': {
        // Annelieke does something sweet for you too, once a day.
        const today = dayKey();
        if (!this.data.events.some(e => e.authorId === PARTNER && e.type === 'mission.done' && e.payload.day === today)) {
          const m = pick(missions);
          const note = pick([undefined, 'Zomaar, omdat ik je lief vind.', 'Hoop dat je het merkte!']);
          this.later(4500, () => this.add(PARTNER, { type: 'mission.done', payload: { day: today, missionId: m.id, note }, visibility: 'public' }));
        }
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
        const theme = event.payload.cardId.startsWith('ad') ? 'afterdark' : event.payload.cardId.split('-')[0];
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
        setTimeout(() => this.partnerWalks(true), 600);
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
