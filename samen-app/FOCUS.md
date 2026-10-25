# Focus

**Samen helpt partners om tot de diepere lagen van elkaar te komen: meer begrip voor elkaar, en richtlijnen om samen gelukkiger te worden. Op een leuke, speelse manier.**

Het oorspronkelijke idee achter Samen: dat stellen door de app ook op seksueel gebied meer **synchroniteit** krijgen. Dat is niet het enige waar het om draait, maar het hoort er wezenlijk bij. Wie elkaar beter begrijpt en vaker laat zien wat er speelt, raakt ook in bed beter op elkaar afgestemd. En andersom.

En: *couples who play together, stay together*. Samen spelen is geen bijzaak, het is een van de manieren waarop je in elkaar investeert.

Elke nieuwe functie moet deze vraag met "ja" beantwoorden:
> Helpt dit ons om elkaar beter te begrijpen, beter te communiceren of in elkaar te investeren?

Is het antwoord nee of "niet echt", dan gaat het idee naar de lijst **Later**.

## De kern: elke dag 2 tot 5 minuten

1. **Check-in**: hoe gaat het met je, en waar heb je behoefte aan?
2. **Iets voor je partner**: kies één klein gebaar uit drie voorstellen, afgestemd op de liefdestaal en de behoefte van je partner. Je partner ziet niet wat je kiest.
3. **Ik merkte het ❤️**: je partner bevestigt dat het aankwam. Pas dan krijgen jullie allebei punten. De app beloont dat de ander zich gezien voelt, niet het afvinken.
4. **Gesprek van de dag**: één gesprekskaart. Wat je ontdekt, kun je bewaren in het Kompas, zodat de voorstellen steeds beter passen.

## After Dark (18+): synchroniteit

After Dark hoort bij de kern, niet bij de extra's. Het gaat alleen open als jullie het allebei aanzetten, en de mildste van jullie twee sferen geldt. Wie het aanzet, ziet niet of de ander dat al deed. Alleen tekst, speels en suggestief, nooit expliciet.

Het doel is dat jullie zin en wensen vaker samenvallen, zonder dat iemand zich afgewezen of onder druk gezet voelt. De regel die overal geldt: **je ziet alleen wat jullie allebei willen, nooit een nee of een laag getal van de ander.**

- **Vonk** (dagelijks, ook op Vandaag): tik in een seconde aan hoeveel zin je hebt, van 0 tot 4 vlammetjes. Alleen als jullie allebei zin hebben, zien jullie dat. Met een vonk laat je weten dat je aan je partner denkt; die kan ja zeggen, later, of liever een knuffel. Na een tijdje laat de app zien op welke dag jullie zin het vaakst samenvalt.
- **Afstemmen**: acht vragen over hoe vaak, wie begint, sfeer, avontuur, praten, erna, het beste moment en plannen. Jullie zien niet elkaars antwoord, alleen of jullie op één lijn zitten, met een richtlijn om erover te praten.
- **Wensenlijst**: ja, misschien of nee per wens; alleen de matches verschijnen.
- **Kaarten, stickers en trofeeën**: gesprekken over intimiteit, ondeugende stickers die de ander moet accepteren, en trofeeën als *Op één lijn* en *Vonkenregen*.
- **Flirterige opdrachten** tussen de gewone voorstellen in Vandaag.

## Spelen

Spelelementen ondersteunen de kern: een gezamenlijk level (samen, niet tegen elkaar), de week in één oogopslag zonder reeks om te verliezen, stickers, spelletjes en de beloningenpot. De trofee **Couples who play together, stay together** verdienen jullie door in vier verschillende weken samen te spelen: het gaat om de gewoonte, niet om het winnen.

## Hoe de app is opgebouwd voor later

Elk onderdeel is een **plek** in `src/lib/stations.ts`: naam, icoon, scherm, en een melding als er iets wacht. Nu staan de plekken als kaarten op het Vandaag-scherm. Later wordt elke plek een hotspot in een 3D-huis dat je samen inricht (zoals de Gallery in Outlaw Sirens): de kalender voor de check-in, de kaartendoos voor gesprekken, de spelletjeskast voor spellen. Een nieuw onderdeel toevoegen is dan een nieuwe plek, zonder de rest te veranderen.

## Later

- Het huis als 3D-ruimte om doorheen te lopen, met plekken om iets te doen en kamers die je samen vrijspeelt. Een isometrische versie staat al geparkeerd in `src/app/(tabs)/thuis.tsx` en `src/components/house/`.
- Echte 3D-avatars vanaf een foto (Avaturn is gratis; MetaPerson niet).
- Live samen in het huis rondlopen.
- Samen Singles, het Samen Plein en Couples Plus.
