import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Chip, Chips, Eyebrow, Field, H1, H2, Progress, Row, Screen, Small, Strong } from '@/components/ui';
import { actions } from '@/lib/actions';
import { cardThemes, loveLanguages } from '@/lib/content';
import { nameOf } from '@/lib/people';
import { loveLanguageTip } from '@/lib/state';
import { useCouple } from '@/lib/store';
import type { LoveLanguageScores } from '@/lib/types';
import { colors, fonts } from '@/theme';

const barColors = ['#E0558A', '#B86AD0', '#F2B15C', '#3E9B76', '#6C8BD6'];

function Scores({ scores }: { scores: LoveLanguageScores }) {
  return (
    <View style={{ gap: 10 }}>
      {loveLanguages.map((l, i) => (
        <View key={l.id} style={{ gap: 4 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Small style={{ color: colors.ink }}>{l.label}</Small>
            <Small>{scores[l.id] * 20}%</Small>
          </Row>
          <Progress value={scores[l.id] / 5} color={barColors[i]} />
        </View>
      ))}
    </View>
  );
}

function ShareChoice({ isPrivate, onChange, partnerName }: { isPrivate: boolean; onChange: (p: boolean) => void; partnerName: string }) {
  return (
    <Chips>
      <Chip label={`Delen met ${partnerName}`} selected={!isPrivate} onPress={() => onChange(false)} />
      <Chip label="Alleen voor mij" selected={isPrivate} onPress={() => onChange(true)} />
    </Chips>
  );
}

export default function Kompas() {
  const { state, post } = useCouple();
  const partnerName = nameOf(state, state.partnerId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LoveLanguageScores>(state.loveLang.mine ?? { qualitytime: 3, aanraking: 3, woorden: 3, hulp: 3, cadeautjes: 3 });
  const [langPrivate, setLangPrivate] = useState(state.loveLang.minePrivate);
  const [noteTheme, setNoteTheme] = useState(cardThemes[0].label);
  const [noteText, setNoteText] = useState('');
  const [notePrivate, setNotePrivate] = useState(false);

  const showForm = editing || !state.loveLang.mine;
  const tip = loveLanguageTip(state.loveLang.partner);

  return (
    <Screen>
      <Eyebrow>Het Samen Kompas</Eyebrow>
      <H1>Onthouden wat de ander nodig heeft</H1>
      <Body>Ontdekken, onthouden, in de praktijk brengen en bijstellen. Jij bepaalt wat {partnerName} ervan ziet.</Body>

      {tip && (
        <Card tone="pink">
          <Small>Tip voor vandaag</Small>
          <Strong>{tip}</Strong>
        </Card>
      )}

      <Card tone="lav">
        <H2>Jouw liefdestalen</H2>
        {showForm ? (
          <>
            <Small>Hoe belangrijk is dit voor jou? 1 is een beetje, 5 is heel erg.</Small>
            {loveLanguages.map(l => (
              <View key={l.id} style={{ gap: 6 }}>
                <Small style={{ color: colors.ink }}>{l.label}</Small>
                <View style={styles.scale}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Pressable
                      key={n}
                      onPress={() => setDraft({ ...draft, [l.id]: n })}
                      accessibilityRole="button"
                      accessibilityLabel={`${l.label} ${n} van 5`}
                      style={[styles.step, n <= draft[l.id] && styles.stepOn]}>
                      <Text style={[styles.stepText, n <= draft[l.id] && { color: colors.white }]}>{n}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
            <ShareChoice isPrivate={langPrivate} onChange={setLangPrivate} partnerName={partnerName} />
            <Button
              title="Opslaan"
              onPress={async () => {
                await post(actions.loveLanguages(draft, langPrivate));
                setEditing(false);
              }}
            />
          </>
        ) : (
          <>
            <Scores scores={state.loveLang.mine!} />
            <Small>{state.loveLang.minePrivate ? 'Alleen zichtbaar voor jou.' : `Gedeeld met ${partnerName}.`}</Small>
            <Button title="Bijstellen" variant="secondary" onPress={() => setEditing(true)} />
          </>
        )}
      </Card>

      <Card tone="mint">
        <H2>Liefdestalen van {partnerName}</H2>
        {state.loveLang.partner ? (
          <Scores scores={state.loveLang.partner} />
        ) : (
          <Small>{partnerName} heeft dit nog niet ingevuld of gedeeld.</Small>
        )}
      </Card>

      <H2>Bewaarde inzichten</H2>
      <Card tone="white">
        <Chips>
          {cardThemes.map(t => (
            <Chip key={t.id} label={t.label} selected={noteTheme === t.label} onPress={() => setNoteTheme(t.label)} />
          ))}
        </Chips>
        <Field value={noteText} onChangeText={setNoteText} placeholder={`Bijv. ${partnerName} houdt van spontane uitjes`} multiline maxLength={300} />
        <ShareChoice isPrivate={notePrivate} onChange={setNotePrivate} partnerName={partnerName} />
        <Button
          title="Bewaren"
          variant="secondary"
          disabled={!noteText.trim()}
          onPress={async () => {
            await post(actions.note(noteTheme, noteText.trim(), notePrivate));
            setNoteText('');
          }}
        />
      </Card>
      {state.compass.length === 0 && <Small>Nog niets bewaard. Inzichten uit gesprekskaarten verschijnen hier ook.</Small>}
      {state.compass.map(n => (
        <Card key={n.id} tone={n.private ? 'blue' : 'peach'}>
          <Small>
            {n.theme} · {n.authorId === state.myId ? 'jij' : partnerName}
            {n.private ? ' · alleen voor jou' : ''}
          </Small>
          <Body>{n.text}</Body>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scale: { flexDirection: 'row', gap: 8 },
  step: { flex: 1, height: 38, borderRadius: 19, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  stepOn: { backgroundColor: colors.plum },
  stepText: { fontFamily: fonts.bold, fontSize: 14, color: colors.plum },
});
