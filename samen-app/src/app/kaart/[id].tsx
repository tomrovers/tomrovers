import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Header } from '@/components/header';
import { Body, Button, Card, Field, H2, Screen, Small, Strong } from '@/components/ui';
import { actions } from '@/lib/actions';
import { cards, cardThemes } from '@/lib/content';
import { nameOf } from '@/lib/people';
import { useCouple } from '@/lib/store';

export default function Kaart() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, post } = useCouple();
  const [answer, setAnswer] = useState('');
  const [insight, setInsight] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const card = cards.find(c => c.id === id);
  if (!card) {
    return (
      <Screen>
        <Header eyebrow="Gesprekskaart" title="Deze kaart bestaat niet" />
      </Screen>
    );
  }
  const theme = cardThemes.find(t => t.id === card.theme)!;
  const c = state.cards[card.id];
  const partnerName = nameOf(state, state.partnerId);

  const submit = async () => {
    setSaving(true);
    try {
      await post(actions.answerCard(card.id, answer.trim()));
    } finally {
      setSaving(false);
    }
  };

  const saveInsight = async (isPrivate: boolean) => {
    if (!insight?.trim()) return;
    await post(actions.note(theme.label, insight.trim(), isPrivate));
    setSaved(true);
    setInsight(null);
  };

  return (
    <Screen>
      <Header eyebrow={theme.label} title={card.question} />

      {!c?.mine && (
        <Card tone={theme.tone}>
          <H2>Jouw antwoord</H2>
          {c?.partnerDone && <Small>{partnerName} heeft al geantwoord. Na jouw antwoord zien jullie het van elkaar.</Small>}
          <Field value={answer} onChangeText={setAnswer} placeholder="Schrijf wat er in je opkomt…" multiline maxLength={600} />
          <Button title="Antwoord delen" onPress={submit} disabled={!answer.trim()} loading={saving} />
        </Card>
      )}

      {c?.mine && (
        <Card tone={theme.tone}>
          <Small>Jij</Small>
          <Body>{c.mine}</Body>
        </Card>
      )}

      {c?.mine && !c.partner && (
        <Card tone="white">
          <Small>Wachten op het antwoord van {partnerName}. Je krijgt het hier te zien zodra het er is.</Small>
        </Card>
      )}

      {c?.mine && c.partner && (
        <>
          <Card tone="white">
            <Small>{partnerName}</Small>
            <Body>{c.partner}</Body>
          </Card>
          <Card tone="pink">
            <Strong>Iets om te onthouden?</Strong>
            <Small>Bewaar een inzicht in het Kompas. Samen herinnert je er later aan.</Small>
            {insight === null ? (
              saved ? (
                <Small>Bewaard in het Kompas ✓</Small>
              ) : (
                <Button title="Inzicht bewaren" variant="secondary" onPress={() => setInsight(`${partnerName}: ${c.partner}`)} />
              )
            ) : (
              <>
                <Field value={insight} onChangeText={setInsight} multiline maxLength={300} />
                <Button title="Bewaar voor ons allebei" onPress={() => saveInsight(false)} />
                <Button title="Alleen voor mezelf" variant="ghost" onPress={() => saveInsight(true)} />
              </>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}
