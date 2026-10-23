import { router } from 'expo-router';
import { useState } from 'react';

import { Header } from '@/components/header';
import { Body, Button, Card, Chip, Chips, H2, Row, Screen, Small, Strong } from '@/components/ui';
import { actions } from '@/lib/actions';
import { kjmRoundQuestions } from '@/lib/content';
import { nameOf } from '@/lib/people';
import type { KjmRound } from '@/lib/state';
import { useCouple } from '@/lib/store';
import { colors } from '@/theme';

function Result({ round, partnerName }: { round: KjmRound; partnerName: string }) {
  const questions = kjmRoundQuestions(round.round);
  const { myScore, partnerScore } = round.result!;
  const verdict = myScore === partnerScore ? 'Gelijkspel!' : myScore > partnerScore ? 'Jij kent je partner het best! 🏆' : `${partnerName} kent jou het best! 🏆`;
  return (
    <Card tone="pink">
      <Small>Uitslag ronde {round.round}</Small>
      <H2>{verdict}</H2>
      <Row style={{ justifyContent: 'space-around' }}>
        <Strong>Jij {myScore}/5</Strong>
        <Strong>
          {partnerName} {partnerScore}/5
        </Strong>
      </Row>
      {questions.map((q, i) => {
        const right = round.mine!.guess[i] === round.partner!.self[i];
        return (
          <Card key={q.id} tone="white" style={{ gap: 2 }}>
            <Strong>{q.question}</Strong>
            <Small>
              {partnerName}: {q.options[round.partner!.self[i]]}
            </Small>
            <Small style={{ color: right ? colors.success : colors.roseDark }}>
              Jouw gok: {q.options[round.mine!.guess[i]]} {right ? '✓' : '✗'}
            </Small>
          </Card>
        );
      })}
    </Card>
  );
}

export default function KenJeMij() {
  const { state, post } = useCouple();
  const partnerName = nameOf(state, state.partnerId);
  const round = state.kjm;
  const questions = kjmRoundQuestions(round.round);
  const [step, setStep] = useState<'self' | 'guess'>('self');
  const [self, setSelf] = useState<number[]>([]);
  const [guess, setGuess] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const last = state.kjmHistory[state.kjmHistory.length - 1];
  const lastWin = last && state.wins.find(w => w.gameKey === `kjm:${last.round}`);

  const answers = step === 'self' ? self : guess;
  const setAnswers = step === 'self' ? setSelf : setGuess;
  const complete = questions.every((_, i) => answers[i] !== undefined);

  const submit = async () => {
    setSaving(true);
    try {
      await post(actions.submitKjm(round.round, self, guess));
      setStep('self');
      setSelf([]);
      setGuess([]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header eyebrow="Ken je mij?" title={`Ronde ${round.round}`} />

      {last && <Result round={last} partnerName={partnerName} />}
      {lastWin && !lastWin.claim && lastWin.winnerId === state.myId && (
        <Button title="Kies je beloning" onPress={() => router.push('/beloningen')} />
      )}

      {round.mine ? (
        <Card tone="mint">
          <H2>Je antwoorden zijn binnen</H2>
          <Body>Zodra {partnerName} ook klaar is, zie je hier de uitslag.</Body>
        </Card>
      ) : (
        <>
          <Card tone={step === 'self' ? 'lav' : 'peach'}>
            <H2>{step === 'self' ? 'Stap 1: over jezelf' : `Stap 2: wat koos ${partnerName}?`}</H2>
            <Small>
              {step === 'self'
                ? `Kies wat het best bij jou past. ${partnerName} probeert dit te raden.`
                : `Raad wat ${partnerName} over zichzelf heeft gekozen.`}
            </Small>
            {round.partnerDone && step === 'self' && <Small style={{ color: colors.rose }}>{partnerName} is al klaar!</Small>}
          </Card>
          {questions.map((q, i) => (
            <Card key={`${step}-${q.id}`} tone="white">
              <Strong>{q.question}</Strong>
              <Chips>
                {q.options.map((o, j) => (
                  <Chip
                    key={o}
                    label={o}
                    selected={answers[i] === j}
                    onPress={() => {
                      const next = [...answers];
                      next[i] = j;
                      setAnswers(next);
                    }}
                  />
                ))}
              </Chips>
            </Card>
          ))}
          {step === 'self' ? (
            <Button title="Verder: raad je partner" onPress={() => setStep('guess')} disabled={!complete} />
          ) : (
            <>
              <Button title="Insturen" onPress={submit} disabled={!complete} loading={saving} />
              <Button title="Terug naar stap 1" variant="ghost" onPress={() => setStep('self')} />
            </>
          )}
        </>
      )}
    </Screen>
  );
}
