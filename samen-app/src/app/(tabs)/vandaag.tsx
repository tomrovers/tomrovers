import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Body, Button, Card, Eyebrow, Field, H1, H2, Progress, Row, Screen, Small, Strong } from '@/components/ui';
import { VonkPanel } from '@/components/vonk';
import { actions } from '@/lib/actions';
import { cards, cardThemes, gestures, moods, needs, randomCompliment } from '@/lib/content';
import { loveLanguageLabel, missionById, missionOptions, type Mission } from '@/lib/missions';
import { nameOf } from '@/lib/people';
import { daySuggestion, XP_PER_LEVEL } from '@/lib/state';
import { stations } from '@/lib/stations';
import { useCouple } from '@/lib/store';
import type { GestureKind } from '@/lib/types';
import { colors, fonts, night, radius, space, tones } from '@/theme';

const moodLabel = (id: string) => moods.find(m => m.id === id);
const needLabel = (id: string) => needs.find(n => n.id === id)?.label.toLowerCase();

function Step({ n, done, title, children }: { n: number; done: boolean; title: string; children: React.ReactNode }) {
  return (
    <Card tone="white" style={done && styles.stepDone}>
      <Row>
        <View style={[styles.stepNum, done && { backgroundColor: colors.success }]}>
          <Text style={styles.stepNumText}>{done ? '✓' : n}</Text>
        </View>
        <H2 style={{ flex: 1 }}>{title}</H2>
      </Row>
      {children}
    </Card>
  );
}

function MissionOption({ m, onPick }: { m: Mission; onPick: () => void }) {
  return (
    <Pressable onPress={onPick} style={({ pressed }) => [styles.option, pressed && { opacity: 0.75 }]} accessibilityRole="button">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={styles.optionTag}>{loveLanguageLabel[m.lang]}</Text>
        <Small>± {m.minutes} min</Small>
      </Row>
      <Strong>{m.title}</Strong>
      <Small>{m.detail}</Small>
    </Pressable>
  );
}

export default function Vandaag() {
  const { state, session, mode, post, sharedAvailable, leaveDemoForShared } = useCouple();
  const partnerName = nameOf(state, state.partnerId);
  const hasPartner = !!state.partnerId;
  const [round, setRound] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  const { mine, partner, partnerDone } = state.today;
  const recent = state.acts.filter(a => a.by === state.myId).slice(0, 5).map(a => a.missionId);
  const options = missionOptions(state.today.day, state.myId, round, state.loveLang.partner, partner?.need, recent, state.afterDark.active ? state.afterDark.level : 0);
  const picked = state.mission.picked ? missionById.get(state.mission.picked) : undefined;
  const done = state.mission.done;
  const doneMission = done && missionById.get(done.missionId);

  // The conversation card of the day: the first one you have not answered, rotating per day.
  const dayNumber = Math.floor(Date.parse(state.today.day) / 86400000);
  const open = cards.filter(c => !state.cards[c.id]?.mine);
  const todayCard = open.length ? open[dayNumber % open.length] : undefined;
  const todayCardState = todayCard && state.cards[todayCard.id];
  const todayTheme = todayCard && cardThemes.find(t => t.id === todayCard.theme);

  const sendGesture = async (kind: GestureKind) => {
    await post(actions.gesture(kind, kind === 'compliment' ? randomCompliment() : undefined));
    setSent(`${gestures.find(g => g.id === kind)?.emoji} Verstuurd naar ${partnerName}`);
    setTimeout(() => setSent(null), 2500);
  };

  const owed = state.claims.filter(c => c.winnerId !== state.myId && !c.redeemed);
  const dateLabel = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{dateLabel}</Eyebrow>
          <H1>{hasPartner ? `${state.me?.name ?? 'Jij'} & ${partnerName}` : 'Vandaag'}</H1>
        </View>
        <Pressable onPress={() => router.push('/instellingen')} accessibilityLabel="Instellingen" hitSlop={12}>
          <Icon name="settings" color={colors.plum} size={26} />
        </Pressable>
      </Row>

      {mode === 'demo' && sharedAvailable && (
        <Card tone="peach">
          <H2>Dit is de demo met Annelieke</H2>
          <Body>Annelieke is hier een nagespeelde partner. Wil je de app echt samen met je partner gebruiken? Stop dan de demo en begin samen op deze pagina.</Body>
          <Button
            title="Stop de demo en begin samen"
            loading={switching}
            onPress={async () => {
              setSwitching(true);
              try {
                await leaveDemoForShared();
              } finally {
                setSwitching(false);
              }
            }}
          />
        </Card>
      )}
      {!hasPartner && session.code && (
        <Card tone="peach">
          <H2>Nodig je partner uit</H2>
          <Body>Je partner installeert Samen en vult deze code in:</Body>
          <Text style={styles.code} selectable>
            {session.code}
          </Text>
          <Button title="Deel de code" variant="secondary" onPress={() => Share.share({ message: `Kom je bij mij in Samen? Onze koppelcode is ${session.code}` })} />
        </Card>
      )}
      {!hasPartner && mode === 'shared' && (
        <Card tone="peach">
          <H2>Nodig je partner uit</H2>
          <Body>Deel deze pagina met je partner via het Share-menu van claude.ai. Kies daar de rol Editor, anders kan je partner niets opslaan.</Body>
        </Card>
      )}

      {/* This week: shared progress, no streak to lose */}
      <Card tone="pink">
        <Row style={{ justifyContent: 'space-between' }}>
          <Strong>Deze week samen</Strong>
          <Small>
            Level {state.level} · {Math.round(state.levelProgress * XP_PER_LEVEL)}/{XP_PER_LEVEL} XP
          </Small>
        </Row>
        <View style={styles.week}>
          {state.week.map(d => (
            <View key={d.day} style={styles.weekDay}>
              <View style={[styles.weekDot, d.checkins === 2 && styles.weekDotBoth, d.acts > 0 && styles.weekDotLove, d.today && styles.weekDotToday]}>
                <Text style={styles.weekDotText}>{d.acts > 0 ? '❤' : d.checkins === 2 ? '✓' : ''}</Text>
              </View>
              <Text style={[styles.weekLabel, d.today && { color: colors.plum }]}>{d.label}</Text>
            </View>
          ))}
        </View>
        <Progress value={state.levelProgress} />
        <Small>✓ jullie checkten allebei in · ❤ een liefdevol gebaar werd opgemerkt. Een lege dag is gewoon een lege dag.</Small>
      </Card>

      {/* Something your partner did for you comes first */}
      {state.forMe.map(a => {
        const m = missionById.get(a.missionId);
        return (
          <Card key={a.id} tone="mint">
            <Eyebrow>Voor jou gedaan</Eyebrow>
            <H2>💝 {partnerName} deed iets liefs voor je</H2>
            <Strong>{m?.title ?? 'Een lief gebaar'}</Strong>
            {a.note ? <Body style={{ fontStyle: 'italic' }}>“{a.note}”</Body> : null}
            <Button title="Ik merkte het ❤️" onPress={() => post(actions.missionSeen(a.id))} />
            <Small>Als je het opmerkt, krijgen jullie allebei 20 XP.</Small>
          </Card>
        );
      })}

      <Step n={1} done={!!mine} title="Hoe gaat het met je?">
        {!mine && (
          <>
            <Small>Een korte check-in. {partnerName} ziet jouw antwoord pas als jullie allebei hebben ingevuld.</Small>
            <Button title="Check in" onPress={() => router.push('/checkin')} />
          </>
        )}
        {mine && !partner && (
          <Small>
            Jij: {moodLabel(mine.mood)?.emoji} {moodLabel(mine.mood)?.label}. {partnerDone ? 'Bijna klaar…' : `Wachten op de check-in van ${partnerName}.`}
          </Small>
        )}
        {mine && partner && (
          <>
            <Body>
              <Strong>Jij:</Strong> {moodLabel(mine.mood)?.emoji} {moodLabel(mine.mood)?.label.toLowerCase()}, zin in {needLabel(mine.need)}.
            </Body>
            <Body>
              <Strong>{partnerName}:</Strong> {moodLabel(partner.mood)?.emoji} {moodLabel(partner.mood)?.label.toLowerCase()}, zin in {needLabel(partner.need)}.
            </Body>
            {partner.note ? <Body style={{ fontStyle: 'italic' }}>“{partner.note}”</Body> : null}
            <Card tone="pink">
              <Strong>{daySuggestion(mine, partner, partnerName)}</Strong>
            </Card>
          </>
        )}
      </Step>

      <Step n={2} done={!!done} title={`Iets voor ${partnerName}`}>
        {!picked && !done && (
          <>
            <Small>
              Kies één klein gebaar voor vandaag.{' '}
              {state.loveLang.partner || partner ? `Afgestemd op wat ${partnerName} fijn vindt${partner ? ' en vandaag nodig heeft' : ''}.` : `Hoe meer jullie in het Kompas invullen, hoe beter dit past.`}
            </Small>
            {options.map(m => (
              <MissionOption key={m.id} m={m} onPick={() => post(actions.pickMission(m.id))} />
            ))}
            <Button title="Andere voorstellen" variant="ghost" onPress={() => setRound(r => r + 1)} />
          </>
        )}
        {picked && !done && (
          <>
            <Card tone="lav">
              <Text style={styles.optionTag}>{loveLanguageLabel[picked.lang]}</Text>
              <Strong>{picked.title}</Strong>
              <Body>{picked.detail}</Body>
            </Card>
            <Small>{partnerName} ziet niet wat je gekozen hebt. Zo blijft het een verrassing.</Small>
            {note === null ? (
              <Row>
                <Button title="Gedaan!" style={{ flex: 1 }} onPress={() => setNote('')} />
                <Button title="Andere kiezen" variant="secondary" style={{ flex: 1 }} onPress={() => post(actions.pickMission(''))} />
              </Row>
            ) : (
              <>
                <Field value={note} onChangeText={setNote} placeholder={`Wil je er iets bij zeggen tegen ${partnerName}? (mag leeg)`} maxLength={160} multiline />
                <Button
                  title={`Laat ${partnerName} het weten`}
                  onPress={async () => {
                    await post(actions.missionDone(picked.id, note.trim() || undefined));
                    setNote(null);
                  }}
                />
              </>
            )}
          </>
        )}
        {done && (
          <>
            <Strong>{doneMission?.title}</Strong>
            <Small style={{ color: done.seen ? colors.success : colors.muted }}>
              {done.seen ? `${partnerName} merkte het ❤️ · jullie kregen allebei 20 XP` : `Gedaan. Nu wachten tot ${partnerName} het opmerkt.`}
            </Small>
          </>
        )}
      </Step>

      <Step n={3} done={!todayCard || !!todayCardState?.mine} title="Gesprek van de dag">
        {todayCard && todayTheme ? (
          <Pressable onPress={() => router.push({ pathname: '/kaart/[id]', params: { id: todayCard.id } })} style={[styles.dayCard, { backgroundColor: tones[todayTheme.tone] }]} accessibilityRole="button">
            <Small>{todayTheme.label}</Small>
            <Text style={styles.dayCardText}>{todayCard.question}</Text>
            <Small style={{ color: colors.plum }}>{todayCardState?.partnerDone ? `${partnerName} heeft al geantwoord · ` : ''}Tik om te antwoorden</Small>
          </Pressable>
        ) : (
          <Small>Jullie hebben alle kaarten beantwoord. Nieuwe kaarten komen eraan.</Small>
        )}
      </Step>

      {state.afterDark.active && (
        <View style={styles.tonight}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={styles.tonightTag}>After Dark · Vanavond</Text>
            <Pressable onPress={() => router.push('/afterdark')} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.tonightLink}>Meer →</Text>
            </Pressable>
          </Row>
          <VonkPanel compact />
        </View>
      )}

      {hasPartner && (
        <Card tone="white">
          <Strong>Zomaar iets liefs sturen</Strong>
          <View style={styles.gestures}>
            {gestures
              .filter(g => g.id !== 'bericht')
              .map(g => (
                <Pressable key={g.id} style={({ pressed }) => [styles.gesture, pressed && { opacity: 0.7 }]} onPress={() => sendGesture(g.id)} accessibilityRole="button">
                  <Text style={{ fontSize: 22 }}>{g.emoji}</Text>
                  <Text style={styles.gestureLabel}>{g.label}</Text>
                </Pressable>
              ))}
          </View>
          {sent && <Small style={{ color: colors.success }}>{sent}</Small>}
        </Card>
      )}

      {owed.map(c => (
        <Card key={c.id} tone="lav" onPress={() => router.push('/beloningen')}>
          <Small>{partnerName} heeft gewonnen en koos:</Small>
          <Strong>{c.rewardTitle}</Strong>
        </Card>
      ))}

      <H2>Meer samen</H2>
      <View style={styles.stations}>
        {stations.map(st => {
          const waiting = st.waiting?.(state);
          return (
            <Pressable
              key={st.id}
              onPress={() => router.push(st.route)}
              style={({ pressed }) => [styles.station, { backgroundColor: st.dark ? night.card : tones[st.tone] }, pressed && { opacity: 0.8 }]}
              accessibilityRole="button">
              <Text style={{ fontSize: 26 }}>{st.emoji}</Text>
              <Strong style={st.dark && { color: '#F7E9F0' }}>{st.title}</Strong>
              <Small style={st.dark && { color: '#C7AFC9' }}>{st.blurb}</Small>
              {waiting && <Text style={[styles.waiting, st.dark && { color: '#FF7AA8' }]}>● {waiting}</Text>}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  code: { fontFamily: fonts.black, fontSize: 34, letterSpacing: 6, color: colors.plum, textAlign: 'center', paddingVertical: space.sm },
  stepDone: { borderColor: '#BFE3D2' },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.plum, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.black, fontSize: 13, color: colors.white },
  option: { backgroundColor: colors.cream, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: space.md, gap: 4 },
  optionTag: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.rose },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: 4 },
  weekDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  weekDotBoth: { backgroundColor: '#F4B6C8' },
  weekDotLove: { backgroundColor: colors.rose },
  weekDotToday: { borderColor: colors.plum },
  weekDotText: { fontFamily: fonts.black, fontSize: 14, color: colors.white },
  weekLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.muted },
  dayCard: { borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  dayCardText: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: colors.ink },
  gestures: { flexDirection: 'row', gap: space.sm },
  tonight: { backgroundColor: night.bg, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  tonightTag: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: night.rose },
  tonightLink: { fontFamily: fonts.bold, fontSize: 13, color: night.muted },
  gesture: { flex: 1, backgroundColor: colors.cream, borderRadius: radius.md, paddingVertical: space.sm, alignItems: 'center', gap: 2 },
  gestureLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.plum },
  stations: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  station: { width: '47%', flexGrow: 1, borderRadius: radius.lg, padding: space.lg, gap: 4 },
  waiting: { fontFamily: fonts.bold, fontSize: 12, color: colors.roseDark, marginTop: 2 },
});
