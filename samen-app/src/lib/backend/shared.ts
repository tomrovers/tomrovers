import { dayKey } from '../state';
import * as storage from '../storage';
import type { NewEvent, SamenEvent } from '../types';
import type { Backend, Session } from './types';

// Test backend for the web version published as a claude.ai artifact. Both partners open
// the same page; its built-in shared database keeps the couple's events and pushes changes
// live. One couple per page. Each person writes one document per day, so the page stays
// well within the database's document limits.

type DocSnap = { id: string; exists: boolean; data(): Record<string, unknown> | undefined };
type QuerySnap = { docs: DocSnap[] };
type DocRef = {
  get(): Promise<DocSnap>;
  set(data: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
  onSnapshot(next: (s: DocSnap) => void, error?: (e: unknown) => void): () => void;
};
type CollectionRef = {
  doc(id: string): DocRef;
  where(field: string, op: string, value: unknown): { get(): Promise<QuerySnap> };
  get(): Promise<QuerySnap>;
  onSnapshot(next: (s: QuerySnap) => void, error?: (e: unknown) => void): () => void;
};
type Db = { doc(path: string): DocRef; collection(path: string): CollectionRef };
type User = { id(): Promise<string | null> };
type ClaudeHost = { use(name: string): Promise<unknown> };

const COUPLE = 'main';
const LOG = `couples/${COUPLE}/log`;
const DEVICE_KEY = 'samen.shared.device';
const LOCAL_PRIVATE_KEY = 'samen.shared.private';

let handles: Promise<{ db: Db; user: User | null } | null> | null = null;

/** Resolves the page's shared database when the app runs inside a claude.ai artifact. */
export function detectShared() {
  handles ??= (async () => {
    const host = (globalThis as { claude?: ClaudeHost }).claude;
    if (typeof host?.use !== 'function') return null;
    try {
      const [db, user] = await Promise.all([host.use('db'), host.use('user')]);
      return db ? { db: db as Db, user: (user as User | null) ?? null } : null;
    } catch {
      return null;
    }
  })();
  return handles;
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

async function deviceId(): Promise<string> {
  const saved = await storage.load(DEVICE_KEY);
  if (saved) return saved;
  const id = `device-${newId()}`;
  await storage.save(DEVICE_KEY, id);
  return id;
}

export class SharedBackend implements Backend {
  readonly mode = 'shared' as const;
  private db!: Db;
  private me = '';
  private hasPrivateSpace = false;
  private shared = new Map<string, SamenEvent[]>(); // log document id -> its events
  private privateEvents: SamenEvent[] = [];
  private writes: Promise<void> = Promise.resolve();

  async start(): Promise<Session> {
    const h = await detectShared();
    if (!h) throw new Error('De gedeelde database van deze pagina is niet beschikbaar.');
    this.db = h.db;
    const userId = await h.user?.id();
    // Some invited guests get no account id here; they are then recognised by this device.
    this.me = userId ?? (await deviceId());
    this.hasPrivateSpace = !!userId;
    const [log, priv] = await Promise.all([this.db.collection(LOG).get(), this.loadPrivate()]);
    this.applyLog(log);
    this.privateEvents = priv;
    return this.session();
  }

  private applyLog(snap: QuerySnap) {
    this.shared.clear();
    for (const d of snap.docs) {
      const events = d.data()?.events;
      if (Array.isArray(events)) this.shared.set(d.id, events as SamenEvent[]);
    }
  }

  private privateRef() {
    return this.db.doc(`data/users/${this.me}/private`);
  }

  private async loadPrivate(): Promise<SamenEvent[]> {
    if (!this.hasPrivateSpace) return JSON.parse((await storage.load(LOCAL_PRIVATE_KEY)) ?? '[]');
    const snap = await this.privateRef().get();
    const events = snap.data()?.events;
    return Array.isArray(events) ? (events as SamenEvent[]) : [];
  }

  private allEvents(): SamenEvent[] {
    return [...[...this.shared.values()].flat(), ...this.privateEvents];
  }

  private session(): Session {
    // The couple is the first two people who made a profile on this page.
    const authors: string[] = [];
    for (const e of [...this.allEvents()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      if (e.type === 'profile' && !authors.includes(e.authorId)) authors.push(e.authorId);
    }
    const members = authors.slice(0, 2);
    if (!members.includes(this.me)) members.unshift(this.me);
    return { userId: this.me, coupleId: COUPLE, code: null, memberIds: members };
  }

  async createCouple(): Promise<Session> {
    return this.session();
  }

  async joinCouple(): Promise<Session> {
    return this.session();
  }

  async refreshSession(): Promise<Session> {
    return this.session();
  }

  async fetchEvents(): Promise<SamenEvent[]> {
    return this.allEvents();
  }

  /** Whether anyone already started this page (used to seed the reward pot only once). */
  hasEvents() {
    return this.shared.size > 0;
  }

  async post(event: NewEvent): Promise<void> {
    const full = { ...event, id: newId(), coupleId: COUPLE, authorId: this.me, createdAt: new Date().toISOString() } as SamenEvent;
    // Writes go one at a time, so two quick taps never overwrite each other.
    const write = this.writes.then(async () => {
      if (event.visibility === 'private') {
        this.privateEvents = [...this.privateEvents, full];
        if (this.hasPrivateSpace) await this.privateRef().set({ events: this.privateEvents });
        else await storage.save(LOCAL_PRIVATE_KEY, JSON.stringify(this.privateEvents));
        return;
      }
      const docId = `${this.me}~${dayKey()}`;
      const events = [...(this.shared.get(docId) ?? []), full];
      this.shared.set(docId, events);
      await this.db.collection(LOG).doc(docId).set({ author: this.me, events });
    });
    this.writes = write.catch(() => undefined);
    await write;
  }

  subscribe(onChange: () => void) {
    const stops = [
      this.db.collection(LOG).onSnapshot(
        snap => {
          this.applyLog(snap);
          onChange();
        },
        e => console.warn('Live bijwerken gestopt', e),
      ),
    ];
    if (this.hasPrivateSpace) {
      stops.push(
        this.privateRef().onSnapshot(snap => {
          const events = snap.data()?.events;
          this.privateEvents = Array.isArray(events) ? (events as SamenEvent[]) : [];
          onChange();
        }),
      );
    }
    return () => stops.forEach(stop => stop());
  }

  async leaveCouple(): Promise<void> {
    const mine = await this.db.collection(LOG).where('author', '==', this.me).get();
    for (const d of mine.docs) await this.db.collection(LOG).doc(d.id).delete();
    if (this.hasPrivateSpace) await this.privateRef().delete();
    else await storage.remove(LOCAL_PRIVATE_KEY);
    this.shared.clear();
    this.privateEvents = [];
  }
}
