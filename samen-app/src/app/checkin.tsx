import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/header';
import { Icon } from '@/components/icon';
import { Body, Button, Chip, Chips, Field, H2, PrivacyNote, Screen, Small } from '@/components/ui';
import { actions } from '@/lib/actions';
import { moods, needs } from '@/lib/content';
import { nameOf } from '@/lib/people';
import { useCouple } from '@/lib/store';
import type { Mood, Need } from '@/lib/types';
import { colors, fonts, radius, space } from '@/theme';

const NOTE_MAX = 160;

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

  const myName = state.me?.name;
  return (
    <Screen edges={['top', 'bottom']}>
      <Header eyebrow="Dagelijkse check-in" title={myName ? `Hoe gaat het met je, ${myName}?` : 'Hoe gaat het met je?'} />
      <PrivacyNote>{partnerName} ziet je antwoorden pas als jullie allebei hebben ingevuld.</PrivacyNote>

      <View style={styles.section}>
        <H2>Hoe voel jij je vandaag?</H2>
        <View style={styles.moods}>
          {moods.map(m => {
            const on = mood === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMood(m.id)}
                accessibilityRole="button"
                accessibilityLabel={m.label}
                accessibilityState={{ selected: on }}
                style={({ pressed }) => [styles.mood, on && styles.moodSelected, pressed && { opacity: 0.8 }]}>
                <Icon name={`mood-${m.id}`} color={colors.plum} size={28} />
                <Text style={[styles.moodLabel, on && { color: colors.plum }]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <H2>Hoeveel energie heb je?</H2>
        <View style={styles.energy}>
          {[1, 2, 3, 4, 5].map(n => {
            const on = n === energy;
            return (
              <Pressable
                key={n}
                onPress={() => setEnergy(n)}
                accessibilityRole="button"
                accessibilityLabel={`Energie ${n} van 5`}
                accessibilityState={{ selected: on }}
                style={[styles.energyButton, on && styles.energyOn]}>
                <Text style={[styles.energyText, on && { color: colors.white }]}>{n}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.energyKey}>
          <Small>1 · Leeg</Small>
          <Small>5 · Vol energie</Small>
        </View>
      </View>

      <View style={styles.section}>
        <H2>Waar heb je behoefte aan?</H2>
        <Chips>
          {needs.map(n => (
            <Chip key={n.id} label={n.label} selected={need === n.id} onPress={() => setNeed(n.id)} />
          ))}
        </Chips>
      </View>

      <View style={styles.section}>
        <H2>Iets voor {partnerName}?</H2>
        <Field value={note} onChangeText={setNote} placeholder="Je mag dit ook leeg laten." maxLength={NOTE_MAX} multiline accessibilityLabel={`Iets voor ${partnerName}`} />
        <Small style={{ textAlign: 'right' }}>
          {note.length}/{NOTE_MAX}
        </Small>
      </View>

      <Button title="Check in" icon="check" onPress={save} disabled={!mood || !need} loading={saving} />
      {(!mood || !need) && <Small style={{ textAlign: 'center' }}>Kies je stemming en je behoefte.</Small>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md, marginTop: space.md },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  mood: {
    width: '31%',
    flexGrow: 1,
    maxWidth: '33%',
    minHeight: 90,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: colors.control,
  },
  moodSelected: { backgroundColor: colors.lav, borderColor: colors.plum, borderWidth: 2 },
  moodLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, textAlign: 'center' },
  energy: { flexDirection: 'row', gap: 10 },
  energyButton: { flex: 1, maxWidth: 60, minHeight: 52, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.control, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  energyOn: { backgroundColor: colors.plum, borderColor: colors.plum },
  energyText: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  energyKey: { flexDirection: 'row', justifyContent: 'space-between' },
});
