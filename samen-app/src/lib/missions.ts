import type { LoveLanguage, LoveLanguageScores, Need } from './types';

// The daily "opdracht": one small, loving act for your partner. The partner confirms
// they noticed it, and only then do you both earn points: the app rewards that the
// other person felt seen, not that a box was ticked.

export type Mission = { id: string; title: string; detail: string; lang: LoveLanguage; needs: Need[]; minutes: number; /** After Dark mood it needs; absent for everyday acts. */ ad?: 1 | 2 | 3 };

export const missions: Mission[] = [
  // Qualitytime
  { id: 'qt-telefoonvrij', title: 'Een kwartier zonder telefoons', detail: 'Leg allebei je telefoon weg en vraag: wat was het leukste van je dag?', lang: 'qualitytime', needs: ['aandacht', 'gezelligheid'], minutes: 15 },
  { id: 'qt-wandeling', title: 'Een rondje samen', detail: 'Stel een korte wandeling voor, gewoon om even samen buiten te zijn.', lang: 'qualitytime', needs: ['gezelligheid', 'rust'], minutes: 20 },
  { id: 'qt-thee', title: 'Thee en bijpraten', detail: 'Zet iets lekkers te drinken en ga er echt even bij zitten.', lang: 'qualitytime', needs: ['rust', 'aandacht'], minutes: 10 },
  { id: 'qt-date', title: 'Plan een mini-date', detail: 'Zet iets kleins in de agenda voor deze week: samen koken, een film of een terrasje.', lang: 'qualitytime', needs: ['gezelligheid'], minutes: 5 },
  { id: 'qt-herinnering', title: 'Weet je nog…', detail: 'Haal samen een fijne herinnering op en vertel waarom die je bijbleef.', lang: 'qualitytime', needs: ['gezelligheid', 'aandacht'], minutes: 10 },
  // Lichamelijke nabijheid
  { id: 'ar-knuffel', title: 'Een knuffel van 20 seconden', detail: 'Niet loslaten na drie tellen. Twintig seconden, gewoon even samen.', lang: 'aanraking', needs: ['aandacht', 'intimiteit', 'rust'], minutes: 1 },
  { id: 'ar-hand', title: 'Hand vasthouden', detail: 'Pak de hand van je partner, op de bank of onderweg.', lang: 'aanraking', needs: ['gezelligheid', 'intimiteit'], minutes: 1 },
  { id: 'ar-schouders', title: 'Schouders losmaken', detail: 'Bied een korte schoudermassage aan, zonder dat er iets terug hoeft.', lang: 'aanraking', needs: ['rust', 'intimiteit'], minutes: 5 },
  { id: 'ar-bank', title: 'Dicht tegen elkaar aan', detail: 'Kruip vanavond op de bank tegen je partner aan.', lang: 'aanraking', needs: ['rust', 'intimiteit', 'gezelligheid'], minutes: 10 },
  // Waarderende woorden
  { id: 'wo-waardering', title: 'Zeg wat je waardeert', detail: 'Vertel één concreet ding dat je vandaag in je partner waardeerde.', lang: 'woorden', needs: ['aandacht'], minutes: 1 },
  { id: 'wo-briefje', title: 'Een briefje verstoppen', detail: 'Leg een lief briefje waar je partner het vandaag vindt.', lang: 'woorden', needs: ['aandacht', 'gezelligheid'], minutes: 3 },
  { id: 'wo-trots', title: 'Ik ben trots op je', detail: 'Zeg waar je trots op bent: iets wat je partner deed of hoe die iets aanpakte.', lang: 'woorden', needs: ['aandacht'], minutes: 1 },
  { id: 'wo-berichtje', title: 'Een berichtje overdag', detail: 'Stuur midden op de dag een berichtje dat je aan je partner denkt.', lang: 'woorden', needs: ['aandacht', 'ruimte'], minutes: 1 },
  { id: 'wo-luisteren', title: 'Echt luisteren', detail: 'Vraag hoe het écht gaat, luister zonder oplossingen en vat samen wat je hoorde.', lang: 'woorden', needs: ['aandacht', 'rust'], minutes: 10 },
  // Hulp & attenties
  { id: 'hu-klusje', title: 'Neem een klusje over', detail: 'Doe vandaag iets wat normaal op het lijstje van je partner staat.', lang: 'hulp', needs: ['rust', 'ruimte'], minutes: 15 },
  { id: 'hu-koffie', title: 'Koffie of thee klaarzetten', detail: 'Zet ongevraagd iets te drinken klaar, precies zoals je partner het lekker vindt.', lang: 'hulp', needs: ['rust'], minutes: 3 },
  { id: 'hu-avondeten', title: 'Zorg voor het eten', detail: 'Regel het avondeten, zodat je partner nergens aan hoeft te denken.', lang: 'hulp', needs: ['rust', 'ruimte'], minutes: 30 },
  { id: 'hu-ruimte', title: 'Geef wat ruimte', detail: 'Bied een uurtje voor zichzelf aan en vang op wat er in dat uur moet gebeuren.', lang: 'hulp', needs: ['ruimte', 'rust'], minutes: 5 },
  // Kleine verrassingen
  { id: 'ca-lekkers', title: 'Iets lekkers meenemen', detail: 'Neem iets kleins mee waarvan je weet dat je partner het lekker vindt.', lang: 'cadeautjes', needs: ['gezelligheid', 'aandacht'], minutes: 5 },
  { id: 'ca-bloem', title: 'Een bloem of plantje', detail: 'Eén bloem is genoeg. Het gaat om het gebaar.', lang: 'cadeautjes', needs: ['aandacht'], minutes: 10 },
  { id: 'ca-liedje', title: 'Een liedje voor jou', detail: 'Stuur een nummer dat je aan je partner doet denken, met één zin waarom.', lang: 'cadeautjes', needs: ['aandacht', 'ruimte'], minutes: 2 },
  // After Dark (only when both switched it on)
  { id: 'ad-fluister', title: 'Fluister iets liefs', detail: 'Fluister iets liefs in het oor van je partner, op een onverwacht moment.', lang: 'woorden', needs: ['intimiteit', 'aandacht'], minutes: 1, ad: 1 },
  { id: 'ad-kaarsjes', title: 'Kaarsjes aan vanavond', detail: 'Maak het vanavond sfeervol: kaarsjes, een muziekje, de telefoons weg.', lang: 'qualitytime', needs: ['intimiteit', 'gezelligheid'], minutes: 5, ad: 1 },
  { id: 'ad-zoen', title: 'Een zoen die blijft hangen', detail: 'Geef een zoen die net iets langer duurt dan normaal.', lang: 'aanraking', needs: ['intimiteit', 'aandacht'], minutes: 1, ad: 1 },
  { id: 'ad-berichtje', title: 'Een flirterig berichtje', detail: 'Stuur overdag een berichtje waar je partner even van moet blozen.', lang: 'woorden', needs: ['intimiteit', 'aandacht'], minutes: 1, ad: 2 },
  { id: 'ad-aantrekkelijk', title: 'Zeg wat je aantrekkelijk vindt', detail: 'Vertel concreet wat je vandaag aantrekkelijk vindt aan je partner.', lang: 'woorden', needs: ['intimiteit', 'aandacht'], minutes: 1, ad: 2 },
  { id: 'ad-uitnodiging', title: 'Een ondeugende uitnodiging', detail: 'Doe een speels voorstel voor later vanavond. Een nee is ook goed.', lang: 'qualitytime', needs: ['intimiteit'], minutes: 2, ad: 3 },
  { id: 'ca-foto', title: 'Een foto van ons', detail: 'Zoek een leuke foto van jullie op en stuur of print die.', lang: 'cadeautjes', needs: ['gezelligheid', 'aandacht'], minutes: 5 },
];

export const missionById = new Map(missions.map(m => [m.id, m]));

/** A small, stable pseudo-random generator so both screens show the same options all day. */
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Three suggestions for today, tuned to what the partner values (their love languages)
 * and what they said they need today. `round` gives a fresh set when you ask for other options.
 */
export function missionOptions(
  day: string,
  me: string,
  round: number,
  partnerLang?: LoveLanguageScores,
  partnerNeed?: Need,
  recent: string[] = [],
  /** 0 when After Dark is off; otherwise the mood both agreed on. */
  adLevel = 0,
): Mission[] {
  const rand = seeded(`${day}:${me}:${round}`);
  const scored = missions
    .filter(m => !recent.includes(m.id) && (m.ad ?? 0) <= adLevel)
    .map(m => ({
      m,
      score: 1 + (partnerLang ? partnerLang[m.lang] : 3) + (partnerNeed && m.needs.includes(partnerNeed) ? 4 : 0) + rand() * 3,
    }))
    .sort((a, b) => b.score - a.score);
  const picked: Mission[] = [];
  for (const { m } of scored) {
    if (picked.length === 3) break;
    if (picked.some(p => p.lang === m.lang)) continue; // three different kinds of love
    picked.push(m);
  }
  return picked;
}

export const loveLanguageLabel: Record<LoveLanguage, string> = {
  qualitytime: 'Qualitytime',
  aanraking: 'Nabijheid',
  woorden: 'Woorden',
  hulp: 'Hulp',
  cadeautjes: 'Verrassing',
};
