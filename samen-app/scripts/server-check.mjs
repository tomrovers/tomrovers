// Checks the privacy rules on the real Supabase server with three throwaway anonymous users.
// Usage: node scripts/server-check.mjs   (behind a proxy: NODE_USE_ENV_PROXY=1)
// The test couple removes itself at the end; the anonymous accounts stay behind, empty.
import { createClient } from '@supabase/supabase-js';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://xxeiwtqnhbnppfeppdzb.supabase.co';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_ApYk56jXk_3Qd-mqrjGyDg_Bji_gy9R';
const mk = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = (label, cond, extra = '') => console.log(cond ? 'ok  ' : 'FAIL', label, extra);
const tom = mk(), ann = mk(), outsider = mk();
for (const c of [tom, ann, outsider]) { const { error } = await c.auth.signInAnonymously(); if (error) throw error; }
const id = async c => (await c.auth.getUser()).data.user.id;
const T = await id(tom);
const { data: couple, error: e1 } = await tom.rpc('create_couple');
ok('create_couple', !e1 && couple?.code?.length === 6, e1?.message ?? couple.code);
const { error: e2 } = await ann.rpc('join_couple', { p_code: couple.code });
ok('join_couple', !e2, e2?.message);
const { error: e3 } = await outsider.rpc('join_couple', { p_code: couple.code });
ok('third person cannot join', !!e3, e3?.message);
const C = couple.id;
const post = async (c, type, payload, visibility, seal_key = null) => {
  const rows = [{ couple_id: C, type, payload, visibility, seal_key }];
  if (visibility === 'sealed') rows.push({ couple_id: C, type: 'sealed.ping', payload: { key: type === 'ad.spark' ? 'ad:activity' : seal_key }, visibility: 'public', seal_key: null });
  const { error } = await c.from('events').insert(rows);
  if (error) throw new Error(type + ': ' + error.message);
};
const revealed = async c => { const { data, error } = await c.rpc('revealed_sealed_events', { p_couple: C }); if (error) throw error; return data; };
const visible = async c => (await c.from('events').select('*').eq('couple_id', C)).data;

await post(tom, 'profile', { name: 'Test Tom' }, 'public');
ok('partner sees public profile', (await visible(ann)).some(e => e.type === 'profile' && e.author_id === T));
await post(tom, 'checkin', { day: 'd1', mood: 'blij' }, 'sealed', 'checkin:d1');
ok('sealed check-in hidden from partner table read', !(await visible(ann)).some(e => e.type === 'checkin'));
ok('sealed check-in not revealed before answering', (await revealed(ann)).length === 0);
await post(ann, 'checkin', { day: 'd1', mood: 'moe' }, 'sealed', 'checkin:d1');
ok('check-in revealed after both', (await revealed(ann)).some(e => e.type === 'checkin' && e.payload.mood === 'blij'));
await post(tom, 'compass.note', { text: 'geheim' }, 'private');
ok('private note invisible to partner', !(await visible(ann)).some(e => e.type === 'compass.note'));
ok('outsider sees nothing', (await visible(outsider))?.length === 0 && (await revealed(outsider)).length === 0);

await post(tom, 'ad.wish', { wishId: 'w1', answer: 'ja' }, 'sealed', 'ad:wish:w1');
await post(ann, 'ad.wish', { wishId: 'w1', answer: 'nee' }, 'sealed', 'ad:wish:w1');
ok('Tom never receives her nee', !(await revealed(tom)).some(e => e.type === 'ad.wish'));
await post(tom, 'ad.spark', { day: 'd1', level: 4 }, 'sealed', 'ad:spark:d1');
await post(ann, 'ad.spark', { day: 'd1', level: 1 }, 'sealed', 'ad:spark:d1');
ok('spark 4 vs 1: nothing', !(await revealed(tom)).some(e => e.type === 'ad.spark'));
await post(ann, 'ad.spark', { day: 'd1', level: 3 }, 'sealed', 'ad:spark:d1');
const sp = (await revealed(tom)).find(e => e.type === 'ad.spark');
ok('spark 4 vs 3: band 3', sp?.payload.level === 3, JSON.stringify(sp?.payload));
await post(tom, 'ad.align', { questionId: 'vaak', answer: 1 }, 'sealed', 'ad:align:vaak');
await post(ann, 'ad.align', { questionId: 'vaak', answer: 3 }, 'sealed', 'ad:align:vaak');
const al = (await revealed(tom)).find(e => e.type === 'ad.align');
ok('align: only the comparison', al?.payload.alignment === 'verschil' && al.payload.answer === undefined, JSON.stringify(al?.payload));
const { error: e4 } = await ann.from('events').insert({ couple_id: C, author_id: T, type: 'profile', payload: {}, visibility: 'public' });
ok('cannot post as partner', !!e4, e4?.message);
const { error: e5 } = await outsider.from('events').insert({ couple_id: C, type: 'profile', payload: {}, visibility: 'public' });
ok('outsider cannot post', !!e5, e5?.message);

// Clean up: leaving removes each person's own events and the couple.
for (const c of [ann, tom]) { const { error } = await c.rpc('leave_couple'); if (error) throw error; }
ok('cleaned up', (await visible(tom)).length === 0);
