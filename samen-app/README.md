# Samen – de app

> Waar gaat het om? Lees eerst [FOCUS.md](FOCUS.md).

De eerste werkende versie van **Samen Couples** (fase 1 uit het conceptboek), gebouwd met Expo (React Native)
zodat één codebase werkt op iPhone, Android en het web.

## Wat er al werkt

| Onderdeel | Wat je kunt doen |
|---|---|
| **Welkom & LoveGotchi** | Naam invullen en je eigen mini-jij maken (huid, kapsel, haarkleur, baard, outfit, accessoire). |
| **Koppelen** | Een koppelcode van 6 tekens maken of invullen. Of de demo proberen met een gesimuleerde partner, Sam. |
| **Vandaag** | De dagelijkse kern op één scherm: de week in één oogopslag, je check-in, één klein gebaar voor je partner (gekozen uit drie voorstellen op basis van diens liefdestaal en behoefte), "Ik merkte het ❤️" voor wat je partner voor jou deed, en de gesprekskaart van de dag. Daaronder staan de andere plekken (zie `src/lib/stations.ts` en [FOCUS.md](FOCUS.md)). |
| **Dagelijkse check-in** | Stemming, energie en behoefte. Na beide check-ins zie je een gedeeld dagbeeld met een voorstel voor de avond. |
| **After Dark (18+)** | Gaat alleen open als jullie het allebei aanzetten; de mildste van jullie twee sferen (romantisch, flirterig, ongegeneerd fout) geldt, en wie het aanzet ziet niet of de ander dat al deed. Kaarten, een wensenlijst waarin je alleen de matches ziet, ondeugende stickers die de ander moet accepteren, en flirterige opdrachten in Vandaag. Alleen tekst, nooit expliciet. |
| **Gesprekskaarten** | 25 vragen in 5 thema's. Je ziet het antwoord van je partner pas na je eigen antwoord. Inzichten kun je in het Kompas bewaren. |
| **Ken je mij?** | Vijf vragen over jezelf, daarna raad je wat je partner koos. Na beide inzendingen volgt de uitslag. |
| **Reflex Battle** | Op één telefoon: wie tikt het snelst als het scherm roze wordt? Best of five. |
| **Beloningenpot** | Samen beloningen kiezen. De winnaar kiest er een en jullie vinken af wanneer hij verzilverd is. |
| **Kompas** | Liefdestalen invullen, gedeeld of alleen voor jezelf, met een dagelijkse tip. Plus bewaarde inzichten. |
| **Prestaties** | 9 prestaties. Elke prestatie levert een meubel op voor in de opslag (plantje, sfeerlamp, gouden fotolijst …). |

**Privacy zit in de database zelf**: check-ins en antwoorden kan je partner pas lezen als jullie allebei hebben
ingevuld. Notities "alleen voor mij" kan alleen jij lezen. Dat regelt de server, niet alleen de app.

## 1. Uitproberen zonder iets te installeren

Open de webversie die Claude heeft gepubliceerd (de link staat in het gesprek). Daar kun je kiezen uit:

- **Start samen**: jullie openen allebei dezelfde pagina, ieder op de eigen telefoon. De pagina heeft een eigen
  gedeelde database (`src/lib/backend/shared.ts`), dus er is geen server nodig. Deel de pagina via het Share-menu van
  claude.ai met je partner, met de rol **Editor** (anders kan je partner niets opslaan). Je partner heeft een
  claude.ai-account nodig.
- **Probeer de demo**: je speelt met een gesimuleerde partner, Sam, en alles blijft in je eigen browser.

In de testversie verbergt de app zelf een check-in of antwoord totdat jullie allebei hebben ingevuld. In de echte app
met Supabase dwingt de server dat af. Notities "alleen voor mij" zijn ook in de testversie echt privé.

## 2. Uitproberen op je eigen telefoon

Hiervoor heb je een computer nodig (Mac of Windows).

1. Installeer **Node.js** (de "LTS"-versie) van <https://nodejs.org>.
2. Installeer de app **Expo Go** op je telefoon (App Store of Google Play).
3. Open een terminal in deze map en voer uit:
   ```sh
   npm install
   npx expo start
   ```
4. Scan de QR-code die verschijnt met je camera (iPhone) of met Expo Go (Android).

Zonder server-instellingen werkt alleen de demo. Voor echte koppels met twee telefoons volg je stap 3.

## 3. De server aanzetten (Supabase, gratis om te beginnen)

1. Maak een account op <https://supabase.com> en een nieuw project. Kies als regio **Frankfurt (EU)** vanwege de AVG.
2. Ga naar **SQL Editor**, plak de inhoud van [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) en klik op **Run**. Doe daarna hetzelfde met [`0002_house.sql`](supabase/migrations/0002_house.sql).
3. Ga naar **Authentication → Sign In / Providers** en zet **Anonymous sign-ins** aan.
4. Ga naar **Project Settings → API** en kopieer de *Project URL* en de *anon public key*.
5. Kopieer in deze map `.env.example` naar `.env` en vul beide waarden in.
6. Start de app opnieuw met `npx expo start`. "Maak onze koppelcode" werkt nu, en je partner kan op de eigen telefoon de code invullen.

## 4. Testversie op jullie Android-telefoons

Expo bouwt de app in de cloud; je hebt er geen Android Studio voor nodig.

1. Maak een gratis account op <https://expo.dev> en maak onder **Account settings → Access tokens** een token.
2. Zorg voor de Supabase-gegevens uit stap 3. Zonder die gegevens bevat de app alleen de demo met Sam.
3. Voer uit (met `EXPO_TOKEN`, `EXPO_PUBLIC_SUPABASE_URL` en `EXPO_PUBLIC_SUPABASE_ANON_KEY` als omgevingsvariabelen):
   ```sh
   ./scripts/build-android.sh
   ```
4. Na ongeveer 15 minuten krijg je een downloadlink. Open die op jullie Android-telefoons en sta "installeren uit onbekende bron" toe.

## 5. Naar Google Play (en later de App Store)

Nodig:
- een **Google Play Console**-account (eenmalig $25), en voor iPhone later een **Apple Developer**-account (€99 per jaar);
- hetzelfde expo.dev-account.

```sh
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest submit --platform android
```

Let op bij Google Play: een nieuw *persoonlijk* ontwikkelaarsaccount moet de app eerst minimaal 14 dagen laten
testen door minimaal 12 testers voordat je mag publiceren. Met een organisatie-account (KvK) geldt dat niet.

## Nog te doen vóór de lancering

1. **Betalen** – de eenmalige aankoop van €9,99 per koppel (met de partner gratis erbij) via RevenueCat. Daarvoor is een development build nodig, want het werkt niet in Expo Go.
2. **Account herstellen** – accounts beginnen nu anoniem. Voeg inloggen met e-mail, Apple of Google toe, zodat je bij een nieuwe telefoon je gegevens terugkrijgt.
3. **Account verwijderen in de app** – Apple verplicht dit. Ontkoppelen wist nu je eigen gegevens in het koppel, maar nog niet het account zelf.
4. **Dagelijkse herinnering** – een melding op een zelfgekozen tijd voor de check-in (`expo-notifications`).
5. **Privacyverklaring en voorwaarden** – nodig voor beide stores. Gegevens over intimiteit vallen onder de strengste AVG-categorie: vraag uitdrukkelijk toestemming.
6. **Winkelpagina** – schermafbeeldingen, beschrijving, leeftijdsclassificatie en Apple's "App Privacy"-labels.
7. **Later** – After Dark (houd het bij tekst, zonder expliciete beelden), meer minigames, huisjes bezoeken en 2-tegen-2 (Couples Plus), en Samen Singles.

## Hoe de code in elkaar zit

```
src/app/            de schermen (elke file is een scherm; (tabs) is de tabbalk onderin)
src/components/     avatar, iconen en de basis-UI
src/components/house/  de huisscène: tekeningen (sprites), lopende figuurtjes en de interactie
src/lib/house/      kamers, meubels, indeling, looproutes en de isometrische projectie
src/lib/content.ts  alle teksten: kaarten, vragen, prestaties, beloningen
src/lib/state.ts    rekent uit wat jullie samen hebben gedaan (levels, prestaties, uitslagen)
src/lib/backend/    demo.ts (alles op de telefoon) en supabase.ts (de echte server)
supabase/           het databaseschema met de beveiligingsregels
```

Alles wat een koppel doet, wordt opgeslagen als een *gebeurtenis* (een check-in, een antwoord, een spel). De app
rekent daaruit de gedeelde toestand uit. Nieuwe functies zijn daardoor meestal een nieuw soort gebeurtenis plus een
scherm, zonder dat de database hoeft te veranderen.

Handige commando's:

```sh
npm run typecheck        # controleert de code op typefouten
npx eslint .             # controleert de codestijl
npx expo export --platform web && node scripts/web-preview.mjs   # maakt preview/samen-demo.html
```
