import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { Header } from '@/components/header';
import { Body, Button, Card, Chip, Chips, H1, H2, Row, Screen, Small, Strong } from '@/components/ui';
import { notify } from '@/lib/notify';
import { nameOf } from '@/lib/people';
import { allowReminders, cancelReminders, loadReminder, planReminders, remindersSupported, saveReminder, timeLabel, type Reminder } from '@/lib/reminder';
import { dayKey } from '@/lib/state';
import { useCouple } from '@/lib/store';

function ReminderCard() {
  const { state } = useCouple();
  const [reminder, setReminder] = useState<Reminder | null>(null);
  useEffect(() => {
    void loadReminder().then(setReminder);
  }, []);

  if (!remindersSupported) {
    return (
      <Card tone="blue">
        <H2>Dagelijkse herinnering</H2>
        <Body>Een herinnering voor je check-in kun je aanzetten in de app op je telefoon.</Body>
      </Card>
    );
  }
  if (!reminder) return null;

  const update = async (next: Reminder) => {
    if (next.on && !reminder.on && !(await allowReminders())) {
      notify('Meldingen staan uit', 'Zet meldingen voor Samen aan in de instellingen van je telefoon en probeer het daarna opnieuw.');
      return;
    }
    setReminder(next);
    await saveReminder(next);
    const checkedInToday = !!state.today.mine && state.today.day === dayKey();
    await planReminders(next, { checkedInToday, partnerName: nameOf(state, state.partnerId) });
  };
  const shift = (minutes: number) => {
    const t = (reminder.hour * 60 + reminder.minute + minutes + 24 * 60) % (24 * 60);
    void update({ ...reminder, hour: Math.floor(t / 60), minute: t % 60 });
  };

  return (
    <Card tone="blue">
      <H2>Dagelijkse herinnering</H2>
      <Body>Een seintje voor je check-in, op een tijd die jou past. Heb je die dag al ingecheckt, dan krijg je niets.</Body>
      <Chips>
        <Chip label="Aan" selected={reminder.on} onPress={() => void update({ ...reminder, on: true })} />
        <Chip label="Uit" selected={!reminder.on} onPress={() => void update({ ...reminder, on: false })} />
      </Chips>
      {reminder.on && (
        <Row style={{ justifyContent: 'center' }} gap={16}>
          <Button title="−" variant="secondary" onPress={() => shift(-30)} style={{ paddingHorizontal: 22 }} />
          <H1 accessibilityLabel={`Herinnering om ${timeLabel(reminder)}`}>{timeLabel(reminder)}</H1>
          <Button title="+" variant="secondary" onPress={() => shift(30)} style={{ paddingHorizontal: 22 }} />
        </Row>
      )}
    </Card>
  );
}

export default function Instellingen() {
  const { state, session, mode, leaveCouple, sharedAvailable, leaveDemoForShared } = useCouple();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const partnerName = nameOf(state, state.partnerId);

  const leave = async () => {
    // Ask in the screen itself: system dialogs are not available everywhere (for example on the web).
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      await cancelReminders();
      await leaveCouple();
      router.replace('/koppelen');
    } catch (e) {
      notify('Dat lukte niet', e instanceof Error ? e.message : 'Probeer het later opnieuw.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header eyebrow="Instellingen" title="Jij & Samen" />

      <Card tone="pink">
        <H2>{state.me?.name}</H2>
        <Button title="Naam en LoveGotchi aanpassen" variant="secondary" onPress={() => router.push('/avatar')} />
      </Card>

      <Card tone="lav">
        <H2>Jullie koppel</H2>
        {mode === 'demo' ? (
          <>
            <Body>Je speelt de demo met Annelieke. Alles blijft op deze telefoon.</Body>
            {sharedAvailable && (
              <Button
                title="Stop de demo en begin samen"
                onPress={async () => {
                  await leaveDemoForShared();
                  router.replace('/vandaag');
                }}
              />
            )}
          </>
        ) : mode === 'shared' ? (
          <Body>{state.partnerId ? `Gekoppeld met ${partnerName} via deze gedeelde pagina.` : 'Je partner is nog niet aangesloten.'}</Body>
        ) : (
          <>
            <Body>{state.partnerId ? `Gekoppeld met ${partnerName}.` : 'Je partner is nog niet gekoppeld.'}</Body>
            <Small>Koppelcode: {session.code}</Small>
          </>
        )}
      </Card>

      <ReminderCard />

      <Card tone="mint">
        <H2>Privacy</H2>
        <Body>
          <Strong>Check-ins en antwoorden</Strong> zijn pas zichtbaar voor je partner als jullie allebei hebben ingevuld.
          {mode === 'shared' ? ' In deze testversie regelt de app dat; in de echte app doet de server het.' : ''}
        </Body>
        <Body>
          <Strong>Notities “alleen voor mij”</Strong> kan alleen jij lezen{mode === 'shared' ? '' : ', ook op de server'}.
        </Body>
        <Body>Bij ontkoppelen worden jouw eigen gegevens verwijderd.</Body>
      </Card>

      {confirming && (
        <Card tone="peach">
          <Strong>{mode === 'demo' ? 'Demo opnieuw beginnen?' : 'Weet je het zeker?'}</Strong>
          <Body>
            {mode === 'demo'
              ? 'Alle demogegevens op deze telefoon worden gewist.'
              : `Je verlaat het koppel met ${partnerName}. Jouw eigen antwoorden, check-ins en notities worden verwijderd.`}
          </Body>
          <Button title="Annuleren" variant="secondary" onPress={() => setConfirming(false)} />
        </Card>
      )}
      <Button
        title={confirming ? (mode === 'demo' ? 'Ja, opnieuw beginnen' : 'Ja, ontkoppelen') : mode === 'demo' ? 'Demo opnieuw beginnen' : 'Ontkoppelen'}
        variant={confirming ? 'primary' : 'ghost'}
        onPress={leave}
        loading={busy}
      />
      <Small style={{ textAlign: 'center' }}>Samen · versie 0.1 (testversie)</Small>
    </Screen>
  );
}
