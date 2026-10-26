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
1. Done: migrations 0001 and 0002 are applied on Supabase (Tom pasted them; the connector's
   apply_migration asks a confirmation that does not reach Tom, so let him paste SQL in the SQL Editor).
2. Done (checked 2026-10-26 with the Supabase connector's execute_sql, which works for read queries):
   0003 is applied (`revealed_sealed_events` contains `align_of`) and anonymous sign-ins work. On that date the
   server had 0 couples and 0 events; all 8 anonymous users were from the test runs of 2026-10-25, so Tom and
   Annelieke had not linked in the APK yet. Tom's computer has no Node.js, so typecheck/lint/server-check cannot run
   locally until he installs it.
3. Done: EAS project @stormvoerenterprise/samen (id cbd6a7fa-5a85-48d0-97e9-fb90e6794ad8), GitHub linked with base
   directory `samen-app`; Supabase settings are in eas.json. First preview APK: build 77a99a76-3b7e-42f2-b54a-f1bbe2d69347
   (expires 2026-11-08). Start builds with the Expo connector's `build_run` (profile `preview`, ANDROID, branch
   `claude/new-session-v9garq`). Expo prompts for a usage budget don't reach Tom: use confirmationMode "conversation".
- `scripts/server-check.mjs` checks the privacy rules on the real server (16 checks, all pass); the app was also
   tested end to end against it in a browser (linking, check-in, act, After Dark, Vonk, Afstemmen).
4. Tom and Annelieke use the APK daily for two weeks; then store requirements (see "Nog te doen vóór de lancering" in README:
   login, account deletion, RevenueCat, privacy policy, age rating, store listing).
5. Done: daily check-in reminder (`src/lib/reminder.ts`, card in `instellingen.tsx`, `useReminders()` in the tabs layout).
   Local only, per phone: it plans 14 one-off DATE notifications (not a repeating one) so today's is skipped after you
   check in; replanned on app open/foreground. No exact-alarm permission, so Android may deliver a few minutes late.
   Checked in an EAS sandbox (tsc, eslint, web export, android prebuild all pass); not yet tried on a real phone.
   Preview APK with the reminder: build 25b14de2-e1d2-4b4d-87a0-ea113b954eef (finished, expires 2026-11-09); it
   replaces build 77a99a76 in PROJECT.md. Its usage budget (1 build, 30 sandbox min) is used up.

6. Done (2026-10-26): design round 01 from ChatGPT ("Dicht bij elkaar", in `design/van-chatgpt/2026-10-26-ontwerprichting-v1/`),
   steps 1–4 of its VOOR-CLAUDE.md: colour roles in `theme.ts` (darker muted, `roseText`, `control`, disabled colours),
   12 px buttons and outlined chips/secondary buttons in `ui.tsx`, the line icons in `icon.tsx` (stations now have
   `icon` instead of `emoji`; mood faces are `mood-<id>`), and restyled Vandaag, check-in, After Dark and Vonk.
   Tom approved the direction. Deliberately kept text at 15/13 instead of the proposed 14/12. Not yet done: the logo
   and Android icon layers (Tom still has to approve the mark; he and I find the hands read a bit like birds), and the
   layout of the other screens (they only picked up the new colours and components). Passed tsc and eslint in a
   sandbox; not visually checked in a browser (the built-in browser can't open the sandbox link or a local file).

## Working without Node on Tom's computer
Tom's laptop has no Node.js. To add packages or run tsc/eslint: push a temporary branch, start an EAS sandbox
(`sandbox_create` with `gitRef`, LINUX MEDIUM, needs a usage budget approved by Tom in chat with confirmationMode
"conversation"), run `npm ci` + `npx expo install …` there, and bring the change back as a base64 `git diff` applied
locally with `git apply`; compare `git hash-object` on both sides. Note `expo prebuild` rewrites the package.json
scripts; don't copy that back.
