import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { Brand } from '@/components/logo';
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
const gestureIcon: Partial<Record<GestureKind, IconName>> = { compliment: 'flower', knuffel: 'hug', hartje: 'heart' };

/** One of the three daily steps. Only the step that is up next gets the strong look. */
function Step({ n, done, next, title, children }: { n: number; done: boolean; next: boolean; title: string; children: React.ReactNode }) {
  return (
    <Card tone="white" style={[next && styles.stepNext, done && styles.stepDone]}>
      <Row style={{ marginBottom: 4 }}>
        <View style={[styles.stepNum, next && { backgroundColor: colors.plum }, done && { backgroundColor: colors.success }]}>
          {done ? <Icon name="check" color={colors.white} size={14} /> : <Text style={[styles.stepNumText, next && { color: colors.white }]}>{n}</Text>}
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
  const cardDone = !todayCard || !!todayCardState?.mine;
  const nextStep = !mine ? 1 : !done ? 2 : !cardDone ? 3 : 0;

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
        <Brand size={32} />
        <Pressable onPress={() => router.push('/instellingen')} accessibilityRole="button" accessibilityLabel="Instellingen" style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
          <Icon name="settings" color={colors.plum} size={22} />
        </Pressable>
      </Row>
      <View style={{ gap: 2, marginBottom: space.sm }}>
        <Eyebrow>{dateLabel}</Eyebrow>
        <H1>{hasPartner ? `${state.me?.name ?? 'Jij'} & ${partnerName}` : 'Vandaag'}</H1>
        <Body>Een klein moment. Meer van elkaar.</Body>
      </View>

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
          <Body>Je partner installeert Claddagh en vult deze code in:</Body>
          <Text style={styles.code} selectable>
            {session.code}
          </Text>
          <Button title="Deel de code" variant="secondary" onPress={() => Share.share({ message: `Kom je bij mij in Claddagh? Onze koppelcode is ${session.code}` })} />
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
          <Small style={{ color: colors.text }}>
            Level {state.level} · {Math.round(state.levelProgress * XP_PER_LEVEL)}/{XP_PER_LEVEL} XP
          </Small>
        </Row>
        <View style={styles.week}>
          {state.week.map(d => (
            <View key={d.day} style={styles.weekDay}>
              <View style={[styles.weekDot, d.today && styles.weekDotToday, d.checkins === 2 && styles.weekDotBoth, d.acts > 0 && styles.weekDotLove]}>
                {d.acts > 0 ? (
                  <Icon name="heart" color={colors.ink} size={14} />
                ) : d.checkins === 2 ? (
                  <Icon name="check" color={colors.white} size={14} />
                ) : d.today ? (
                  <Text style={styles.weekDotText}>{Number(d.day.slice(8))}</Text>
                ) : null}
              </View>
              <Text style={[styles.weekLabel, d.today && { color: colors.plum }]}>{d.label}</Text>
            </View>
          ))}
        </View>
        <Progress value={state.levelProgress} />
        <Small style={{ color: colors.text }}>✓ Samen ingecheckt · ♥ Gebaar opgemerkt. Een lege dag is gewoon een lege dag.</Small>
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
            <Small style={{ color: colors.text }}>Als je het opmerkt, krijgen jullie allebei 20 XP.</Small>
          </Card>
        );
      })}

      <Row style={{ justifyContent: 'space-between', marginTop: space.sm }}>
        <H2>Vandaag voor jullie</H2>
        <Small>2 tot 5 minuten</Small>
      </Row>

      <Step n={1} done={!!mine} next={nextStep === 1} title="Hoe gaat het met je?">
        {!mine && (
          <>
            <Body>{partnerName} ziet je antwoorden pas als jullie allebei hebben ingecheckt.</Body>
            <Button title="Check in" icon="arrow" onPress={() => router.push('/checkin')} />
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

      <Step n={2} done={!!done} next={nextStep === 2} title={`Iets voor ${partnerName}`}>
        {!picked && !done && (
          <>
            <Small>
              Kies één klein gebaar. Je keuze blijft een verrassing.{' '}
              {state.loveLang.partner || partner ? `Afgestemd op wat ${partnerName} fijn vindt${partner ? ' en vandaag nodig heeft' : ''}.` : `Hoe meer jullie in het Kompas invullen, hoe beter dit past.`}
            </Small>
            <View>
              {options.map(m => (
                <MissionOption key={m.id} m={m} onPick={() => post(actions.pickMission(m.id))} />
              ))}
            </View>
            <Button title="Andere voorstellen" variant="ghost" onPress={() => setRound(r => r + 1)} />
          </>
        )}
        {picked && !done && (
          <>
            <View style={styles.picked}>
              <Text style={styles.optionTag}>{loveLanguageLabel[picked.lang]}</Text>
              <Strong>{picked.title}</Strong>
              <Body>{picked.detail}</Body>
            </View>
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

      <Step n={3} done={cardDone} next={nextStep === 3} title="Gesprek van de dag">
        {todayCard && todayTheme ? (
          <Pressable onPress={() => router.push({ pathname: '/kaart/[id]', params: { id: todayCard.id } })} style={({ pressed }) => [styles.dayCard, { backgroundColor: tones[todayTheme.tone] }, pressed && { opacity: 0.85 }]} accessibilityRole="button">
            <Eyebrow>{todayTheme.label}</Eyebrow>
            <Text style={styles.dayCardText}>{todayCard.question}</Text>
            <Row style={{ justifyContent: 'space-between' }}>
              <Small style={{ color: colors.plum, flex: 1 }}>{todayCardState?.partnerDone ? `${partnerName} heeft al geantwoord · ` : ''}Tik om te antwoorden</Small>
              <Icon name="arrow" color={colors.plum} size={18} />
            </Row>
          </Pressable>
        ) : (
          <Small>Jullie hebben alle kaarten beantwoord. Nieuwe kaarten komen eraan.</Small>
        )}
      </Step>

      {state.afterDark.active && (
        <View style={styles.tonight}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={styles.tonightTag}>After Dark · Vanavond</Text>
            <Pressable onPress={() => router.push('/afterdark')} accessibilityRole="button" hitSlop={12}>
              <Row gap={4}>
                <Text style={styles.tonightLink}>Meer</Text>
                <Icon name="arrow" color={night.muted} size={16} />
              </Row>
            </Pressable>
          </Row>
          <VonkPanel compact />
        </View>
      )}

      {hasPartner && (
        <Card tone="white">
          <H2>Zomaar iets liefs sturen</H2>
          <View style={styles.gestures}>
            {gestures
              .filter(g => g.id !== 'bericht')
              .map(g => (
                <Pressable key={g.id} style={({ pressed }) => [styles.gesture, pressed && { opacity: 0.7 }]} onPress={() => sendGesture(g.id)} accessibilityRole="button">
                  {gestureIcon[g.id] ? <Icon name={gestureIcon[g.id]!} color={colors.plum} size={24} /> : <Text style={{ fontSize: 22 }}>{g.emoji}</Text>}
                  <Text style={styles.gestureLabel}>{g.label}</Text>
                </Pressable>
              ))}
          </View>
          {sent && <Small style={{ color: colors.success }}>{sent}</Small>}
        </Card>
      )}

      {owed.map(c => (
        <Card key={c.id} tone="lav" onPress={() => router.push('/beloningen')}>
          <Small style={{ color: colors.text }}>{partnerName} heeft gewonnen en koos:</Small>
          <Strong>{c.rewardTitle}</Strong>
        </Card>
      ))}

      <H2 style={{ marginTop: space.sm }}>Meer samen</H2>
      <View style={styles.stations}>
        {stations.map(st => {
          const waiting = st.waiting?.(state);
          return (
            <Pressable
              key={st.id}
              onPress={() => router.push(st.route)}
              style={({ pressed }) => [styles.station, { backgroundColor: st.dark ? night.card : tones[st.tone] }, pressed && { opacity: 0.8 }]}
              accessibilityRole="button">
              <Icon name={st.icon} color={st.dark ? night.rose : colors.plum} size={26} />
              <View style={{ gap: 4, marginTop: 14 }}>
                <Strong style={st.dark && { color: night.text }}>{st.title}</Strong>
                <Small style={{ color: st.dark ? night.muted : colors.text }}>{st.blurb}</Small>
                {waiting && <Text style={[styles.waiting, st.dark && { color: night.rose }]}>● {waiting}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  code: { fontFamily: fonts.black, fontSize: 34, letterSpacing: 6, color: colors.plum, textAlign: 'center', paddingVertical: space.sm },
  stepNext: { borderColor: '#D9B4CA' },
  stepDone: { borderColor: '#BFE3D2' },
  stepNum: { width: 27, height: 27, borderRadius: 14, backgroundColor: colors.lav, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.black, fontSize: 12, color: colors.plum },
  option: { borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: 14, gap: 3, minHeight: 64 },
  picked: { backgroundColor: colors.lav, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.plum, padding: 14, gap: 3 },
  optionTag: { fontFamily: fonts.black, fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase', color: colors.plum },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  weekDay: { alignItems: 'center', gap: 5 },
  weekDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  weekDotBoth: { backgroundColor: colors.plum },
  weekDotLove: { backgroundColor: colors.rose },
  weekDotToday: { borderColor: colors.plum },
  weekDotText: { fontFamily: fonts.black, fontSize: 13, color: colors.plum },
  weekLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.text },
  dayCard: { borderRadius: radius.md, padding: 18, gap: space.sm },
  dayCardText: { fontFamily: fonts.black, fontSize: 19, lineHeight: 26, color: colors.ink, marginBottom: space.sm },
  gestures: { flexDirection: 'row', gap: space.sm },
  tonight: { backgroundColor: night.bg, borderRadius: radius.lg, padding: 18, gap: space.sm },
  tonightTag: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: night.rose },
  tonightLink: { fontFamily: fonts.bold, fontSize: 13, color: night.muted },
  gesture: { flex: 1, minHeight: 76, backgroundColor: colors.cream, borderRadius: radius.sm, paddingVertical: space.md, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  gestureLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.plum },
  stations: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  station: { width: '47%', flexGrow: 1, minHeight: 152, borderRadius: 16, padding: space.lg },
  waiting: { fontFamily: fonts.bold, fontSize: 12, color: colors.roseText, marginTop: 2 },
});
