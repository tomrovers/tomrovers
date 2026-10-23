import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { actions } from '@/lib/actions';
import { nameOf } from '@/lib/people';
import { useCouple } from '@/lib/store';
import { colors, fonts } from '@/theme';

// Two players, one phone: the partner plays the top half (rotated), you play the bottom half.
type Phase = 'ready' | 'waiting' | 'go' | 'point' | 'done';
type Player = 0 | 1; // 0 = me (bottom), 1 = partner (top)

const WIN_AT = 3;

const buzz = () => {
  if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export default function Reflex() {
  const { state, post } = useCouple();
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goAt = useRef(0);
  const locked = useRef(false); // only the first tap of a round counts
  const names = [nameOf(state, state.myId), nameOf(state, state.partnerId)];

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const startRound = () => {
    locked.current = false;
    setPhase('waiting');
    setMessage('Wacht op roze…');
    timer.current = setTimeout(() => {
      goAt.current = Date.now();
      setPhase('go');
      setMessage('NU!');
    }, 1500 + Math.random() * 2500);
  };

  const award = async (winner: Player, text: string) => {
    const next: [number, number] = [...score];
    next[winner] += 1;
    setScore(next);
    setMessage(text);
    buzz();
    if (next[winner] >= WIN_AT) {
      setPhase('done');
      await post(actions.reflexResult([state.myId, state.partnerId!], next));
    } else {
      setPhase('point');
    }
  };

  // Tap zones use the raw responder: it fires on touch-down, without Pressable's press delay.
  const tap = (player: Player) => {
    if (locked.current || (phase !== 'waiting' && phase !== 'go')) return;
    locked.current = true;
    if (phase === 'waiting') {
      if (timer.current) clearTimeout(timer.current);
      const other: Player = player === 0 ? 1 : 0;
      void award(other, `${names[player]} was te vroeg! Punt voor ${names[other]}.`);
    } else {
      void award(player, `${names[player]} in ${Date.now() - goAt.current} ms!`);
    }
  };

  const bg = phase === 'go' ? colors.rose : phase === 'waiting' ? colors.lav : colors.cream;
  const winner = score[0] > score[1] ? 0 : 1;

  if (!state.partnerId) {
    return (
      <SafeAreaView style={[styles.fill, styles.center, { padding: 24, gap: 16 }]}>
        <Text style={styles.big}>Koppel eerst met je partner om samen te spelen.</Text>
        <Button title="Terug" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      <View style={[styles.half, styles.flipped]} accessibilityRole="button" onStartShouldSetResponder={() => true} onResponderGrant={() => tap(1)} accessibilityLabel={`Tikvlak van ${names[1]}`}>
        <Text style={styles.name}>{names[1]}</Text>
        <Text style={styles.score}>{score[1]}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.middle}>
        {(phase === 'ready' || phase === 'point') && <Button title={phase === 'ready' ? 'Start' : 'Volgende ronde'} onPress={startRound} />}
        {phase === 'done' && (
          <View style={{ gap: 10, alignItems: 'center' }}>
            <Text style={styles.big}>🏆 {names[winner]} wint!</Text>
            <Button title="Naar de beloningenpot" onPress={() => router.replace('/beloningen')} />
            <Button title="Klaar" variant="ghost" onPress={() => router.back()} />
          </View>
        )}
        {phase === 'ready' && <Button title="Stoppen" variant="ghost" onPress={() => router.back()} />}
      </View>

      <View style={styles.half} accessibilityRole="button" onStartShouldSetResponder={() => true} onResponderGrant={() => tap(0)} accessibilityLabel={`Tikvlak van ${names[0]}`}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.score}>{score[0]}</Text>
        <Text style={styles.name}>{names[0]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  half: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  flipped: { transform: [{ rotate: '180deg' }] },
  middle: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center', minHeight: 70, gap: 6 },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.ink },
  score: { fontFamily: fonts.black, fontSize: 64, color: colors.plum },
  message: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, textAlign: 'center', paddingHorizontal: 24, minHeight: 22 },
  big: { fontFamily: fonts.black, fontSize: 24, color: colors.ink, textAlign: 'center' },
});
