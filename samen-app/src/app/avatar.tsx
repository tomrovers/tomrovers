import { router } from 'expo-router';
import { useState } from 'react';

import { defaultAvatar } from '@/components/avatar';
import { AvatarEditor } from '@/components/avatar-editor';
import { Header } from '@/components/header';
import { Button, Field, H2, Screen } from '@/components/ui';
import { useStore } from '@/lib/store';
import type { AvatarConfig } from '@/lib/types';

export default function AvatarScreen() {
  const { profile, saveProfile } = useStore();
  const [name, setName] = useState(profile?.name ?? '');
  const [avatar, setAvatar] = useState<AvatarConfig>(profile?.avatar ?? defaultAvatar);
  const [saving, setSaving] = useState(false);

  return (
    <Screen>
      <Header eyebrow="LoveGotchi" title="Jouw mini-jij" />
      <H2>Naam</H2>
      <Field value={name} onChangeText={setName} maxLength={24} />
      <AvatarEditor value={avatar} onChange={setAvatar} />
      <Button
        title="Opslaan"
        disabled={!name.trim()}
        loading={saving}
        onPress={async () => {
          setSaving(true);
          await saveProfile({ name: name.trim(), avatar });
          router.back();
        }}
      />
    </Screen>
  );
}
