import type { Card } from './content';

// After Dark: the optional 18+ part for couples. It opens only when both partners switch it
// on, and the mildest of the two chosen moods applies. Text only: playful and suggestive,
// never explicit, so it stays within the app store rules.

export type AdLevel = 1 | 2 | 3;

export const adLevels: { level: AdLevel; name: string; blurb: string }[] = [
  { level: 1, name: 'Romantisch', blurb: 'Lieve vragen, kaarslicht en vlinders' },
  { level: 2, name: 'Flirterig', blurb: 'Speels, ondeugend en een tikje spannend' },
  { level: 3, name: 'Ongegeneerd fout', blurb: 'Jullie eigen humor, zonder schaamte' },
];

export type AdCard = Card & { level: AdLevel };

const card = (level: AdLevel, i: number, question: string): AdCard => ({ id: `ad${level}-${i}`, theme: 'afterdark', question, level });

export const adCards: AdCard[] = [
  ...[
    'Wat was het moment waarop je wist dat je verliefd op me was?',
    'Op welke plek zou je graag een romantische avond met mij hebben?',
    'Wat vind je het mooiste aan mij als ik niet oplet?',
    'Welke herinnering aan ons geeft je nog steeds vlinders?',
    'Hoe ziet een perfecte avond voor ons tweeën eruit?',
    'Welk liedje hoort bij ons, en waarom?',
  ].map((q, i) => card(1, i + 1, q)),
  ...[
    'Wat doe ik waardoor je me meteen wilt zoenen?',
    'Welk kledingstuk vind je het leukst aan mij?',
    'Waar zou je me het liefst eens onverwacht zoenen?',
    'Wat is het meest flirterige berichtje dat je me ooit wilde sturen?',
    'Wanneer vond je mij het aantrekkelijkst?',
    'Welke aanraking van mij maakt je zwak?',
  ].map((q, i) => card(2, i + 1, q)),
  ...[
    'Als ons bed kon praten, wat zou het dan over ons zeggen?',
    'Welke titel zou jij ons liefdesleven geven als het een film was?',
    'Wat is iets ondeugends dat je ooit nog eens wilt proberen?',
    'Welke fantasie zou je durven delen als ik beloof niet te lachen?',
    'Op een schaal van 1 tot olympisch: hoe sportief zijn wij?',
    'Wat zou je in ons ondeugende boekje als eerste opschrijven?',
  ].map((q, i) => card(3, i + 1, q)),
];

export type Wish = { id: string; text: string; level: AdLevel };
export type WishAnswer = 'ja' | 'misschien' | 'nee';

const wish = (level: AdLevel, i: number, text: string): Wish => ({ id: `w${level}-${i}`, text, level });

export const wishes: Wish[] = [
  ...[
    'Samen in bad, met kaarsjes',
    'Een avond om de beurt masseren',
    'Samen slowdansen in de woonkamer',
    'Een weekendje weg met z’n tweeën',
    'Ontbijt op bed met een lange knuffel',
    'Een romantische brief aan elkaar schrijven',
  ].map((t, i) => wish(1, i + 1, t)),
  ...[
    'Een potje strippoker (of stripmemory)',
    'Elkaar een ondergoedcadeau geven',
    'Een date waarop we doen alsof we elkaar net kennen',
    'Een avond flirten via berichtjes terwijl we allebei thuis zijn',
    'Elkaar geblinddoekt laten proeven',
    'Samen een spannend boek lezen',
  ].map((t, i) => wish(2, i + 1, t)),
  ...[
    'Iets nieuws uitproberen in de slaapkamer',
    'Een rollenspel, met verkleedkleren',
    'Samen een cadeautje uit een erotiekwinkel uitzoeken',
    'Een fantasie die we nog nooit hebben uitgesproken',
    'Een ja-dag, waarop we elkaars wensen vervullen (binnen onze grenzen)',
    'Samen een ondeugende verlanglijst maken',
  ].map((t, i) => wish(3, i + 1, t)),
];

export type Sticker = { id: string; name: string; emoji: string; line: string };

export const adStickers: Sticker[] = [
  { id: 'mondige-medaille', name: 'De Mondige Medaille', emoji: '🏅', line: 'De jury verzoekt de winnaar vriendelijk even op adem te komen.' },
  { id: 'matrasworstelen', name: 'Olympisch Matrasworstelen', emoji: '🏆', line: 'De jury geeft een tien voor enthousiasme.' },
  { id: 'brandgevaar', name: 'Brandgevaar!', emoji: '🔥', line: 'Er zijn verdachte hoeveelheden romantiek waargenomen.' },
  { id: 'durfal', name: 'De Durfal', emoji: '😈', line: 'Een spannende wens durven delen. De uitvoering is optioneel.' },
  { id: 'dekbedduiker', name: 'De Grote Dekbedduiker', emoji: '🛏️', line: 'Verdwijnt spoorloos onder het dekbed en komt glimlachend terug.' },
  { id: 'fluisteraar', name: 'De Oorfluisteraar', emoji: '💋', line: 'Wist precies wat er gezegd moest worden, en hoe zacht.' },
];

export const adStickerById = new Map(adStickers.map(s => [s.id, s]));
export const adCardById = new Map(adCards.map(c => [c.id, c]));
