import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { actions } from '@/lib/actions';
import { adCards, adLevels, adStickerById, adStickers, wishes, type AdLevel, type WishAnswer } from '@/lib/afterdark';
import { nameOf } from '@/lib/people';
import { useCouple } from '@/lib/store';
import { fonts, radius, space } from '@/theme';

// After Dark has its own night look, so it never feels like part of the everyday screens.
const night = {
  bg: '#24142B',
  card: '#33203B',
  cardHi: '#43294D',
  line: '#4E3459',
  text: '#F7E9F0',
  muted: '#C7AFC9',
  rose: '#FF7AA8',
  gold: '#F2C14E',
};

const T = ({ children, style, kind = 'body' }: { children: React.ReactNode; style?: object; kind?: 'h1' | 'h2' | 'body' | 'small' | 'tag' }) => (
  <Text style={[styles[kind], style]}>{children}</Text>
);

function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && { color: night.bg }]}>{label}</Text>
    </Pressable>
  );
}

function Btn({ title, onPress, ghost, disabled }: { title: string; onPress: () => void; ghost?: boolean; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" style={({ pressed }) => [styles.btn, ghost && styles.btnGhost, (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 }]}>
      <Text style={[styles.btnText, ghost && { color: night.text }]}>{title}</Text>
    </Pressable>
  );
}

type Tab = 'kaarten' | 'wensen' | 'stickers';

export default function AfterDark() {
  const { state, post } = useCouple();
  const ad = state.afterDark;
  const partnerName = nameOf(state, state.partnerId);
  const [level, setLevel] = useState<AdLevel>(ad.mine?.level ?? 2);
  const [adult, setAdult] = useState(false);
  const [tab, setTab] = useState<Tab>('kaarten');

  const levelName = adLevels.find(l => l.level === ad.level)?.name ?? '';
  const pendingForMe = ad.awards.filter(a => a.to === state.myId && a.status === 'open');
  const mineAccepted = ad.awards.filter(a => a.to === state.myId && a.status === 'accepted');
  const theirsAccepted = ad.awards.filter(a => a.to !== state.myId && a.status === 'accepted');
  const sentOpen = ad.awards.filter(a => a.from === state.myId && a.status === 'open');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          <View style={styles.row}>
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/vandaag'))} accessibilityRole="button" accessibilityLabel="Terug" hitSlop={12}>
              <Icon name="back" color={night.text} size={26} />
            </Pressable>
            <T kind="tag">After Dark · 18+</T>
          </View>
          <T kind="h1">Alleen voor jullie twee 😈</T>

          {!ad.active && (
            <>
              <T>
                Romantische en ondeugende vragen, een wensenlijst waarin jullie alleen je matches zien, en stickers met jullie eigen humor. After Dark gaat pas open als jullie het allebei aanzetten.
              </T>
              {ad.mine?.on ? (
                <View style={styles.card}>
                  <T kind="h2">Staat aan voor jou</T>
                  <T kind="small">
                    Sfeer: {adLevels.find(l => l.level === ad.mine!.level)?.name}. After Dark gaat open zodra {partnerName} het ook aanzet. Je ziet niet of je partner het al aan heeft, en je partner ziet dat ook niet van jou. Zo voelt niemand zich onder druk gezet.
                  </T>
                  <Btn ghost title="Toch uitzetten" onPress={() => post(actions.adOptIn(false, ad.mine!.level))} />
                </View>
              ) : (
                <View style={styles.card}>
                  <T kind="h2">Welke sfeer past bij jou?</T>
                  <T kind="small">Jullie krijgen de mildste van jullie twee keuzes. Je kunt het later altijd aanpassen.</T>
                  {adLevels.map(l => (
                    <Pressable key={l.level} onPress={() => setLevel(l.level)} style={[styles.level, level === l.level && styles.levelOn]} accessibilityRole="button" accessibilityState={{ selected: level === l.level }}>
                      <T kind="h2" style={{ fontSize: 16 }}>
                        {l.name}
                      </T>
                      <T kind="small">{l.blurb}</T>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => setAdult(a => !a)} style={styles.check} accessibilityRole="checkbox" accessibilityState={{ checked: adult }}>
                    <View style={[styles.box, adult && { backgroundColor: night.rose, borderColor: night.rose }]}>{adult && <Text style={{ color: night.bg, fontFamily: fonts.black }}>✓</Text>}</View>
                    <T kind="small" style={{ flex: 1, color: night.text }}>
                      Ik ben 18 jaar of ouder en wil After Dark gebruiken. Ik kan het altijd weer uitzetten.
                    </T>
                  </Pressable>
                  <Btn title="Zet aan voor mij" disabled={!adult} onPress={() => post(actions.adOptIn(true, level))} />
                </View>
              )}
            </>
          )}

          {ad.active && (
            <>
              <View style={styles.row}>
                <T kind="small">
                  Sfeer: <Text style={{ color: night.rose, fontFamily: fonts.bold }}>{levelName}</Text> · de mildste van jullie twee keuzes
                </T>
              </View>
              <View style={styles.tabs}>
                <Chip label="Kaarten" on={tab === 'kaarten'} onPress={() => setTab('kaarten')} />
                <Chip label={`Wensen${ad.matches.length ? ` · ${ad.matches.length} ❤` : ''}`} on={tab === 'wensen'} onPress={() => setTab('wensen')} />
                <Chip label={`Stickers${pendingForMe.length ? ' · nieuw' : ''}`} on={tab === 'stickers'} onPress={() => setTab('stickers')} />
              </View>

              {tab === 'kaarten' &&
                adCards
                  .filter(c => c.level <= ad.level)
                  .map(c => {
                    const s = state.cards[c.id];
                    const status = s?.mine && s.partner ? 'Samen beantwoord' : s?.mine ? `Wacht op ${partnerName}` : s?.partnerDone ? `${partnerName} heeft geantwoord!` : 'Nieuw';
                    return (
                      <Pressable key={c.id} onPress={() => router.push({ pathname: '/kaart/[id]', params: { id: c.id } })} style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]} accessibilityRole="button">
                        <T kind="tag">{adLevels.find(l => l.level === c.level)?.name}</T>
                        <T kind="h2">{c.question}</T>
                        <T kind="small" style={{ color: s?.partnerDone && !s.mine ? night.rose : night.muted }}>
                          {status}
                        </T>
                      </Pressable>
                    );
                  })}

              {tab === 'wensen' && (
                <>
                  <View style={[styles.card, { backgroundColor: night.cardHi }]}>
                    <T kind="h2">Jullie matches ❤</T>
                    {ad.matches.length === 0 ? (
                      <T kind="small">Nog geen matches. Zodra jullie allebei ja of misschien zeggen tegen dezelfde wens, verschijnt die hier.</T>
                    ) : (
                      ad.matches.map(m => (
                        <View key={m.wishId} style={styles.match}>
                          <T style={{ flex: 1 }}>{wishes.find(w => w.id === m.wishId)?.text}</T>
                          <Text style={styles.matchTag}>{m.both === 'ja' ? 'Allebei ja' : 'Allebei (misschien) ja'}</Text>
                        </View>
                      ))
                    )}
                  </View>
                  <T kind="small">Zeg per wens ja, misschien of nee. {partnerName} ziet nooit jouw nee, alleen de wensen waar jullie allebei zin in hebben.</T>
                  {wishes
                    .filter(w => w.level <= ad.level)
                    .map(w => {
                      const mine = ad.wishes[w.id]?.mine;
                      return (
                        <View key={w.id} style={styles.card}>
                          <T>{w.text}</T>
                          <View style={styles.tabs}>
                            {(['ja', 'misschien', 'nee'] as WishAnswer[]).map(a => (
                              <Chip key={a} label={a === 'ja' ? 'Ja' : a === 'misschien' ? 'Misschien' : 'Nee'} on={mine === a} onPress={() => post(actions.adWish(w.id, a))} />
                            ))}
                          </View>
                        </View>
                      );
                    })}
                </>
              )}

              {tab === 'stickers' && (
                <>
                  {pendingForMe.map(a => {
                    const st = adStickerById.get(a.sticker);
                    return (
                      <View key={a.id} style={[styles.card, { backgroundColor: night.cardHi }]}>
                        <T kind="tag">Van {partnerName}</T>
                        <T kind="h2">
                          {st?.emoji} {st?.name}
                        </T>
                        <T kind="small">{st?.line}</T>
                        <View style={styles.row}>
                          <View style={{ flex: 1 }}>
                            <Btn title="Ja, leuk!" onPress={() => post(actions.adAccept(a.id, true))} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Btn ghost title="Liever niet" onPress={() => post(actions.adAccept(a.id, false))} />
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  <T kind="h2">Geef {partnerName} een sticker</T>
                  <T kind="small">Een knipoog voor iets wat jullie samen deden. {partnerName} beslist of die in het stickerboek komt.</T>
                  <View style={styles.grid}>
                    {adStickers.map(st => {
                      const waiting = sentOpen.some(a => a.sticker === st.id);
                      return (
                        <Pressable
                          key={st.id}
                          disabled={waiting}
                          onPress={() => state.partnerId && post(actions.adAward(st.id, state.partnerId))}
                          style={({ pressed }) => [styles.sticker, (pressed || waiting) && { opacity: 0.6 }]}
                          accessibilityRole="button">
                          <Text style={{ fontSize: 30 }}>{st.emoji}</Text>
                          <T style={{ fontFamily: fonts.bold, textAlign: 'center' }}>{st.name}</T>
                          <T kind="small" style={{ textAlign: 'center' }}>
                            {waiting ? 'Wacht op antwoord' : 'Geef weg'}
                          </T>
                        </Pressable>
                      );
                    })}
                  </View>

                  <T kind="h2">Ons ondeugende stickerboek</T>
                  {mineAccepted.length + theirsAccepted.length === 0 && <T kind="small">Nog leeg. Wie durft als eerste?</T>}
                  {[...mineAccepted, ...theirsAccepted].map(a => {
                    const st = adStickerById.get(a.sticker);
                    return (
                      <View key={a.id} style={styles.match}>
                        <Text style={{ fontSize: 22 }}>{st?.emoji}</Text>
                        <T style={{ flex: 1 }}>{st?.name}</T>
                        <Text style={styles.matchTag}>{a.to === state.myId ? 'voor jou' : `voor ${partnerName}`}</Text>
                      </View>
                    );
                  })}
                </>
              )}

              <View style={[styles.card, { marginTop: space.lg }]}>
                <T kind="h2">Jouw keuze</T>
                <T kind="small">Wijzig je sfeer of zet After Dark uit. Zet je het uit, dan gaat het voor jullie allebei dicht.</T>
                <View style={styles.tabs}>
                  {adLevels.map(l => (
                    <Chip key={l.level} label={l.name} on={ad.mine?.level === l.level} onPress={() => post(actions.adOptIn(true, l.level))} />
                  ))}
                </View>
                <Btn ghost title="After Dark uitzetten" onPress={() => post(actions.adOptIn(false, ad.mine?.level ?? 1))} />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: night.bg },
  scroll: { padding: 20, paddingBottom: 64 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  h1: { fontFamily: fonts.black, fontSize: 28, lineHeight: 34, color: night.text },
  h2: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: night.text },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: night.text },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: night.muted },
  tag: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: night.rose },
  card: { backgroundColor: night.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm, borderWidth: 1, borderColor: night.line },
  level: { borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: night.line, gap: 2 },
  levelOn: { borderColor: night.rose, backgroundColor: night.cardHi },
  check: { flexDirection: 'row', gap: space.md, alignItems: 'center', paddingVertical: space.sm },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: night.muted, alignItems: 'center', justifyContent: 'center' },
  btn: { minHeight: 50, borderRadius: radius.pill, backgroundColor: night.rose, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: night.line },
  btnText: { fontFamily: fonts.bold, fontSize: 15, color: night.bg },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: night.line, backgroundColor: night.card },
  chipOn: { backgroundColor: night.rose, borderColor: night.rose },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: night.text },
  match: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: night.line },
  matchTag: { fontFamily: fonts.bold, fontSize: 11, color: night.gold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  sticker: { width: '31%', flexGrow: 1, backgroundColor: night.card, borderRadius: radius.md, padding: space.md, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: night.line },
});

