import { View } from 'react-native';

import { Btn, Chip, nightStyles, T } from '@/components/night';
import { actions } from '@/lib/actions';
import { sparkLabels, vonkReplies } from '@/lib/afterdark';
import { nameOf } from '@/lib/people';
import { useCouple } from '@/lib/store';
import { night } from '@/theme';

const flames = (n: number) => (n === 0 ? '🌙' : '🔥'.repeat(n));

/**
 * Vonk: how much do you feel like it today? Your partner only ever sees a match, never a low
 * number. Plus a vonk you can send, with a friendly way to say "not tonight".
 */
export function VonkPanel({ compact }: { compact?: boolean }) {
  const { state, post } = useCouple();
  const ad = state.afterDark;
  const partnerName = nameOf(state, state.partnerId);
  const today = state.today.day;
  const mine = ad.spark.mine;
  const incoming = ad.vonken.filter(v => v.day === today && v.from !== state.myId);
  const sent = ad.vonken.find(v => v.day === today && v.from === state.myId);

  return (
    <View style={{ gap: 10 }}>
      <T kind="h2">Hoeveel zin heb je vandaag?</T>
      <View style={nightStyles.wrap}>
        {sparkLabels.map((label, n) => (
          <Chip key={label} label={flames(n)} a11y={label} on={mine === n} onPress={() => post(actions.adSpark(n))} />
        ))}
      </View>
      {mine !== undefined && (
        <T kind="small">
          Jij: {sparkLabels[mine].toLowerCase()}. Je kunt het de hele dag aanpassen.
        </T>
      )}

      {ad.spark.match === 'vuur' ? (
        <View style={[nightStyles.card, { backgroundColor: night.cardHi, borderColor: night.rose }]}>
          <T kind="h2">🔥 Jullie hebben vandaag allebei veel zin</T>
          <T kind="small">Wat de rest van de dag ook brengt: vanavond is van jullie.</T>
        </View>
      ) : ad.spark.match === 'lucht' ? (
        <View style={[nightStyles.card, { backgroundColor: night.cardHi }]}>
          <T kind="h2">😏 Er hangt iets in de lucht</T>
          <T kind="small">Jullie hebben vandaag allebei wel zin. Een vonk sturen?</T>
        </View>
      ) : (
        <T kind="small">
          {mine === undefined
            ? `Alleen als jullie allebei zin hebben, zien jullie dat hier. ${partnerName} ziet nooit jouw getal, en jij niet dat van ${partnerName}.`
            : `Als ${partnerName} ook zin heeft, zie je het hier. Zo niet, dan ziet niemand iets. Ook dat is oké.`}
        </T>
      )}

      {incoming.map(v => (
        <View key={v.id} style={[nightStyles.card, { backgroundColor: night.cardHi }]}>
          <T kind="h2">✨ {partnerName} stuurt je een vonk</T>
          {v.reply ? (
            <T kind="small">Jij zei: {vonkReplies.find(r => r.id === v.reply)?.label}</T>
          ) : (
            <View style={nightStyles.wrap}>
              {vonkReplies.map(r => (
                <Chip key={r.id} label={r.label} onPress={() => post(actions.adVonkReply(v.id, r.id))} />
              ))}
            </View>
          )}
        </View>
      ))}

      {sent ? (
        <T kind="small" style={{ color: sent.reply ? night.gold : night.muted }}>
          {sent.reply ? `${partnerName} ${vonkReplies.find(r => r.id === sent.reply)?.seen}` : `Vonk verstuurd ✨ ${partnerName} ziet hem nu.`}
        </T>
      ) : (
        <Btn title={`Stuur ${partnerName} een vonk ✨`} onPress={() => post(actions.adVonk())} />
      )}

      {!compact && (
        <T kind="small">
          Een vonk zegt: ik denk aan je, en ik heb zin in je. {partnerName} kan ja zeggen, later, of vanavond liever een knuffel. Elk antwoord is goed.
        </T>
      )}
      {!compact && ad.rhythm && (
        <View style={nightStyles.card}>
          <T kind="tag">Jullie ritme</T>
          <T>Jullie zin valt het vaakst samen op {ad.rhythm}. Misschien een vaste avond voor jullie twee?</T>
        </View>
      )}
    </View>
  );
}
