import { router } from 'expo-router';

import { Body, Card, Eyebrow, H1, H2, Row, Screen, Small, Strong } from '@/components/ui';
import { nameOf } from '@/lib/people';
import { PLAY_WEEKS } from '@/lib/state';
import { useCouple } from '@/lib/store';

export default function Spelen() {
  const { state } = useCouple();
  const partnerName = nameOf(state, state.partnerId);
  const myWins = state.wins.filter(w => w.winnerId === state.myId).length;
  const partnerWins = state.wins.length - myWins;
  const kjm = state.kjm;

  return (
    <Screen>
      <Eyebrow>Claddagh Playground</Eyebrow>
      <H1>Een potje voor de lol</H1>
      <Body>Wie wint, kiest een beloning uit jullie beloningenpot.</Body>

      <Card tone={state.playWeeks >= PLAY_WEEKS ? 'mint' : 'peach'} onPress={() => router.push('/prestaties')}>
        <Row>
          <Body style={{ fontSize: 36 }}>{state.playWeeks >= PLAY_WEEKS ? '🏆' : '🎲'}</Body>
          <Body style={{ flex: 1 }}>
            <Strong>Couples who play together, stay together</Strong>
          </Body>
        </Row>
        {state.playWeeks >= PLAY_WEEKS ? (
          <Small>Trofee verdiend! Jullie speelden in {state.playWeeks} verschillende weken samen.</Small>
        ) : (
          <Small>
            Speel in {PLAY_WEEKS} verschillende weken samen een spel voor deze trofee. Nu: {state.playWeeks} van {PLAY_WEEKS}
            {state.playedThisWeek ? ' · deze week al gespeeld ✓' : ' · deze week nog niet'}
          </Small>
        )}
      </Card>

      <Card tone="lav">
        <Row style={{ justifyContent: 'space-around' }}>
          <Strong>Jij {myWins}</Strong>
          <Small>overwinningen</Small>
          <Strong>
            {partnerWins} {partnerName}
          </Strong>
        </Row>
      </Card>

      <Card tone="pink" onPress={() => router.push('/spel/reflex')}>
        <Small>⚡ Op één telefoon · 1 minuut</Small>
        <H2>Reflex Battle</H2>
        <Body>Leg de telefoon tussen jullie in. Wie tikt het snelst als het scherm roze wordt? Best of five.</Body>
      </Card>

      <Card tone="mint" onPress={() => router.push('/spel/kenjemij')}>
        <Small>❓ Ieder op de eigen telefoon · 3 minuten</Small>
        <H2>Ken je mij?</H2>
        <Body>Beantwoord vijf vragen over jezelf en raad wat {partnerName} koos.</Body>
        <Small>
          Ronde {kjm.round}:{' '}
          {kjm.mine ? `wacht op ${partnerName}` : kjm.partnerDone ? `${partnerName} is al klaar, jij bent aan de beurt!` : 'klaar om te spelen'}
        </Small>
      </Card>

      <Card tone="peach" onPress={() => router.push('/beloningen')}>
        <Small>🎁 {state.rewards.length} beloningen in de pot</Small>
        <H2>Beloningenpot</H2>
        <Body>Bepaal samen wat de winnaar mag kiezen, van een massage tot de film van vanavond.</Body>
      </Card>

      <Card tone="blue">
        <Small>Binnenkort</Small>
        <H2>Memory Match · Liefdesduel · Samen puzzelen</H2>
        <Small>Meer minigames volgen in een volgende versie.</Small>
      </Card>
    </Screen>
  );
}
