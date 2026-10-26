# Claddagh: design-briefing

Deze map is bedoeld voor iedereen die meedenkt over het ontwerp: een designer, ChatGPT of een andere AI.
Alles wat je nodig hebt staat hier: wat de app is, hoe hij er nu uitziet, de kleuren, het logo en de eisen.
De app zelf staat in `../samen-app`, het oorspronkelijke concept in `../samen-conceptboek`.

## Wat is Claddagh?

Een app voor stellen, gemaakt door Tom (eenmanszaak) voor hem en zijn vrouw Annelieke, en straks voor iedereen
in de Google Play Store en de App Store. Partners gebruiken de app om tot de diepere lagen van elkaar te komen:
meer begrip voor elkaar en richtlijnen om samen gelukkiger te worden. Op een speelse manier, elke dag 2 tot 5 minuten.

Het oorspronkelijke idee: dat stellen door de app ook op seksueel gebied meer synchroniteit krijgen. Dat gebeurt in
het onderdeel **After Dark** (18+), dat alleen opengaat als allebei de partners het aanzetten.

En: *couples who play together, stay together*. Samen spelen hoort erbij.

De werktitel was "Samen". De naam wordt **Claddagh**, naar de Ierse ring die Tom ooit aan Annelieke gaf.

## De Claddagh en de app

| Symbool | Betekenis | In de app |
|---|---|---|
| De handen | Vriendschap | De dagelijkse kern: check-in, iets kleins voor elkaar doen, een gesprek van de dag |
| Het hart | Liefde | After Dark: Vonk (hoeveel zin heb je vandaag), Afstemmen, wensenlijst, ondeugende stickers |
| De kroon | Trouw | Samen groeien: het Kompas (liefdestalen), prestaties, trofeeën, samen spelen |

## Het logo: waar we staan

- Richting gekozen: **twee handen die een hart vasthouden, met een kroon**, zoals de echte ring.
- Huidige schetsen: `logo/claddagh-handen-vol.svg`, `logo/claddagh-handen-lijn.svg`,
  `logo/claddagh-handen-op-paars.svg` (overzicht: `logo/claddagh-handen-overzicht.png`).
- Tom vindt de richting goed, maar de uitwerking nog niet mooi genoeg. Gezocht: een verfijnder, eigen versie
  van de handen, die ook als klein app-icoon (48 px) herkenbaar blijft.
- Eerdere richtingen (afgevallen, ter inspiratie): `logo/eerdere-richtingen/`.
- Het Claddagh-motief is eeuwenoud en vrij te gebruiken, maar kopieer geen ontwerp van een bestaande juwelier.

## Hoe de app er nu uitziet

Warm en zacht: een crèmekleurige achtergrond, pruimkleurige tekst, roze accenten en pastelkaarten met ronde hoeken.
After Dark heeft een eigen nachtstijl (donker paars met roze en goud), zodat het nooit voelt als de gewone schermen.
Kleuren, lettertypes en maten: `tokens.json`.

Schermafbeeldingen (telefoon, 390 punten breed) in `schermen/`:

| Bestand | Scherm |
|---|---|
| `01-welkom.png` | Welkom: naam invullen en je LoveGotchi (mini-avatar) maken |
| `02-koppelen.png` | Koppelen met je partner via een code van 6 tekens |
| `03-vandaag.png`, `03-vandaag-hele-scherm.png` | Vandaag: het hoofdscherm met de week, de drie stappen en "Meer samen" |
| `04-check-in.png` | Check-in: stemming, energie en behoefte |
| `05-vandaag-na-check-in.png` | Vandaag nadat jullie allebei hebben ingecheckt |
| `06-kaarten.png`, `07-gesprekskaart.png` | Gesprekskaarten; je ziet het antwoord van je partner pas na je eigen antwoord |
| `08-spelen.png` | Spelen, met de trofee "Couples who play together, stay together" |
| `09-kompas.png` | Kompas: liefdestalen en bewaarde inzichten |
| `10-prestaties.png` | Prestaties en stickers |
| `11-after-dark-aanzetten.png` | After Dark aanzetten (sfeer kiezen, 18+) |
| `12-after-dark-vonk.png` | Vonk: 0 tot 4 vlammetjes, alleen een match wordt getoond |
| `13-after-dark-afstemmen.png` | Afstemmen: je ziet alleen of jullie op één lijn zitten, met een tip |
| `14-after-dark-wensen.png` | Wensenlijst: alleen wensen waar jullie allebei ja of misschien op zeggen |
| `15-after-dark-stickers.png` | Ondeugende stickers en trofeeën |

## Eisen die vastliggen

- **Gebouwd met Expo (React Native)**, eerst voor Android. Ontwerpen moeten in gewone app-code te maken zijn:
  vlakke kleuren, vormen, tekst en SVG-iconen. Geen effecten die alleen in een tekenprogramma werken.
- **Toegankelijk**: tekst minstens 4,5:1 contrast, knoppen minstens 44 px, kleuren die je ook in lichtheid uit
  elkaar houdt.
- **After Dark**: alleen tekst en symbolen, speels en suggestief, **nooit expliciet** (regels van de app stores).
- **Privacy is ook ontwerp**: een nee, een laag vonk-getal of een precies antwoord van je partner wordt nooit getoond,
  alleen wat jullie allebei willen. Ontwerp nooit iets dat de ander ongemakkelijk of afgewezen laat voelen.
- **Taal**: Nederlands, warm en direct, zonder streepjes in zinnen. Later ook Engels.
- **Uitbreidbaar**: elk onderdeel is een "plek" (zie `../samen-app/FOCUS.md`). Later worden die plekken hotspots in
  een 3D-huis dat je samen inricht, zoals de Gallery in de game Outlaw Sirens. Houd daar rekening mee.

## Open ontwerpvragen

1. Het definitieve logo (twee handen, hart, kroon) en het woordmerk "Claddagh".
2. Het app-icoon voor Android: een *adaptive icon* (108 dp vlak, belangrijk deel binnen de middelste 66 dp) en een
   eenkleurige versie voor Android 13+.
3. Het opstartscherm (splash) en de winkelpagina (schermafbeeldingen, banner van 1024 x 500).
4. Iconen in plaats van de emoji die de app nu nog gebruikt op de kaarten van "Meer samen".
5. De LoveGotchi (mini-avatar van jezelf): een eigen, herkenbare stijl.

## Hoe lever je ontwerpen aan?

- **Logo en iconen**: als SVG (bij voorkeur `viewBox="0 0 200 200"`, vlakke kleuren uit `tokens.json`), plus een PNG.
- **Schermen**: als afbeelding van 390 punten breed, met korte notities over kleuren, maten en wat er verandert.
- **Kleuren**: altijd als hexcode.
- Tom geeft de ontwerpen aan Claude (Claude Code), die ze in de app inbouwt en test. Verander de werking of de
  onderdelen van de app niet zonder overleg met Tom; dat staat vast in `../samen-app/FOCUS.md`.
