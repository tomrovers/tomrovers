# Overdracht aan Claude · Designronde 01

**DRAFT — NIET GEPUBLICEERD**  
26 oktober 2026

Dit is een voorstel voor Toms correctieronde. Geen wijziging aan de Expo-app, database, routing of functionaliteit is uitgevoerd. De techniek blijft bij Claude. Technische controles van de app zijn daarom in deze designronde niet opnieuw uitgevoerd.

## Bronnen in dit pakket

- `2026-10-26-ontwerp.html`: lokaal klikbaar ontwerp; gewone HTML en CSS als visuele referentie, geen vervangende webapp.
- `schermen/`: vier eerste vensters op 390 × 844 en volledige scrolinhoud op 390 breed. De rand om een screenshot hoort bij de preview, niet bij de app.
- `2026-10-26-tokens-voorstel.json`: voorgestelde visuele rollen. Het bestaande `design/tokens.json` is niet gewijzigd.
- `iconen/`: losse, oorspronkelijke SVG-paden op een 24 × 24 raster. 1,7 lijn, ronde uiteinden. `currentColor` vervangen door de componentkleur bij overnemen in react-native-svg.
- `2026-10-26-logo-*.svg/.png`: merkteken; het woordmerk staat als typografisch voorstel in de preview, met bestaande Lato-fonts in `assets/`.
- `2026-10-26-android-*.svg/.png`: adaptive lagen. De monochrome laag bevat één kleur en transparantie, geen achtergrond.
- `2026-10-26-controle.json`: controles op dit ontwerpvoorbeeld en de aangeleverde iconen. Geen claim over de huidige app of server.

## Gewenste implementatievolgorde na de correctieronde

1. Semantische kleuren en tekstrollen: donkere secundaire tekst, controlerand los van kaartlijn, decoratief roze los van roze tekst. Neem alleen kleurparen over die passen bij de ondergrond; zet `roseText` bijvoorbeeld niet blind op elke bestaande pastel.
2. Losse iconen voor de bestaande `stations`. Behoud de IDs, route, houseSpot en meldingsvoorwaarden. De basisiconen kunnen de huidige `Icon`-component uitbreiden; geen nieuwe iconenbibliotheek nodig.
3. Vandaag en check-in visueel aanpassen, zonder gebeurtenissen, voorwaarden of volgorde van componenten op basis van toestand te veranderen.
4. After Dark: nachtstijl, eigen aanmelding, Vonk en gelijkwaardige reacties. Pas daarna de overige tabbladen in dezelfde stijl aan.
5. Na Toms beoordeling het logo en de Android-lagen inbouwen. De bestaande SDK 58-documentatie en AGENTS.md blijven leidend bij het aanpassen van Expo-configuratie.

## Bestand naar bestaande plek

| Ontwerp | Bestaande plek |
|---|---|
| Dagpallet en typografie | `src/theme.ts`, `src/components/ui.tsx` |
| Nachtpallet en knoppen | `src/theme.ts`, `src/components/night.tsx` |
| Meer samen | `src/app/(tabs)/vandaag.tsx`, `src/lib/stations.ts` |
| Vandaag | `src/app/(tabs)/vandaag.tsx` |
| Check-in | `src/app/checkin.tsx` |
| After Dark aanzetten en tabs | `src/app/afterdark.tsx` |
| Vonk en binnenkomende reactie | `src/components/vonk.tsx` |
| Navigatie-iconen | `src/components/icon.tsx`, `src/app/(tabs)/_layout.tsx` |
| Logo en adaptive lagen | Later: bestaande app-assets en `app.json` |

## Toestanden die de beelden niet allemaal tonen

De vier beelden zijn referenties voor een geselecteerde toestand. Bestaande functies blijven aanwezig. Behoud onder andere de demo-uitleg, uitnodigen/koppelcode, binnenkomende gebaren, voor jou gedane missie met **Ik merkte het**, beide check-ins met het gedeelde dagbeeld, missienotitie, verdiende punten na bevestiging van de partner, geclaimde beloningen, voltooide dagkaart en alle meldingen bij plekken.

De compacte Vonk-kaart op Vandaag blijft alleen zichtbaar wanneer `state.afterDark.active` waar is. Dit moet dezelfde visuele taal krijgen als het actieve nachtvoorbeeld. Die toestand is in het Vandaag-voorbeeld bewust niet actief.

De demo-interactie voor “Gedaan!” toont alleen een toelichting en werkt de bestaande notitiestap niet uit. Neem de bestaande notitiestap ongewijzigd mee in de echte app. “Andere voorstellen” in de preview is eveneens een visuele demonstratie, geen nieuwe aanbevelingslogica.

## Privacy en inhoud die gelijk blijven

- Eigen check-in en partnerantwoorden worden volgens de bestaande regels onthuld, niet door visuele logica.
- **Ik merkte het** blijft de stap waardoor een gedaan gebaar punten krijgt. Geen punten bij alleen een keuze of afvinken.
- After Dark gaat uitsluitend open met twee toestemmingen en gebruikt de mildste gekozen sfeer. Toon geen status van de andere toestemming.
- Een eigen opt-in mag het actieve scherm niet openen. Het actieve ontwerp is een losse voorbeeldtoestand waarin de toestemming van beide partners al aanwezig is.
- Matchinhoud wordt uitsluitend afgeleid uit `ad.spark.match` en de bestaande gedeelde serveruitkomst. Nooit uit een partnergetal. Het prototype wist een voorbeeldmatch bij het wijzigen van je eigen keuze; dit is uitsluitend een veilige visuele simulatie.
- Wensen, nee, lage vonkwaarden en precieze antwoorden worden niet ineens zichtbaar. Houd bestaande privacytests en serverregels in stand.
- De opties “Ik ook”, “Later vandaag” en “Vanavond niet, wel een knuffel” blijven even makkelijk bereikbaar. Geen extra meldingen, partnerherinneringen of automatische berichten.
- Houd “Staat aan voor jou”, uitzetten en keuze van eigen sfeer bereikbaar. Als één partner uitzet gaat After Dark voor beiden dicht.
- Bestaande termen en IDs behouden: stemming “Prima” is ID `ok`; de getekende gezicht-iconen veranderen uitsluitend de presentatie.

## Visuele en mobiele controle na implementatie

Gebruik minimaal 44 × 44 dp voor raakvlakken en laat tekst schalen met de systeeminstelling. De artboards hebben een vaste kijkhoogte; de echte app moet meebewegen met toetsenbord, safe areas, lange namen en grotere tekst. Stapel opties als dat nodig is. De 1 tot 5 energieknoppen en 0 tot 4 vonkknoppen mogen geen raakvlakken verliezen op een smal scherm.

De Android-voorgrond staat op een 108 dp raster. Alle niet-transparante pixels liggen in de cirkel met diameter 66 dp. Controleer rond, vierkant en verschillende launcher-maskers op een echt toestel; het aangeleverde beeld is nog geen toesteltest. Android monochroom gebruikt alleen alpha voor de vorm. De PNG's bevatten geen afgeronde hoek als baked-in masker.

Het brede losse merkteken is voor het app-icoon optisch hoger gemaakt, zodat het op klein formaat meer ruimte krijgt. Het bestand `2026-10-26-appicoon-preview.svg` gebruikt een centrale uitsnede van 72 dp om de normale weergave te beoordelen; gebruik deze uitsnede niet als adaptive voorgrond. De voorgrond en achtergrond zelf blijven 108 dp. Bron: [Android Developers: Adaptive icons](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive?hl=en).

Voer bij appwijzigingen de verplichte typecheck en lint uit, en controleer de bestaande privacyflows. Er zijn geen Expo- of React Native-API's gewijzigd in dit pakket.

## Besluit nodig van Tom

Akkoord op de visuele richting en de nieuwe uitwerking van het handpalmen-teken voordat dit als definitieve merkstijl wordt behandeld.

## Nog aan te leveren

Toms correcties. De LoveGotchi, splash, winkelbeelden en overige schermen volgen na het vastleggen van de richting.

## Status

**Gereed voor correctieronde**
