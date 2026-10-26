# Claddagh (werktitel Samen): projectoverzicht

Een app voor stellen om tot de diepere lagen van elkaar te komen: meer begrip, richtlijnen om samen gelukkiger te
worden, en meer synchroniteit, ook op seksueel gebied. Van Tom (eenmanszaak Stormvoer Enterprise) en Annelieke.

## Waar staat wat?

| Map of bestand | Inhoud |
|---|---|
| [`samen-app/FOCUS.md`](samen-app/FOCUS.md) | De visie en de meetlat voor nieuwe ideeën |
| [`samen-app/README.md`](samen-app/README.md) | Wat de app kan, hoe je hem test en bouwt, en wat er nog moet vóór de lancering |
| [`samen-app/NEXT.md`](samen-app/NEXT.md) | Technische stand van zaken en volgende stappen (voor Claude) |
| [`design/README.md`](design/README.md) | De design-briefing: merk, logo, kleuren, schermen en eisen (voor ChatGPT of een designer) |
| [`design/`](design/) | Logo-schetsen (SVG), kleuren en lettertypes (`tokens.json`) en schermafbeeldingen |
| [`samen-conceptboek/`](samen-conceptboek/) | Het oorspronkelijke conceptboek (tekst en pdf) |
| [`samen-app/src/`](samen-app/src/) | De code van de app (Expo / React Native) |
| [`samen-app/supabase/migrations/`](samen-app/supabase/migrations/) | De database en de privacyregels |

## Beslissingen

- **Naam**: Claddagh, naar de ring die Tom aan Annelieke gaf. Nog te controleren in het merkregister
  ([TMview](https://www.tmdn.org/tmview), klassen 9, 42 en 45); de app heet in de code nog "Samen".
- **Logo**: twee handen die een hart vasthouden, met een kroon. De uitwerking wordt nog verfijnd.
- **Focus**: eerst de dagelijkse kern en After Dark; het 3D-huis en avatars van een foto komen later.
- **Eerst Android**, daarna de iPhone.
- **Google Play**: organisatie-account via de eenmanszaak (D-U-N-S-nummer aanvragen). **Apple**: als individu.

## Links en accounts

| Wat | Waar |
|---|---|
| Testpagina (werkt in de browser, ook met z'n tweeën) | https://claude.ai/artifact/A3FYh6hcTtSaBn338kxfvY |
| Logo-ontwerpen | https://claude.ai/artifact/AWuDghr8ghgEHR4CRYc9oX |
| Server (Supabase, Frankfurt) | https://supabase.com/dashboard/project/xxeiwtqnhbnppfeppdzb |
| Builds (Expo) | https://expo.dev/accounts/stormvoerenterprise/projects/samen |
| Eerste Android-testversie (tot 8 november 2026) | https://expo.dev/accounts/stormvoerenterprise/projects/samen/builds/77a99a76-3b7e-42f2-b54a-f1bbe2d69347 |

Wachtwoorden en sleutels staan hier bewust niet in.

## Roadmap naar de stores

1. **Nu**: Tom en Annelieke gebruiken de Android-testversie twee weken elke dag. Het logo wordt afgemaakt.
2. **Verplicht voor de stores**: inloggen met e-mail of Google, account verwijderen, dagelijkse herinnering (klaar),
   betalen (eenmalig €9,99 per koppel via RevenueCat), privacyverklaring en voorwaarden (AVG: gegevens over het
   seksleven), leeftijdsclassificatie (waarschijnlijk 18+), winkelpagina.
3. **Gesloten test** met bevriende stellen.
4. **Google Play**.
5. **App Store** (iPhone), met TestFlight-testers.

## Samenwerken

De gedeelde map staat op Toms computer: `C:\Users\Tom\Desktop\EENMANSZAAK\claddagh`. Dat is een kopie van deze
GitHub-repository (branch `claude/new-session-v9garq`).

- **ChatGPT** leest de bestanden uit die map (zie `design/README.md`) en wat het maakt komt in `design/van-chatgpt/`.
- **Claude Code** draait op dezelfde computer in die map, bouwt de ontwerpen in, test ze, houdt `samen-app/NEXT.md` bij en zet alles op GitHub.
