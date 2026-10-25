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

// ---- Vonk: daily desire, revealed only when it matches ----

/** 0 to 4 flames. Only a match is ever shown; a low number never reaches the partner's screen. */
export const sparkLabels = ['Vandaag niet', 'Een beetje', 'Wel zin', 'Veel zin', 'Heel veel zin'];

export type VonkReply = 'ja' | 'later' | 'knuffel';
export const vonkReplies: { id: VonkReply; label: string; seen: string }[] = [
  { id: 'ja', label: 'Ik ook 😍', seen: 'heeft ook zin 😍' },
  { id: 'later', label: 'Later vandaag', seen: 'zegt: later vandaag 😏' },
  { id: 'knuffel', label: 'Vanavond niet, wel een knuffel', seen: 'heeft vanavond geen zin, maar wel in een knuffel 🤗' },
];

// ---- Op één lijn: what each of you wants, compared without showing the answers ----

export type Alignment = 'samen' | 'dichtbij' | 'verschil';

export type AlignQuestion = {
  id: string;
  question: string;
  options: string[];
  /** How two answers compare. Default: by distance between the options. */
  compare?: (a: number, b: number) => Alignment;
  tips: Record<Alignment, string>;
};

const byDistance = (a: number, b: number): Alignment => (a === b ? 'samen' : Math.abs(a - b) === 1 ? 'dichtbij' : 'verschil');

export const alignQuestions: AlignQuestion[] = [
  {
    id: 'vaak',
    question: 'Hoe vaak zou je het liefst intiem zijn?',
    options: ['Af en toe', 'Eens per week', 'Een paar keer per week', 'Bijna elke dag'],
    tips: {
      samen: 'Jullie willen ongeveer even vaak. Fijn: daar hoeft niemand op te wachten.',
      dichtbij: 'Een klein verschil, heel normaal. Vraag elkaar: wat maakt dat je soms meer of minder zin hebt?',
      verschil: 'Hier verschillen jullie. Dat is niet erg, maar wel goed om over te praten. Vraag: wat zou voor ons allebei goed voelen? Nabijheid zonder seks telt ook.',
    },
  },
  {
    id: 'initiatief',
    question: 'Wie zou er vaker het initiatief mogen nemen?',
    options: ['Ik', 'Allebei evenveel', 'Mijn partner'],
    // Complementary answers fit: "ik" and "mijn partner" from the other side mean the same thing.
    compare: (a, b) => (a + b === 2 ? 'samen' : a + b < 2 ? 'dichtbij' : 'verschil'),
    tips: {
      samen: 'Jullie verwachtingen over wie begint passen bij elkaar.',
      dichtbij: 'Jullie willen allebei graag vaker beginnen. Prima: spreek af dat het allebei mag, en dat een nee ook altijd mag.',
      verschil: 'Jullie wachten allebei op de ander. Vraag: hoe zou je het fijn vinden dat ik begin? Een vonk sturen in de app is een makkelijke eerste stap.',
    },
  },
  {
    id: 'romantiek',
    question: 'Hoe belangrijk zijn romantiek en sfeer vooraf?',
    options: ['Niet zo', 'Een beetje', 'Belangrijk', 'Heel belangrijk'],
    tips: {
      samen: 'Jullie denken hetzelfde over sfeer. Houd vast wat werkt.',
      dichtbij: 'Bijna hetzelfde. Vraag: wat is voor jou de fijnste aanloop naar een intiem moment?',
      verschil: 'Voor een van jullie begint intimiteit al ruim vooraf. Spreek af wat jullie samen doen om in de stemming te komen: kaarsjes, een berichtje overdag, eerst samen eten.',
    },
  },
  {
    id: 'avontuur',
    question: 'Hoeveel zin heb je in nieuwe dingen proberen?',
    options: ['Liever vertrouwd', 'Af en toe iets nieuws', 'Graag', 'Heel graag'],
    tips: {
      samen: 'Jullie zitten op dezelfde golflengte. Kijk samen in de wensenlijst wat jullie aanspreekt.',
      dichtbij: 'Een klein verschil. De wensenlijst helpt: daar zie je alleen wat jullie allebei leuk vinden.',
      verschil: 'Een van jullie wil meer avontuur. Begin klein, bij wat jullie allebei een ja of misschien gaven, en spreek af dat stoppen altijd mag.',
    },
  },
  {
    id: 'praten',
    question: 'Hoe makkelijk vind je het om over seks te praten?',
    options: ['Lastig', 'Gaat wel', 'Makkelijk', 'Heel makkelijk'],
    tips: {
      samen: 'Jullie voelen je even (on)gemakkelijk. Gebruik de After Dark-kaarten als zachte start.',
      dichtbij: 'Bijna hetzelfde. Een kaart van de dag maakt het gesprek vanzelf makkelijker.',
      verschil: 'Voor een van jullie is praten lastiger. Begin met de romantische kaarten en luister zonder te oordelen. Schrijven in de app kan makkelijker zijn dan hardop zeggen.',
    },
  },
  {
    id: 'erna',
    question: 'Wat heb je erna het liefst?',
    options: ['Knuffelen', 'Napraten', 'Even rust', 'Maakt niet uit'],
    compare: (a, b) => (a === b || a === 3 || b === 3 ? 'samen' : 'verschil'),
    tips: {
      samen: 'Jullie hebben erna hetzelfde nodig, of een van jullie vindt het prima. Mooi.',
      dichtbij: 'Bijna hetzelfde.',
      verschil: 'Jullie hebben erna iets anders nodig. Spreek af: eerst even het een, dan het ander. Zo voelt iedereen zich goed.',
    },
  },
  {
    id: 'moment',
    question: 'Wanneer ben je het vaakst in de stemming?',
    options: ['Ochtend', 'Middag', 'Avond', 'Nacht'],
    compare: (a, b) => (a === b ? 'samen' : Math.abs(a - b) === 1 ? 'dichtbij' : 'verschil'),
    tips: {
      samen: 'Jullie piekmoment valt samen. Bescherm dat moment: geen telefoons, geen klusjes.',
      dichtbij: 'Jullie beste momenten liggen dicht bij elkaar. Zoek het overgangsmoment op.',
      verschil: 'Jullie beste momenten verschillen. Wissel af: soms het moment van de een, soms van de ander. Plan er af en toe een in het weekend.',
    },
  },
  {
    id: 'plannen',
    question: 'Hoe sta je tegenover een afgesproken moment?',
    options: ['Spontaan is beter', 'Allebei prima', 'Plannen geeft me juist rust'],
    tips: {
      samen: 'Jullie denken hetzelfde over plannen.',
      dichtbij: 'Een klein verschil. Combineer: plan een avond samen, en laat open wat er gebeurt.',
      verschil: 'Voor de een is spontaan het leukst, voor de ander geeft plannen rust. Probeer een vaste date-avond, met ruimte voor verrassing.',
    },
  },
];

export function alignmentOf(q: AlignQuestion, a: number, b: number): Alignment {
  return (q.compare ?? byDistance)(a, b);
}
