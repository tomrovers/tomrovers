# Focus

**Samen helpt een stel om beter met elkaar te communiceren en in elkaar te investeren, op een leuke, speelse manier.**

Elke nieuwe functie moet deze vraag met "ja" beantwoorden:
> Helpt dit ons om beter met elkaar te communiceren of om in elkaar te investeren?

Is het antwoord nee of "niet echt", dan gaat het idee naar de lijst **Later**.

## De kern: elke dag 2 tot 5 minuten

1. **Check-in**: hoe gaat het met je, en waar heb je behoefte aan?
2. **Iets voor je partner**: kies één klein gebaar uit drie voorstellen, afgestemd op de liefdestaal en de behoefte van je partner. Je partner ziet niet wat je kiest.
3. **Ik merkte het ❤️**: je partner bevestigt dat het aankwam. Pas dan krijgen jullie allebei punten. De app beloont dat de ander zich gezien voelt, niet het afvinken.
4. **Gesprek van de dag**: één gesprekskaart. Wat je ontdekt, kun je bewaren in het Kompas, zodat de voorstellen steeds beter passen.

Spelelementen ondersteunen de kern: een gezamenlijk level (samen, niet tegen elkaar), de week in één oogopslag zonder reeks om te verliezen, stickers, spelletjes en de beloningenpot.

## Hoe de app is opgebouwd voor later

Elk onderdeel is een **plek** in `src/lib/stations.ts`: naam, icoon, scherm, en een melding als er iets wacht. Nu staan de plekken als kaarten op het Vandaag-scherm. Later wordt elke plek een hotspot in een 3D-huis dat je samen inricht (zoals de Gallery in Outlaw Sirens): de kalender voor de check-in, de kaartendoos voor gesprekken, de spelletjeskast voor spellen. Een nieuw onderdeel toevoegen is dan een nieuwe plek, zonder de rest te veranderen.

## Later

- Het huis als 3D-ruimte om doorheen te lopen, met plekken om iets te doen en kamers die je samen vrijspeelt. Een isometrische versie staat al geparkeerd in `src/app/(tabs)/thuis.tsx` en `src/components/house/`.
- Echte 3D-avatars vanaf een foto (Avaturn is gratis; MetaPerson niet).
- Live samen in het huis rondlopen.
- After Dark (18+): ondeugende kaarten en stickers.
- Samen Singles, het Samen Plein en Couples Plus.
