import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn, nightStyles, Private, T } from '@/components/night';
import { actions } from '@/lib/actions';
import { sparkLabels, vonkReplies } from '@/lib/afterdark';
import { nameOf } from '@/lib/people';
import { useCouple } from '@/lib/store';
import { fonts, night, radius } from '@/theme';

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
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <T kind="h2">Hoeveel zin heb je vandaag?</T>
        <T kind="small">Je deelt je gevoel. Geen verwachting.</T>
      </View>
      <View style={styles.levels}>
        {sparkLabels.map((label, n) => {
          const on = mine === n;
          const color = on ? night.bg : night.muted;
          return (
            <Pressable
              key={label}
              onPress={() => post(actions.adSpark(n))}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [styles.level, on && styles.levelOn, pressed && { opacity: 0.8 }]}>
              <Icon name={n === 0 ? 'moon' : 'spark'} color={color} size={21} />
              <Text style={[styles.levelText, { color }]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      {mine !== undefined && (
        <T kind="small">
          <Text style={{ fontFamily: fonts.bold, color: night.text }}>Jij: {sparkLabels[mine].toLowerCase()}.</Text> Aanpassen mag altijd.
        </T>
      )}

      {ad.spark.match === 'vuur' ? (
        <View style={styles.match}>
          <View style={nightStyles.row}>
            <Icon name="spark" color={night.gold} size={22} />
            <T kind="h2" style={{ flex: 1 }}>
              Jullie hebben vandaag allebei veel zin
            </T>
          </View>
          <T kind="small">Misschien een moment voor jullie twee?</T>
        </View>
      ) : ad.spark.match === 'lucht' ? (
        <View style={styles.match}>
          <View style={nightStyles.row}>
            <Icon name="spark" color={night.gold} size={22} />
            <T kind="h2" style={{ flex: 1 }}>
              Er hangt iets in de lucht
            </T>
          </View>
          <T kind="small">Jullie hebben vandaag allebei wel zin. Een vonk sturen?</T>
        </View>
      ) : (
        <Private>
          {mine === undefined
            ? `Je getal blijft privé. Je ziet alleen een match als jullie allebei zin hebben. ${partnerName} ziet nooit jouw getal, en jij niet dat van ${partnerName}.`
            : `Je getal blijft privé. Als ${partnerName} ook zin heeft, zie je het hier. Zo niet, dan ziet niemand iets. Ook dat is oké.`}
        </Private>
      )}

      {incoming.map(v => (
        <View key={v.id} style={[nightStyles.card, { backgroundColor: night.cardHi }]}>
          <T kind="tag">Een vonk voor jou</T>
          <T kind="h2">{partnerName} denkt aan je.</T>
          {v.reply ? (
            <T kind="small">Jij zei: {vonkReplies.find(r => r.id === v.reply)?.label}</T>
          ) : (
            <>
              {vonkReplies.map(r => (
                <Btn key={r.id} ghost title={r.label} onPress={() => post(actions.adVonkReply(v.id, r.id))} />
              ))}
              <T kind="small">Kies wat voor jou goed voelt.</T>
            </>
          )}
        </View>
      ))}

      {sent ? (
        <T kind="small" style={{ color: sent.reply ? night.gold : night.muted }}>
          {sent.reply ? `${partnerName} ${vonkReplies.find(r => r.id === sent.reply)?.seen}` : `Vonk verstuurd. ${partnerName} ziet hem nu.`}
        </T>
      ) : (
        <Btn icon="spark" title={`Stuur ${partnerName} een vonk`} onPress={() => post(actions.adVonk())} />
      )}

      {!compact && (
        <T kind="small">Een vonk zegt: ik denk aan je. Ja, later of liever een knuffel zijn allemaal goed.</T>
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

const styles = StyleSheet.create({
  levels: { flexDirection: 'row', gap: 7 },
  level: { flex: 1, minHeight: 64, borderRadius: radius.sm, borderWidth: 1, borderColor: night.control, backgroundColor: night.bg, alignItems: 'center', justifyContent: 'center', gap: 5 },
  levelOn: { backgroundColor: night.rose, borderColor: night.rose },
  levelText: { fontFamily: fonts.bold, fontSize: 12 },
  match: { backgroundColor: night.cardHi, borderWidth: 1, borderColor: night.control, borderRadius: radius.md, padding: 18, gap: 8 },
});
