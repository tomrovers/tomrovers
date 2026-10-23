import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { actions } from './actions';
import { DemoBackend } from './backend/demo';
import { detectShared, SharedBackend } from './backend/shared';
import { cloudConfigured, SupabaseBackend } from './backend/supabase';
import type { Backend, Session } from './backend/types';
import { defaultRewards } from './content';
import type { HouseLayout, Presence } from './house/layout';
import { deriveState, type CoupleState } from './state';
import * as storage from './storage';
import type { NewEvent, Profile, SamenEvent } from './types';

type Mode = 'demo' | 'cloud' | 'shared';
export type Status = 'loading' | 'needs-profile' | 'needs-couple' | 'ready';

type Store = {
  status: Status;
  mode: Mode | null;
  session: Session | null;
  profile: Profile | null;
  state: CoupleState | null;
  cloudAvailable: boolean;
  /** True when this page has its own shared database (the web version published on claude.ai). */
  sharedAvailable: boolean;
  saveProfile: (profile: Profile) => Promise<void>;
  startDemo: () => Promise<void>;
  startShared: () => Promise<void>;
  createCouple: () => Promise<void>;
  joinCouple: (code: string) => Promise<void>;
  post: (event: NewEvent) => Promise<void>;
  leaveCouple: () => Promise<void>;
  house: HouseLayout | null;
  saveHouse: (rooms: HouseLayout['rooms']) => Promise<void>;
  /** Where the partner's figure is right now (if they have the app open). */
  partnerPresence: Presence | null;
  setPresence: (p: Omit<Presence, 'uid' | 'at'>) => void;
};

const PROFILE_KEY = 'samen.profile';
const MODE_KEY = 'samen.mode';

const StoreContext = createContext<Store | null>(null);

const makeBackend = (mode: Mode): Backend =>
  mode === 'demo' ? new DemoBackend() : mode === 'shared' ? new SharedBackend() : new SupabaseBackend();

export function StoreProvider({ children }: { children: ReactNode }) {
  const [booted, setBooted] = useState(false);
  const [sharedAvailable, setSharedAvailable] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<SamenEvent[]>([]);
  const [house, setHouse] = useState<HouseLayout | null>(null);
  const [others, setOthers] = useState<Presence[]>([]);
  const backend = useRef<Backend | null>(null);

  const reload = useCallback(async () => {
    const b = backend.current;
    if (!b) return;
    const s = await b.refreshSession();
    setSession(s);
    setEvents(s.coupleId ? await b.fetchEvents() : []);
  }, []);

  const connect = useCallback(
    async (m: Mode) => {
      const b = makeBackend(m);
      backend.current = b;
      const s = await b.start();
      setMode(m);
      setSession(s);
      setEvents(s.coupleId ? await b.fetchEvents() : []);
      await storage.save(MODE_KEY, m);
      return s;
    },
    [],
  );

  // Boot: restore the profile and the previously chosen mode.
  useEffect(() => {
    (async () => {
      try {
        const [rawProfile, savedMode, shared] = await Promise.all([storage.load(PROFILE_KEY), storage.load(MODE_KEY), detectShared()]);
        setSharedAvailable(!!shared);
        if (rawProfile) setProfile(JSON.parse(rawProfile));
        if (savedMode === 'demo' || (savedMode === 'cloud' && cloudConfigured) || (savedMode === 'shared' && shared)) {
          await connect(savedMode);
        } else if (shared && savedMode !== 'demo') {
          // On a new phone or browser: pick up your own profile if you already joined this page.
          const b = new SharedBackend();
          const s = await b.start();
          const mine = (await b.fetchEvents()).filter(e => e.authorId === s.userId && e.type === 'profile').pop();
          if (mine?.type === 'profile') {
            setProfile(mine.payload);
            await storage.save(PROFILE_KEY, JSON.stringify(mine.payload));
            await connect('shared');
          }
        }
      } catch (e) {
        console.warn('Samen kon niet opstarten', e);
      } finally {
        setBooted(true);
      }
    })();
  }, [connect]);

  // Live updates while in a couple.
  const coupleId = session?.coupleId;
  useEffect(() => {
    const b = backend.current;
    if (!coupleId || !b) return;
    let alive = true;
    void b.loadHouse().then(l => alive && setHouse(l));
    const stops = [b.subscribe(() => void reload()), b.subscribeHouse(l => setHouse(l)), b.subscribePresence(setOthers)];
    return () => {
      alive = false;
      stops.forEach(stop => stop());
    };
  }, [coupleId, reload]);

  const state = useMemo(
    () => (session?.coupleId ? deriveState(events, session.userId, session.memberIds) : null),
    [events, session],
  );

  // Make sure the partner can see my name and avatar (once per couple).
  const profilePostedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!state || !profile || state.me || !backend.current || !coupleId) return;
    if (profilePostedFor.current === coupleId) return;
    profilePostedFor.current = coupleId;
    void backend.current.post(actions.profile(profile)).then(reload);
  }, [state, profile, coupleId, reload]);

  const post = useCallback(
    async (event: NewEvent) => {
      if (!backend.current) throw new Error('Nog niet verbonden');
      await backend.current.post(event);
      await reload();
    },
    [reload],
  );

  const saveProfile = useCallback(
    async (p: Profile) => {
      setProfile(p);
      await storage.save(PROFILE_KEY, JSON.stringify(p));
      if (backend.current && session?.coupleId) await post(actions.profile(p));
    },
    [post, session?.coupleId],
  );

  const afterCreate = useCallback(async () => {
    const b = backend.current!;
    for (const title of defaultRewards) await b.post(actions.addReward(title));
    await reload();
  }, [reload]);

  const startDemo = useCallback(async () => {
    await connect('demo');
    await backend.current!.createCouple();
    await afterCreate();
  }, [afterCreate, connect]);

  const startShared = useCallback(async () => {
    profilePostedFor.current = 'main'; // posted right below, not by the effect
    await connect('shared');
    const b = backend.current as unknown as SharedBackend;
    const first = !b.hasEvents();
    if (profile) await b.post(actions.profile(profile));
    if (first) await afterCreate();
    else await reload();
  }, [afterCreate, connect, profile, reload]);

  const createCouple = useCallback(async () => {
    if (backend.current?.mode !== 'cloud') await connect('cloud');
    await backend.current!.createCouple();
    await afterCreate();
  }, [afterCreate, connect]);

  const joinCouple = useCallback(
    async (code: string) => {
      if (backend.current?.mode !== 'cloud') await connect('cloud');
      await backend.current!.joinCouple(code);
      await reload();
    },
    [connect, reload],
  );

  const leaveCouple = useCallback(async () => {
    await backend.current?.leaveCouple();
    await storage.remove(MODE_KEY);
    backend.current = null;
    setHouse(null);
    setOthers([]);
    setMode(null);
    setSession(null);
    setEvents([]);
  }, []);

  const saveHouse = useCallback(async (roomsLayout: HouseLayout['rooms']) => {
    const layout = { rooms: roomsLayout, updatedAt: Date.now() };
    setHouse(layout);
    await backend.current?.saveHouse(layout);
  }, []);

  const userId = session?.userId;
  const setPresence = useCallback(
    (p: Omit<Presence, 'uid' | 'at'>) => {
      if (userId) backend.current?.setPresence({ ...p, uid: userId, at: Date.now() });
    },
    [userId],
  );

  const partnerPresence = (state?.partnerId && others.find(o => o.uid === state.partnerId)) || others[0] || null;

  const status: Status = !booted ? 'loading' : !profile ? 'needs-profile' : !session?.coupleId ? 'needs-couple' : 'ready';

  const value: Store = {
    status,
    mode,
    session,
    profile,
    state,
    cloudAvailable: cloudConfigured,
    sharedAvailable,
    saveProfile,
    startDemo,
    startShared,
    createCouple,
    joinCouple,
    post,
    leaveCouple,
    house,
    saveHouse,
    partnerPresence,
    setPresence,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}

/** For screens that only render once the couple is set up. */
export function useCouple(): Store & { state: CoupleState; session: Session } {
  const store = useStore();
  if (!store.state || !store.session) throw new Error('useCouple used before the couple is ready');
  return store as Store & { state: CoupleState; session: Session };
}
