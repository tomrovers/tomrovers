import { router } from 'expo-router';

import { ItemIcon } from '@/components/house/sprites';
import { Body, Button, Card, Eyebrow, H1, Row, Screen, Small, Strong } from '@/components/ui';
import { achievements } from '@/lib/content';
import { kinds } from '@/lib/house/catalog';
import { useCouple } from '@/lib/store';
import { colors } from '@/theme';

export default function Prestaties() {
  const { state } = useCouple();
  const count = state.unlocked.size;

  return (
    <Screen>
      <Eyebrow>Prestaties</Eyebrow>
      <H1>
        Samen verdiend ({count}/{achievements.length})
      </H1>
      <Button title="Pas mijn LoveGotchi aan" variant="secondary" onPress={() => router.push('/avatar')} />
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
            <Row>
              <ItemIcon kind={kinds.find(k => 'achievement' in k.from && k.from.achievement === a.item)?.id ?? ''} size={40} />
              <Small style={{ color: colors.plum, flex: 1 }}>Voor in het huisje: {a.itemLabel}</Small>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
