import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/header';
import { Body, Button, Card, Chip, Chips, Field, H2, Screen, Small } from '@/components/ui';
import { actions } from '@/lib/actions';
import { moods, needs } from '@/lib/content';
import { nameOf } from '@/lib/people';
import { useCouple } from '@/lib/store';
import type { Mood, Need } from '@/lib/types';
import { colors, fonts, radius } from '@/theme';

export default function CheckIn() {
  const { state, post } = useCouple();
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState(3);
  const [need, setNeed] = useState<Need | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const partnerName = nameOf(state, state.partnerId);

  if (state.today.mine) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Header eyebrow="Dagelijkse check-in" title="Je bent al ingecheckt" />
        <Body>Morgen is er weer een nieuwe check-in.</Body>
        <Button title="Terug naar huis" onPress={() => router.back()} />
      </Screen>
    );
  }

  const save = async () => {
    if (!mood || !need) return;
    setSaving(true);
    try {
      await post(actions.checkIn({ mood, energy, need, note: note.trim() || undefined }));
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header eyebrow="Dagelijkse check-in" title="Hoe gaat het met je?" />
      <Small>{partnerName} ziet je antwoorden pas als jullie allebei hebben ingevuld.</Small>

      <Card tone="lav">
        <H2>Hoe voel jij je vandaag?</H2>
        <View style={styles.moods}>
          {moods.map(m => (
            <Pressable
              key={m.id}
              onPress={() => setMood(m.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: mood === m.id }}
              style={[styles.mood, mood === m.id && styles.moodSelected]}>
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card tone="peach">
        <H2>Hoeveel energie heb je?</H2>
        <View style={styles.energy}>
          {[1, 2, 3, 4, 5].map(n => (
            <Pressable
              key={n}
              onPress={() => setEnergy(n)}
              accessibilityRole="button"
              accessibilityLabel={`Energie ${n} van 5`}
              style={[styles.dot, n <= energy && styles.dotOn]}>
              <Text style={[styles.dotText, n <= energy && { color: colors.white }]}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <Small>1 is leeg, 5 is vol energie.</Small>
      </Card>

      <Card tone="mint">
        <H2>Waar heb je behoefte aan?</H2>
        <Chips>
          {needs.map(n => (
            <Chip key={n.id} label={n.label} selected={need === n.id} onPress={() => setNeed(n.id)} />
          ))}
        </Chips>
      </Card>

      <Card tone="blue">
        <H2>Wil je {partnerName} iets laten weten?</H2>
        <Field value={note} onChangeText={setNote} placeholder="Optioneel" maxLength={160} multiline />
      </Card>

      <Button title="Check in" onPress={save} disabled={!mood || !need} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mood: { width: '31%', flexGrow: 1, backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', gap: 4, borderWidth: 2, borderColor: 'transparent' },
  moodSelected: { borderColor: colors.plum },
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.plum },
  energy: { flexDirection: 'row', gap: 10 },
  dot: { flex: 1, aspectRatio: 1, maxWidth: 56, borderRadius: 999, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: colors.rose },
  dotText: { fontFamily: fonts.bold, fontSize: 16, color: colors.plum },
});
