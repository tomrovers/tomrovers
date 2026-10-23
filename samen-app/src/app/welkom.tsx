import { router } from 'expo-router';
import { useState } from 'react';

import { defaultAvatar } from '@/components/avatar';
import { AvatarEditor } from '@/components/avatar-editor';
import { Body, Button, Eyebrow, Field, H1, H2, Screen } from '@/components/ui';
import { useStore } from '@/lib/store';
import type { AvatarConfig } from '@/lib/types';

export default function Welkom() {
  const { saveProfile } = useStore();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<AvatarConfig>(defaultAvatar);
  const [saving, setSaving] = useState(false);

  const done = async () => {
    setSaving(true);
    await saveProfile({ name: name.trim(), avatar });
    router.replace('/koppelen');
  };

  return (
    <Screen>
      <Eyebrow>Welkom bij Samen</Eyebrow>
      <H1>Van eerste klik tot blijvende verbinding</H1>
      <Body>Maak eerst je eigen mini-jij. Je partner ziet deze LoveGotchi in jullie gezamenlijke huisje.</Body>
      <H2>Hoe heet je?</H2>
      <Field value={name} onChangeText={setName} placeholder="Je voornaam" autoCapitalize="words" maxLength={24} />
      <H2>Jouw LoveGotchi</H2>
      <AvatarEditor value={avatar} onChange={setAvatar} />
      <Button title="Verder" onPress={done} disabled={!name.trim()} loading={saving} />
    </Screen>
  );
}
