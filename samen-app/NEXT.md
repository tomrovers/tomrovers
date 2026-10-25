# Where we are (handover between Claude sessions)

Read FOCUS.md and README.md first. Talk to Tom in Dutch; he has no programming experience.

## Done
- App with Vandaag, After Dark (Vonk, Afstemmen, wishes, stickers, trophies), games and the trophy
  "Couples who play together, stay together". Test page: https://claude.ai/artifact/A3FYh6hcTtSaBn338kxfvY
- Supabase project "Samen" in org "Stormvoer Enterprise", region Frankfurt:
  `https://xxeiwtqnhbnppfeppdzb.supabase.co`. Created with "Automatically expose new tables" off and
  "automatic RLS" on; the migrations grant table access explicitly.
- Expo is connected to Claude (Expo connector). Tom has a sole proprietorship (eenmanszaak), and requests a D-U-N-S number for a
  Google Play organization account. Apple: enroll as an individual.

## Next
1. Apply `supabase/migrations/0001_init.sql` and `0002_house.sql` (Supabase connector, or Tom pastes them
   in the SQL Editor). Turn on anonymous sign-ins (Authentication → Sign In / Providers).
2. Write `0003_afterdark_privacy.sql`: the server must only reveal After Dark answers that match.
   - Wishes: reveal the partner's answer only when both said ja/misschien.
   - Sparks: return least(mine, partner) only when both ≥ 2, otherwise nothing.
   - Afstemmen: return the alignment (samen/dichtbij/verschil, see `alignQuestions` in `src/lib/afterdark.ts`)
     instead of the partner's answer.
   - The latest event per seal key counts. Then adapt `src/lib/backend/supabase.ts` and `state.ts`.
3. Expo: project slug `samen`, GitHub repo tomrovers/tomrovers with base directory `samen-app`,
   env vars `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (publishable key) for preview
   and production. Put the projectId and owner in app.json, then build the preview APK
   (`build_run`, profile `preview`, platform ANDROID, branch `claude/new-session-v9garq`).
4. Tom and Annelieke use the APK daily for two weeks; then store requirements (see "Nog te doen vóór de lancering" in README:
   login, account deletion, reminders, RevenueCat, privacy policy, age rating, store listing).
