import type { CardTone } from '@/theme';

import type { GestureKind, LoveLanguage, Mood, Need } from './types';

export const moods: { id: Mood; label: string; emoji: string }[] = [
  { id: 'blij', label: 'Blij', emoji: '😊' },
  { id: 'ok', label: 'Prima', emoji: '🙂' },
  { id: 'druk', label: 'Beetje druk', emoji: '😵‍💫' },
  { id: 'moe', label: 'Moe', emoji: '😴' },
  { id: 'verdrietig', label: 'Niet zo lekker', emoji: '🥺' },
];

export const needs: { id: Need; label: string }[] = [
  { id: 'rust', label: 'Rust' },
  { id: 'aandacht', label: 'Aandacht' },
  { id: 'gezelligheid', label: 'Gezelligheid' },
  { id: 'intimiteit', label: 'Intimiteit' },
  { id: 'ruimte', label: 'Even tijd voor mezelf' },
];

export const gestures: { id: GestureKind; label: string; emoji: string; sent: string }[] = [
  { id: 'compliment', label: 'Compliment', emoji: '💐', sent: 'een compliment' },
  { id: 'knuffel', label: 'Knuffel', emoji: '🤗', sent: 'een knuffel' },
  { id: 'hartje', label: 'Hartje', emoji: '❤️', sent: 'een hartje' },
  { id: 'bericht', label: 'Lief bericht', emoji: '💌', sent: 'een lief bericht' },
];

export const complimentIdeas = [
  'Ik vind het knap hoe je vandaag alles hebt aangepakt.',
  'Je maakt me altijd aan het lachen.',
  'Ik ben trots op je.',
  'Ik vind het fijn om naast je wakker te worden.',
  'Je bent mijn favoriete mens.',
];

export const loveLanguages: { id: LoveLanguage; label: string; tip: string }[] = [
  { id: 'qualitytime', label: 'Qualitytime', tip: 'Plan vanavond een half uur samen, zonder telefoons.' },
  { id: 'aanraking', label: 'Lichamelijke nabijheid', tip: 'Een lange knuffel doet vandaag extra veel.' },
  { id: 'woorden', label: 'Waarderende woorden', tip: 'Vertel wat je vandaag in je partner waardeert.' },
  { id: 'hulp', label: 'Hulp & attenties', tip: 'Neem ongevraagd een klusje uit handen.' },
  { id: 'cadeautjes', label: 'Kleine verrassingen', tip: 'Een klein verrassinkje maakt de dag.' },
];

export type Card = { id: string; theme: string; question: string };

export const cardThemes: { id: string; label: string; tone: CardTone }[] = [
  { id: 'liefde', label: 'Liefde & waardering', tone: 'pink' },
  { id: 'dagelijks', label: 'Dagelijks leven', tone: 'lav' },
  { id: 'communicatie', label: 'Communicatie', tone: 'mint' },
  { id: 'dromen', label: 'Dromen', tone: 'peach' },
  { id: 'intimiteit', label: 'Intimiteit', tone: 'blue' },
];

const q = (theme: string, items: string[]): Card[] =>
  items.map((question, i) => ({ id: `${theme}-${i + 1}`, theme, question }));

export const cards: Card[] = [
  ...q('liefde', [
    'Wanneer voel jij je écht gezien?',
    'Welk klein gebaar van mij maakt jouw dag beter?',
    'Waar ben je trots op in onze relatie?',
    'Welk moment met mij zou je nog eens willen herbeleven?',
    'Hoe laat ik het beste merken dat ik van je houd?',
  ]),
  ...q('dagelijks', [
    'Welke kleine gewoonte geeft jou rust?',
    'Hoe ziet voor jou een perfecte zondag eruit?',
    'Waar krijg je onverwacht energie van?',
    'Welk klusje doe je stiekem graag?',
    'Wat zou je graag vaker samen doen doordeweeks?',
  ]),
  ...q('communicatie', [
    'Wat helpt jou als we een lastige dag hebben?',
    'Hoe merk ik het beste dat je even ruimte nodig hebt?',
    'Wat wil je liever horen na een ruzie?',
    'Waar vind je het lastig om over te praten?',
    'Hoe wil je dat ik reageer als je stress hebt?',
  ]),
  ...q('dromen', [
    'Wat zouden we samen ooit nog willen beleven?',
    'Waar wil je over vijf jaar wonen?',
    'Welke reis staat bovenaan jouw lijstje?',
    'Wat zou je doen als geld geen rol speelde?',
    'Welke traditie zou je samen willen beginnen?',
  ]),
  ...q('intimiteit', [
    'Wat is voor jou een fijn moment van nabijheid?',
    'Wanneer voel je je het meest verbonden met mij?',
    'Wat maakt een avond voor jou romantisch?',
    'Welke aanraking vind je het fijnst op een gewone dag?',
    'Wat zou je graag vaker van mij willen horen?',
  ]),
];

export type KjmQuestion = { id: string; question: string; options: string[] };

// "Ken je mij?" – everyone answers about themselves and guesses what the partner picked.
export const kjmQuestions: KjmQuestion[] = [
  { id: 'zondag', question: 'Ideale zondagochtend?', options: ['Uitslapen', 'Ontbijt op bed', 'Wandelen', 'Sporten'] },
  { id: 'eten', question: 'Favoriete avondeten?', options: ['Pasta', 'Sushi', 'Pizza', 'Iets van de BBQ'] },
  { id: 'vakantie', question: 'Droomvakantie?', options: ['Strand', 'Stedentrip', 'Bergen', 'Roadtrip'] },
  { id: 'stress', question: 'Wat helpt het best bij stress?', options: ['Praten', 'Alleen zijn', 'Bewegen', 'Een knuffel'] },
  { id: 'film', question: 'Filmavond, welk genre?', options: ['Romantisch', 'Actie', 'Comedy', 'Thriller'] },
  { id: 'date', question: 'Leukste date?', options: ['Uit eten', 'Thuis koken', 'Iets actiefs', 'Festival of concert'] },
  { id: 'liefde', question: 'Waarmee laat je het liefst je liefde zien?', options: ['Woorden', 'Tijd samen', 'Aanraking', 'Iets doen voor de ander'] },
  { id: 'ochtend', question: 'Ochtendmens of avondmens?', options: ['Echt ochtend', 'Eerder ochtend', 'Eerder avond', 'Echt avond'] },
  { id: 'cadeau', question: 'Leukste cadeau om te krijgen?', options: ['Een beleving', 'Iets handigs', 'Iets zelfgemaakts', 'Bloemen'] },
  { id: 'feest', question: 'Op een feestje ben jij…', options: ['Op de dansvloer', 'In de keuken aan het praten', 'Als eerste weg', 'De organisator'] },
  { id: 'drankje', question: 'Favoriete drankje?', options: ['Koffie', 'Thee', 'Wijn', 'Iets fris'] },
  { id: 'superkracht', question: 'Welke superkracht?', options: ['Vliegen', 'Teleporteren', 'Gedachten lezen', 'Tijd stilzetten'] },
];

export const KJM_PER_ROUND = 5;

export function kjmRoundQuestions(round: number): KjmQuestion[] {
  // A deterministic rotation so both partners always get the same questions for a round.
  const start = ((round - 1) * KJM_PER_ROUND) % kjmQuestions.length;
  return Array.from({ length: KJM_PER_ROUND }, (_, i) => kjmQuestions[(start + i) % kjmQuestions.length]);
}

export const defaultRewards = [
  'Een massage van tien minuten',
  'De film voor vanavond kiezen',
  'Ontbijt op bed',
  'Een mini-date laten organiseren',
  'Een klusje uit handen genomen',
];

export type HouseItemId =
  | 'plant'
  | 'sfeerlamp'
  | 'fotolijst'
  | 'boekenkast'
  | 'kristallen-bol'
  | 'arcadetrofee'
  | 'kussens'
  | 'kompas-schilderij'
  | 'lichtslinger';

export type Achievement = { id: string; title: string; description: string; item: HouseItemId; itemLabel: string };

export const achievements: Achievement[] = [
  { id: 'eerste-dagbeeld', title: 'Het eerste dagbeeld', description: 'Jullie checkten allebei op dezelfde dag in.', item: 'plant', itemLabel: 'Een plantje' },
  { id: 'qualitytime-helden', title: 'Qualitytime-helden', description: 'Zeven dagen samen ingecheckt.', item: 'sfeerlamp', itemLabel: 'Een gezellige sfeerlamp' },
  { id: 'de-charmeur', title: 'De Charmeur', description: 'Vijf complimenten gegeven.', item: 'fotolijst', itemLabel: 'Een gouden fotolijst' },
  { id: 'diepe-gesprekken', title: 'Diepe gesprekken', description: 'Vijf gesprekskaarten samen beantwoord.', item: 'boekenkast', itemLabel: 'Een boekenkast' },
  { id: 'de-gedachtenlezer', title: 'De Gedachtenlezer', description: 'Minstens 4 van de 5 goed bij Ken je mij?', item: 'kristallen-bol', itemLabel: 'Een kristallen bol' },
  { id: 'de-revanchekoning', title: 'De Revanchekoning', description: 'Een Reflex Battle gewonnen direct na een verlies.', item: 'arcadetrofee', itemLabel: 'Een arcadetrofee' },
  { id: 'verwenmoment', title: 'Verwenmoment', description: 'De eerste beloning verzilverd.', item: 'kussens', itemLabel: 'Zachte kussens' },
  { id: 'kompas-ontdekkers', title: 'Kompas-ontdekkers', description: 'Jullie vulden allebei je liefdestalen in.', item: 'kompas-schilderij', itemLabel: 'Een kompas-schilderij' },
  { id: 'spelletjesavond', title: 'Spelletjesavond', description: 'Vijf spellen samen gespeeld.', item: 'lichtslinger', itemLabel: 'Een lichtslinger' },
];

export const randomCompliment = () => complimentIdeas[Math.floor(Math.random() * complimentIdeas.length)];
