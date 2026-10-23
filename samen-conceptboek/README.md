# Samen – conceptboek

Het vernieuwde conceptboek voor de app **Samen**, als A4-PDF in de stijl van het oorspronkelijke boek.

- `Samen_Conceptboek.pdf` – het resultaat (21 pagina's)
- `tekst.md` – de vernieuwde brontekst
- `conceptboek.html` – opmaak van alle pagina's
- `assets/` – illustraties (uit het oorspronkelijke conceptboek) en het Lato-lettertype

Opnieuw genereren na een wijziging in `conceptboek.html`:

```sh
npm install playwright   # eenmalig
node build.mjs           # schrijft Samen_Conceptboek.pdf en meldt pagina's die niet passen
```
