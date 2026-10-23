import { router } from 'expo-router';

import { House } from '@/components/house';
import { Body, Button, Card, Eyebrow, H1, H2, Row, Screen, Small, Strong } from '@/components/ui';
import { achievements } from '@/lib/content';
import { expressions } from '@/lib/people';
import { useCouple } from '@/lib/store';
import { colors } from '@/theme';

export default function Huisje() {
  const { state } = useCouple();
  const face = expressions(state);
  const count = state.unlocked.size;

  return (
    <Screen>
      <Eyebrow>Jullie digitale huisje</Eyebrow>
      <H1>Van lege kamer naar ons eigen plekje</H1>
      <House
        items={state.items}
        me={state.me && { avatar: state.me.avatar, expression: face.me }}
        partner={state.partner && { avatar: state.partner.avatar, expression: face.partner }}
      />
      <Button title="Pas mijn LoveGotchi aan" variant="secondary" onPress={() => router.push('/avatar')} />

      <H2>
        Prestaties ({count}/{achievements.length})
      </H2>
      <Body>Elke prestatie levert iets op voor in jullie huisje.</Body>
      {achievements.map(a => {
        const done = state.unlocked.has(a.id);
        return (
          <Card key={a.id} tone={done ? 'mint' : 'white'} style={!done && { opacity: 0.7 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Strong>{done ? '🏅 ' : '🔒 '}{a.title}</Strong>
              <Small style={{ color: done ? colors.success : colors.muted }}>{done ? 'Ontgrendeld' : 'Nog te doen'}</Small>
            </Row>
            <Small>{a.description}</Small>
            <Small style={{ color: colors.plum }}>Beloning: {a.itemLabel}</Small>
          </Card>
        );
      })}
    </Screen>
  );
}
