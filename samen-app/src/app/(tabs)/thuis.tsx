import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { House } from '@/components/house';
import { Icon } from '@/components/icon';
import { Body, Button, Card, Eyebrow, Field, H1, H2, Progress, Row, Screen, Small, Strong } from '@/components/ui';
import { actions } from '@/lib/actions';
import { complimentIdeas, gestures, moods, needs } from '@/lib/content';
import { expressions, nameOf } from '@/lib/people';
import { daySuggestion, loveLanguageTip } from '@/lib/state';
import { useCouple } from '@/lib/store';
import type { GestureKind } from '@/lib/types';
import { colors, fonts, radius, space } from '@/theme';

const moodLabel = (id: string) => moods.find(m => m.id === id);
const needLabel = (id: string) => needs.find(n => n.id === id)?.label.toLowerCase();

export default function Thuis() {
  const { state, session, post } = useCouple();
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const partnerName = nameOf(state, state.partnerId);
  const face = expressions(state);
  const hasPartner = !!state.partnerId;

  const send = async (kind: GestureKind, text?: string) => {
    await post(actions.gesture(kind, text));
    setSent(`${gestures.find(g => g.id === kind)?.emoji} Verstuurd naar ${partnerName}`);
    setMessage(null);
    setTimeout(() => setSent(null), 2500);
  };

  const lastReceived = state.gestures.find(g => g.from === state.partnerId);
  const owed = state.claims.filter(c => c.winnerId !== state.myId && !c.redeemed);
  const myOpenWins = state.openWins.filter(w => w.winnerId === state.myId);
  const { mine, partner, partnerDone } = state.today;

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <Eyebrow>LoveGotchi</Eyebrow>
          <H1>{hasPartner ? `${state.me?.name ?? 'Jij'} & ${partnerName}` : 'Jullie huisje'}</H1>
        </View>
        <Pressable onPress={() => router.push('/instellingen')} accessibilityLabel="Instellingen" hitSlop={12}>
          <Icon name="settings" color={colors.plum} size={26} />
        </Pressable>
      </Row>

      {!hasPartner && (
        <Card tone="peach">
          <H2>Nodig je partner uit</H2>
          <Body>Je partner installeert Samen en vult deze code in:</Body>
          <Text style={styles.code} selectable>
            {session.code}
          </Text>
          <Button
            title="Deel de code"
            variant="secondary"
            onPress={() => Share.share({ message: `Kom je bij mij in Samen? Onze koppelcode is ${session.code}` })}
          />
        </Card>
      )}

      <Pressable onPress={() => router.push('/huisje')} accessibilityLabel="Naar het huisje">
        <House
          items={state.items}
          me={state.me && { avatar: state.me.avatar, expression: face.me }}
          partner={state.partner && { avatar: state.partner.avatar, expression: face.partner }}
        />
      </Pressable>

      <Card tone="pink">
        <Row style={{ justifyContent: 'space-between' }}>
          <Strong>Verbondenheid</Strong>
          <Small>Level {state.level}</Small>
        </Row>
        <Progress value={state.levelProgress} />
        <Small>Elke check-in, elk gesprek en elk spel laat jullie wereld groeien.</Small>
      </Card>

      {myOpenWins.length > 0 && (
        <Card tone="mint" onPress={() => router.push('/beloningen')}>
          <H2>🏆 Je hebt gewonnen!</H2>
          <Body>Kies je beloning uit de beloningenpot.</Body>
        </Card>
      )}
      {owed.map(c => (
        <Card key={c.id} tone="lav" onPress={() => router.push('/beloningen')}>
          <Small>{partnerName} heeft gewonnen en koos:</Small>
          <Strong>{c.rewardTitle}</Strong>
        </Card>
      ))}

      <Card tone="white">
        <Eyebrow>Vandaag samen</Eyebrow>
        {!mine && (
          <>
            <H2>Hoe voel jij je vandaag?</H2>
            <Small>Een korte check-in. {partnerName} ziet jouw antwoord pas als jullie allebei hebben ingevuld.</Small>
            <Button title="Check in" onPress={() => router.push('/checkin')} />
          </>
        )}
        {mine && !partner && (
          <>
            <H2>
              Jij: {moodLabel(mine.mood)?.emoji} {moodLabel(mine.mood)?.label}
            </H2>
            <Small>{partnerDone ? 'Bijna klaar…' : `Wachten op de check-in van ${partnerName}.`}</Small>
          </>
        )}
        {mine && partner && (
          <>
            <Body>
              <Strong>Jij:</Strong> {moodLabel(mine.mood)?.emoji} {moodLabel(mine.mood)?.label.toLowerCase()}, zin in {needLabel(mine.need)}.
            </Body>
            <Body>
              <Strong>{partnerName}:</Strong> {moodLabel(partner.mood)?.emoji} {moodLabel(partner.mood)?.label.toLowerCase()}, zin in{' '}
              {needLabel(partner.need)}.
            </Body>
            {partner.note ? <Body style={{ fontStyle: 'italic' }}>“{partner.note}”</Body> : null}
            <Card tone="pink">
              <Strong>{daySuggestion(mine, partner, partnerName)}</Strong>
              {loveLanguageTip(state.loveLang.partner) && <Small>Kompas-tip: {loveLanguageTip(state.loveLang.partner)}</Small>}
            </Card>
          </>
        )}
      </Card>

      {hasPartner && (
        <Card tone="lav">
          <H2>Stuur {partnerName} iets liefs</H2>
          {lastReceived && (
            <Small>
              Laatst ontvangen: {gestures.find(g => g.id === lastReceived.kind)?.emoji} {lastReceived.text ?? gestures.find(g => g.id === lastReceived.kind)?.sent}
            </Small>
          )}
          <View style={styles.gestures}>
            {gestures.map(g => (
              <Pressable
                key={g.id}
                style={({ pressed }) => [styles.gesture, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                onPress={() =>
                  g.id === 'bericht' ? setMessage('') : send(g.id, g.id === 'compliment' ? complimentIdeas[Math.floor(Math.random() * complimentIdeas.length)] : undefined)
                }>
                <Text style={styles.gestureEmoji}>{g.emoji}</Text>
                <Text style={styles.gestureLabel}>{g.label}</Text>
              </Pressable>
            ))}
          </View>
          {message !== null && (
            <>
              <Field value={message} onChangeText={setMessage} placeholder={`Een lief bericht voor ${partnerName}`} maxLength={200} multiline />
              <Button title="Versturen" onPress={() => send('bericht', message.trim())} disabled={!message.trim()} />
            </>
          )}
          {sent && <Small style={{ color: colors.success }}>{sent}</Small>}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  code: { fontFamily: fonts.black, fontSize: 34, letterSpacing: 6, color: colors.plum, textAlign: 'center', paddingVertical: space.sm },
  gestures: { flexDirection: 'row', gap: space.sm },
  gesture: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: space.md, alignItems: 'center', gap: 4 },
  gestureEmoji: { fontSize: 24 },
  gestureLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.plum, textAlign: 'center' },
});
