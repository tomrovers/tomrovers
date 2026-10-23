import { router } from 'expo-router';
import { useState } from 'react';

import { Header } from '@/components/header';
import { Body, Button, Card, H2, Screen, Small, Strong } from '@/components/ui';
import { notify } from '@/lib/notify';
import { nameOf } from '@/lib/people';
import { useCouple } from '@/lib/store';

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
            <Body>Je speelt de demo met Sam. Alles blijft op deze telefoon.</Body>
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
