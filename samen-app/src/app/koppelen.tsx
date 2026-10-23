import { router } from 'expo-router';
import { useState } from 'react';

import { Body, Button, Card, Eyebrow, Field, H1, H2, Screen, Small } from '@/components/ui';
import { notify } from '@/lib/notify';
import { useStore } from '@/lib/store';

export default function Koppelen() {
  const { profile, cloudAvailable, createCouple, joinCouple, startDemo } = useStore();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | 'demo' | null>(null);

  const run = (kind: 'create' | 'join' | 'demo', fn: () => Promise<void>) => async () => {
    setBusy(kind);
    try {
      await fn();
      router.replace('/thuis');
    } catch (e) {
      notify('Dat lukte niet', e instanceof Error ? e.message : 'Probeer het later opnieuw.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <Eyebrow>Samen Couples</Eyebrow>
      <H1>Hoi {profile?.name}! Koppel met je partner</H1>
      <Body>Jullie krijgen allebei een eigen account. Wat persoonlijk is, blijft van jezelf; wat jullie delen, zien jullie samen.</Body>

      <Card tone="lav">
        <H2>Ik begin</H2>
        <Small>Je krijgt een code van zes tekens die je partner in de eigen app invult.</Small>
        <Button title="Maak onze koppelcode" onPress={run('create', createCouple)} disabled={!cloudAvailable} loading={busy === 'create'} />
      </Card>

      <Card tone="mint">
        <H2>Ik heb een code gekregen</H2>
        <Field value={code} onChangeText={t => setCode(t.toUpperCase())} placeholder="Bijv. K7M2QX" autoCapitalize="characters" maxLength={6} autoCorrect={false} />
        <Button title="Koppelen" onPress={run('join', () => joinCouple(code))} disabled={!cloudAvailable || code.trim().length !== 6} loading={busy === 'join'} />
      </Card>

      {!cloudAvailable && (
        <Small>De server is in deze versie nog niet ingesteld, dus echt koppelen kan nog niet. Probeer de demo.</Small>
      )}

      <Card tone="peach">
        <H2>Eerst even rondkijken?</H2>
        <Small>In de demo speel je met een gesimuleerde partner, Sam. Alles blijft op deze telefoon.</Small>
        <Button title="Probeer de demo" variant="secondary" onPress={run('demo', startDemo)} loading={busy === 'demo'} />
      </Card>
    </Screen>
  );
}
