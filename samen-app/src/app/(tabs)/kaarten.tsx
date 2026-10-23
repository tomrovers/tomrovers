import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Body, Card, Chip, Chips, Eyebrow, H1, Row, Screen, Small, Strong } from '@/components/ui';
import { cards, cardThemes } from '@/lib/content';
import { nameOf } from '@/lib/people';
import type { CardState } from '@/lib/state';
import { useCouple } from '@/lib/store';
import { colors } from '@/theme';

function status(c: CardState | undefined, partnerName: string): { label: string; color: string } {
  if (c?.mine && c.partner) return { label: 'Samen beantwoord', color: colors.success };
  if (c?.mine) return { label: `Wacht op ${partnerName}`, color: colors.muted };
  if (c?.partnerDone) return { label: `${partnerName} heeft geantwoord!`, color: colors.rose };
  return { label: 'Nieuw', color: colors.plum };
}

export default function Kaarten() {
  const { state } = useCouple();
  const [theme, setTheme] = useState<string | null>(null);
  const partnerName = nameOf(state, state.partnerId);
  const shown = cards.filter(c => !theme || c.theme === theme);

  return (
    <Screen>
      <Eyebrow>Interactieve gesprekskaarten</Eyebrow>
      <H1>Een gesprek dat doorwerkt</H1>
      <Body>Beantwoord een kaart. Zodra jullie allebei hebben geantwoord, zien jullie elkaars antwoord.</Body>
      <Chips>
        <Chip label="Alles" selected={!theme} onPress={() => setTheme(null)} />
        {cardThemes.map(t => (
          <Chip key={t.id} label={t.label} selected={theme === t.id} onPress={() => setTheme(t.id)} />
        ))}
      </Chips>
      <Small>{state.cardsAnsweredTogether} van {cards.length} samen beantwoord</Small>
      {shown.map(card => {
        const t = cardThemes.find(x => x.id === card.theme)!;
        const s = status(state.cards[card.id], partnerName);
        return (
          <Card key={card.id} tone={t.tone} onPress={() => router.push({ pathname: '/kaart/[id]', params: { id: card.id } })}>
            <Small>{t.label}</Small>
            <Strong style={{ fontSize: 17 }}>{card.question}</Strong>
            <Row>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color }} />
              <Small style={{ color: s.color }}>{s.label}</Small>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
