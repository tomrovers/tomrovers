import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';

import type { NewEvent, SamenEvent } from '../types';
import { BackendError, type Backend, type Session } from './types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const cloudConfigured = !!url && !!anonKey;

type EventRow = {
  id: string;
  couple_id: string;
  author_id: string;
  type: SamenEvent['type'];
  payload: unknown;
  visibility: SamenEvent['visibility'];
  seal_key: string | null;
  created_at: string;
};

const toEvent = (r: EventRow) =>
  ({
    id: r.id,
    coupleId: r.couple_id,
    authorId: r.author_id,
    type: r.type,
    payload: r.payload,
    visibility: r.visibility,
    sealKey: r.seal_key ?? undefined,
    createdAt: r.created_at,
  }) as SamenEvent;

function fail(error: { message: string } | null, fallback: string): asserts error is null {
  if (error) throw new BackendError(error.message || fallback);
}

export class SupabaseBackend implements Backend {
  readonly mode = 'cloud' as const;
  private client: SupabaseClient;
  private current: Session = { userId: '', coupleId: null, code: null, memberIds: [] };

  constructor() {
    if (!url || !anonKey) throw new BackendError('Supabase is nog niet ingesteld.');
    this.client = createClient(url, anonKey, {
      auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }

  async start(): Promise<Session> {
    const { data } = await this.client.auth.getSession();
    let userId = data.session?.user.id;
    if (!userId) {
      // Accounts start anonymous so a couple can begin in seconds; email login can be linked later.
      const res = await this.client.auth.signInAnonymously();
      fail(res.error, 'Inloggen mislukt.');
      userId = res.data.user!.id;
    }
    this.current.userId = userId;
    return this.refreshSession();
  }

  async refreshSession(): Promise<Session> {
    const { data, error } = await this.client.from('couple_members').select('couple_id, user_id');
    fail(error, 'Kon jullie koppel niet ophalen.');
    const coupleId = data.find(r => r.user_id === this.current.userId)?.couple_id ?? null;
    let code: string | null = null;
    if (coupleId) {
      const res = await this.client.from('couples').select('code').eq('id', coupleId).single();
      fail(res.error, 'Kon de koppelcode niet ophalen.');
      code = res.data.code;
    }
    this.current = {
      userId: this.current.userId,
      coupleId,
      code,
      memberIds: data.filter(r => r.couple_id === coupleId).map(r => r.user_id),
    };
    return this.current;
  }

  async createCouple(): Promise<Session> {
    const { error } = await this.client.rpc('create_couple');
    fail(error, 'Kon geen koppel aanmaken.');
    return this.refreshSession();
  }

  async joinCouple(code: string): Promise<Session> {
    const { error } = await this.client.rpc('join_couple', { p_code: code.trim().toUpperCase() });
    fail(error, 'Deze code werkt niet.');
    return this.refreshSession();
  }

  async fetchEvents(): Promise<SamenEvent[]> {
    const coupleId = this.current.coupleId;
    if (!coupleId) return [];
    const [own, revealed] = await Promise.all([
      this.client.from('events').select('*').eq('couple_id', coupleId).order('created_at'),
      this.client.rpc('revealed_sealed_events', { p_couple: coupleId }),
    ]);
    fail(own.error, 'Kon de gegevens niet ophalen.');
    fail(revealed.error, 'Kon de gegevens niet ophalen.');
    return [...(own.data as EventRow[]), ...(revealed.data as EventRow[])].map(toEvent);
  }

  async post(event: NewEvent): Promise<void> {
    const coupleId = this.current.coupleId;
    if (!coupleId) throw new BackendError('Je bent nog niet gekoppeld.');
    const rows: Omit<EventRow, 'id' | 'author_id' | 'created_at'>[] = [
      { couple_id: coupleId, type: event.type, payload: event.payload, visibility: event.visibility, seal_key: event.sealKey ?? null },
    ];
    // A sealed event is invisible to the partner, so announce it with an empty public ping.
    if (event.visibility === 'sealed' && event.sealKey) {
      rows.push({ couple_id: coupleId, type: 'sealed.ping', payload: { key: event.sealKey }, visibility: 'public', seal_key: null });
    }
    const { error } = await this.client.from('events').insert(rows);
    fail(error, 'Opslaan mislukt.');
  }

  subscribe(onChange: () => void) {
    const coupleId = this.current.coupleId;
    if (!coupleId) return () => {};
    const channel: RealtimeChannel = this.client
      .channel(`couple-${coupleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `couple_id=eq.${coupleId}` }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couple_members', filter: `couple_id=eq.${coupleId}` }, onChange)
      .subscribe();
    return () => {
      void this.client.removeChannel(channel);
    };
  }

  async leaveCouple(): Promise<void> {
    const { error } = await this.client.rpc('leave_couple');
    fail(error, 'Ontkoppelen mislukt.');
    await this.refreshSession();
  }
}
