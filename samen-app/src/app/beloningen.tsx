import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { Header } from '@/components/header';
import { Body, Button, Card, Chip, Chips, Field, H2, Row, Screen, Small, Strong } from '@/components/ui';
import { actions } from '@/lib/actions';
import { nameOf } from '@/lib/people';
import { useCouple } from '@/lib/store';
import { colors, fonts } from '@/theme';

export default function Beloningen() {
  const { state, post } = useCouple();
  const [title, setTitle] = useState('');
  const partnerName = nameOf(state, state.partnerId);
  const myOpenWins = state.openWins.filter(w => w.winnerId === state.myId);
  const openClaims = state.claims.filter(c => !c.redeemed);
  const redeemedClaims = state.claims.filter(c => c.redeemed);

  return (
    <Screen>
      <Header eyebrow="Beloningen & prestaties" title="De beloningenpot" />
      <Body>Spreek samen af wat de winnaar mag kiezen. Een beloning is altijd vrijwillig en kun je samen aanpassen.</Body>

      {myOpenWins.map(w => (
        <Card key={w.gameKey} tone="mint">
          <Small>Je won {w.title}!</Small>
          <H2>Kies je beloning</H2>
          {state.rewards.length === 0 && <Small>De pot is leeg. Voeg hieronder eerst een beloning toe.</Small>}
          <Chips>
            {state.rewards.map(r => (
              <Chip key={r.id} label={r.title} onPress={() => post(actions.claimReward(w.gameKey, r.id))} />
            ))}
          </Chips>
        </Card>
      ))}

      {openClaims.length > 0 && <H2>Nog te verzilveren</H2>}
      {openClaims.map(c => (
        <Card key={c.id} tone="lav">
          <Small>{c.winnerId === state.myId ? `Jij koos, ${partnerName} trakteert:` : `${partnerName} koos, jij trakteert:`}</Small>
          <Strong>{c.rewardTitle}</Strong>
          <Button title="Verzilverd ✓" variant="secondary" onPress={() => post(actions.redeemReward(c.id))} />
        </Card>
      ))}

      <H2>In de pot</H2>
      <Card tone="peach">
        {state.rewards.map(r => (
          <Row key={r.id} style={{ justifyContent: 'space-between' }}>
            <Body style={{ flex: 1 }}>{r.title}</Body>
            <Pressable onPress={() => post(actions.removeReward(r.id))} accessibilityLabel={`Verwijder ${r.title}`} hitSlop={10}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.muted }}>×</Text>
            </Pressable>
          </Row>
        ))}
        <Field value={title} onChangeText={setTitle} placeholder="Nieuwe beloning, bijv. samen ijs halen" maxLength={60} />
        <Button
          title="Toevoegen"
          variant="secondary"
          disabled={!title.trim()}
          onPress={async () => {
            await post(actions.addReward(title.trim()));
            setTitle('');
          }}
        />
      </Card>

      {redeemedClaims.length > 0 && (
        <>
          <H2>Eerder verzilverd</H2>
          {redeemedClaims.map(c => (
            <Small key={c.id}>
              ✓ {c.rewardTitle} ({c.winnerId === state.myId ? 'voor jou' : `voor ${partnerName}`})
            </Small>
          ))}
        </>
      )}
    </Screen>
  );
}
