import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { HouseScene, type Spot } from '@/components/house/scene';
import { ItemIcon } from '@/components/house/sprites';
import { Icon } from '@/components/icon';
import { Body, Button, Card, Eyebrow, Field, H1, H2, Progress, Row, Screen, Small, Strong } from '@/components/ui';
import { actions } from '@/lib/actions';
import { complimentIdeas, gestures, moods, needs } from '@/lib/content';
import { actionLabels, kindById, rooms, type ItemAction, type RoomId } from '@/lib/house/catalog';
import { blockedTiles, freeTile, ownedKinds, placeNew, roomItems, unlockedRooms, type PlacedItem } from '@/lib/house/layout';
import { expressions, nameOf } from '@/lib/people';
import { daySuggestion, loveLanguageTip, XP_PER_LEVEL } from '@/lib/state';
import { useCouple } from '@/lib/store';
import type { GestureKind } from '@/lib/types';
import { colors, fonts, radius, space } from '@/theme';

const moodLabel = (id: string) => moods.find(m => m.id === id);
const needLabel = (id: string) => needs.find(n => n.id === id)?.label.toLowerCase();

const routes: Record<ItemAction, Href> = {
  checkin: '/checkin',
  kaarten: '/kaarten',
  spelen: '/spelen',
  kompas: '/kompas',
  avatar: '/avatar',
  prestaties: '/prestaties',
  beloningen: '/beloningen',
};

export default function Thuis() {
  const { state, session, mode, post, house, saveHouse, partnerPresence, setPresence } = useCouple();
  const partnerName = nameOf(state, state.partnerId);
  const face = expressions(state);
  const hasPartner = !!state.partnerId;

  const open = unlockedRooms(state.level);
  const [roomId, setRoomId] = useState<RoomId>('woonkamer');
  const room = rooms.find(r => r.id === roomId)!;
  const items = roomItems(house, roomId);

  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [gestureOpen, setGestureOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [hearts, setHearts] = useState({ me: 0, partner: 0 });

  // Where my figure stands, per room.
  const [spots, setSpots] = useState<Partial<Record<RoomId, Spot>>>({});
  const mySpot = useMemo<Spot>(() => {
    const saved = spots[roomId];
    if (saved) return saved;
    const [gx, gy] = freeTile(blockedTiles(items), []);
    return { gx, gy, seat: false };
    // Pick a start spot once per room, not on every layout change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, spots]);

  useEffect(() => {
    setPresence({ room: roomId, gx: mySpot.gx, gy: mySpot.gy, seat: mySpot.seat });
  }, [roomId, mySpot, setPresence]);

  // A heart floats over my figure when my partner sends something sweet.
  const latestFromPartner = state.gestures.find(g => g.from === state.partnerId);
  const seenGesture = useRef<string | null>(null);
  useEffect(() => {
    if (!latestFromPartner || seenGesture.current === latestFromPartner.id) return;
    const fresh = seenGesture.current !== null || Date.now() - Date.parse(latestFromPartner.at) < 15000;
    seenGesture.current = latestFromPartner.id;
    if (fresh) setHearts(h => ({ ...h, me: h.me + 1 }));
  }, [latestFromPartner]);

  // Inventory: owned items for this room that are not standing anywhere yet.
  const owned = ownedKinds(state.level, state.items);
  const placed = new Set(open.flatMap(r => roomItems(house, r.id).map(it => it.kind)));
  const inventory = owned.filter(k => !placed.has(k.id));
  const forThisRoom = inventory.filter(k => k.rooms.includes(roomId));

  const changeItems = (next: PlacedItem[]) => {
    void saveHouse({ ...house?.rooms, [roomId]: next });
  };

  const addItem = (kind: string) => {
    const it = placeNew(kind, items);
    if (!it) {
      setSent('Er is geen vrije plek meer in deze kamer. Berg eerst iets op.');
      return;
    }
    changeItems([...items, it]);
    setSelected(kind);
  };

  const sel = items.find(it => it.kind === selected);
  const rotate = () => {
    if (!sel || sel.wall) return;
    const next = { ...sel, rot: (sel.rot ? 0 : 1) as 0 | 1 };
    changeItems(items.map(it => (it.kind === sel.kind ? next : it)));
  };
  const store = () => {
    if (!sel) return;
    changeItems(items.filter(it => it.kind !== sel.kind));
    setSelected(null);
  };

  const send = async (kind: GestureKind, text?: string) => {
    await post(actions.gesture(kind, text));
    setHearts(h => ({ ...h, partner: h.partner + 1 }));
    setSent(`${gestures.find(g => g.id === kind)?.emoji} Verstuurd naar ${partnerName}`);
    setMessage(null);
    setGestureOpen(false);
    setTimeout(() => setSent(null), 2500);
  };

  const partnerHere = partnerPresence?.room === roomId;
  const partnerSpot: Spot | null = partnerHere ? { gx: partnerPresence.gx, gy: partnerPresence.gy, seat: partnerPresence.seat } : null;
  const partnerWhere = partnerPresence && !partnerHere ? rooms.find(r => r.id === partnerPresence.room)?.name.toLowerCase() : null;
  const nextRoom = rooms.find(r => r.level > state.level);

  // Objects with something waiting get a bubble: the game leads you to the serious parts.
  const waitingCards = Object.values(state.cards).some(c => c.partnerDone && !c.mine);
  const badges: Partial<Record<string, string>> = {
    kalender: !state.today.mine ? '!' : undefined,
    salontafel: waitingCards ? '!' : undefined,
    arcade: state.kjm.partnerDone && !state.kjm.mine ? '!' : undefined,
    cadeautafel: state.openWins.some(w => w.winnerId === state.myId) ? '🎁' : undefined,
  };

  const owed = state.claims.filter(c => c.winnerId !== state.myId && !c.redeemed);
  const myOpenWins = state.openWins.filter(w => w.winnerId === state.myId);
  const { mine, partner, partnerDone } = state.today;

  return (
    <Screen scrollEnabled={!editing}>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Eyebrow>Level {state.level} · ons huisje</Eyebrow>
          <H1>{hasPartner ? `${state.me?.name ?? 'Jij'} & ${partnerName}` : 'Jullie huisje'}</H1>
        </View>
        <Pressable onPress={() => router.push('/instellingen')} accessibilityLabel="Instellingen" hitSlop={12}>
          <Icon name="settings" color={colors.plum} size={26} />
        </Pressable>
      </Row>

      {!hasPartner && session.code && (
        <Card tone="peach">
          <H2>Nodig je partner uit</H2>
          <Body>Je partner installeert Samen en vult deze code in:</Body>
          <Text style={styles.code} selectable>
            {session.code}
          </Text>
          <Button title="Deel de code" variant="secondary" onPress={() => Share.share({ message: `Kom je bij mij in Samen? Onze koppelcode is ${session.code}` })} />
        </Card>
      )}
      {!hasPartner && mode === 'shared' && (
        <Card tone="peach">
          <H2>Nodig je partner uit</H2>
          <Body>Deel deze pagina met je partner via het Share-menu van claude.ai. Kies daar de rol Editor, anders kan je partner niets opslaan.</Body>
        </Card>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rooms}>
        {rooms.map(r => {
          const locked = r.level > state.level;
          const active = r.id === roomId;
          return (
            <Pressable
              key={r.id}
              disabled={locked}
              onPress={() => {
                setRoomId(r.id);
                setSelected(null);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: locked }}
              style={[styles.roomChip, active && styles.roomChipOn, locked && styles.roomChipLocked]}>
              <Text style={[styles.roomText, active && { color: colors.white }]}>{locked ? `🔒 ${r.name} · level ${r.level}` : r.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.stage, { backgroundColor: room.wall ? '#F7E3EA' : '#DDEFF7' }]}>
        <HouseScene
          room={room}
          items={items}
          editing={editing}
          selected={selected}
          onSelect={setSelected}
          onItemsChange={changeItems}
          me={{ avatar: state.me?.avatar ?? { skin: 1, hair: 0, hairColor: 1, facialHair: 0, outfit: 0, accessory: 0 }, expression: face.me, name: state.me?.name ?? 'Jij' }}
          myStart={mySpot}
          onMyMove={s => setSpots(prev => ({ ...prev, [roomId]: s }))}
          partner={state.partner ? { avatar: state.partner.avatar, expression: face.partner, name: partnerName, spot: partnerSpot } : undefined}
          onPartnerTap={() => setGestureOpen(true)}
          onAction={a => router.push(routes[a])}
          hearts={hearts}
          badges={badges}
        />
        <View style={styles.badges} pointerEvents="none">
          {hasPartner && !partnerHere && (
            <Text style={styles.badge}>{partnerWhere ? `${partnerName} is in de ${partnerWhere}` : `${partnerName} is er nu niet`}</Text>
          )}
        </View>
      </View>

      {!editing ? (
        <>
          <Small style={{ textAlign: 'center' }}>
            Tik op de vloer om te lopen. Tik op {hasPartner ? partnerName : 'je partner'} voor een knuffel, of op de kalender, de kaarten op tafel, het prikbord of de arcadekast.
          </Small>
          <Row>
            <Button title={forThisRoom.length ? `Inrichten (${forThisRoom.length})` : 'Inrichten'} variant="secondary" style={{ flex: 1 }} onPress={() => setEditing(true)} />
            {hasPartner && <Button title="💌 Iets liefs" variant="secondary" style={{ flex: 1 }} onPress={() => setGestureOpen(o => !o)} />}
          </Row>
        </>
      ) : (
        <Card tone="white">
          <Row style={{ justifyContent: 'space-between' }}>
            <H2>{sel ? kindById.get(sel.kind)?.name : 'Inrichten'}</H2>
            <Button title="Klaar" onPress={() => { setEditing(false); setSelected(null); }} style={{ minHeight: 40, paddingHorizontal: space.lg }} />
          </Row>
          {sel ? (
            <Row>
              {!sel.wall && <Button title="↻ Draaien" variant="secondary" style={{ flex: 1 }} onPress={rotate} />}
              <Button title="Opbergen" variant="secondary" style={{ flex: 1 }} onPress={store} />
            </Row>
          ) : (
            <Small>Sleep een meubel naar een nieuwe plek, of tik erop om het te draaien of op te bergen.</Small>
          )}
          {kindById.get(sel?.kind ?? '')?.action && <Small>Tik hier straks op om {actionLabels[kindById.get(sel!.kind)!.action!].toLowerCase()} te openen.</Small>}
          <Strong>In de opslag</Strong>
          {forThisRoom.length === 0 ? (
            <Small>
              Niets meer op te zetten in deze kamer. Nieuwe meubels krijg je met prestaties{nextRoom ? ` en op level ${nextRoom.level} komt de ${nextRoom.name.toLowerCase()} erbij` : ''}.
            </Small>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
              {forThisRoom.map(k => (
                <Pressable key={k.id} onPress={() => addItem(k.id)} style={styles.slot} accessibilityRole="button" accessibilityLabel={`${k.name} neerzetten`}>
                  <ItemIcon kind={k.id} size={54} />
                  <Text style={styles.slotText} numberOfLines={2}>
                    {k.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Card>
      )}

      {gestureOpen && hasPartner && (
        <Card tone="lav">
          <H2>Stuur {partnerName} iets liefs</H2>
          <View style={styles.gestures}>
            {gestures.map(g => (
              <Pressable
                key={g.id}
                style={({ pressed }) => [styles.gesture, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                onPress={() =>
                  g.id === 'bericht' ? setMessage('') : send(g.id, g.id === 'compliment' ? complimentIdeas[Math.floor(Math.random() * complimentIdeas.length)] : undefined)
                }>
                <Text style={styles.gestureEmoji}>{g.emoji}</Text>
                <Text style={styles.gestureLabel}>{g.label}</Text>
              </Pressable>
            ))}
          </View>
          {message !== null && (
            <>
              <Field value={message} onChangeText={setMessage} placeholder={`Een lief bericht voor ${partnerName}`} maxLength={200} multiline />
              <Button title="Versturen" onPress={() => send('bericht', message.trim())} disabled={!message.trim()} />
            </>
          )}
        </Card>
      )}
      {sent && <Small style={{ color: colors.success, textAlign: 'center' }}>{sent}</Small>}
      {latestFromPartner && (
        <Small style={{ textAlign: 'center' }}>
          Laatst van {partnerName}: {gestures.find(g => g.id === latestFromPartner.kind)?.emoji}{' '}
          {latestFromPartner.text ?? gestures.find(g => g.id === latestFromPartner.kind)?.sent}
        </Small>
      )}

      {myOpenWins.length > 0 && (
        <Card tone="mint" onPress={() => router.push('/beloningen')}>
          <H2>🏆 Je hebt gewonnen!</H2>
          <Body>Kies je beloning uit de beloningenpot.</Body>
        </Card>
      )}
      {owed.map(c => (
        <Card key={c.id} tone="lav" onPress={() => router.push('/beloningen')}>
          <Small>{partnerName} heeft gewonnen en koos:</Small>
          <Strong>{c.rewardTitle}</Strong>
        </Card>
      ))}

      <Card tone="white">
        <Eyebrow>Vandaag samen</Eyebrow>
        {!mine && (
          <>
            <H2>Hoe voel jij je vandaag?</H2>
            <Small>Een korte check-in. {partnerName} ziet jouw antwoord pas als jullie allebei hebben ingevuld.</Small>
            <Button title="Check in" onPress={() => router.push('/checkin')} />
          </>
        )}
        {mine && !partner && (
          <>
            <H2>
              Jij: {moodLabel(mine.mood)?.emoji} {moodLabel(mine.mood)?.label}
            </H2>
            <Small>{partnerDone ? 'Bijna klaar…' : `Wachten op de check-in van ${partnerName}.`}</Small>
          </>
        )}
        {mine && partner && (
          <>
            <Body>
              <Strong>Jij:</Strong> {moodLabel(mine.mood)?.emoji} {moodLabel(mine.mood)?.label.toLowerCase()}, zin in {needLabel(mine.need)}.
            </Body>
            <Body>
              <Strong>{partnerName}:</Strong> {moodLabel(partner.mood)?.emoji} {moodLabel(partner.mood)?.label.toLowerCase()}, zin in {needLabel(partner.need)}.
            </Body>
            {partner.note ? <Body style={{ fontStyle: 'italic' }}>“{partner.note}”</Body> : null}
            <Card tone="pink">
              <Strong>{daySuggestion(mine, partner, partnerName)}</Strong>
              {loveLanguageTip(state.loveLang.partner) && <Small>Kompas-tip: {loveLanguageTip(state.loveLang.partner)}</Small>}
            </Card>
          </>
        )}
      </Card>

      <Card tone="pink">
        <Row style={{ justifyContent: 'space-between' }}>
          <Strong>Verbondenheid · level {state.level}</Strong>
          <Small>
            {Math.round(state.levelProgress * XP_PER_LEVEL)}/{XP_PER_LEVEL} XP
          </Small>
        </Row>
        <Progress value={state.levelProgress} />
        <Small>
          {nextRoom
            ? `Op level ${nextRoom.level} gaat de ${nextRoom.name.toLowerCase()} open. Elke check-in, elk gesprek en elk spel helpt.`
            : 'Alle kamers zijn open. Prestaties leveren nog steeds nieuwe meubels op.'}
        </Small>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  code: { fontFamily: fonts.black, fontSize: 34, letterSpacing: 6, color: colors.plum, textAlign: 'center', paddingVertical: space.sm },
  rooms: { gap: space.sm, paddingVertical: 2 },
  roomChip: { borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  roomChipOn: { backgroundColor: colors.plum, borderColor: colors.plum },
  roomChipLocked: { opacity: 0.55 },
  roomText: { fontFamily: fonts.bold, fontSize: 13, color: colors.plum },
  stage: { borderRadius: radius.lg, overflow: 'hidden', paddingTop: space.sm },
  badges: { position: 'absolute', top: space.sm, left: space.sm, right: space.sm, alignItems: 'flex-start' },
  badge: { fontFamily: fonts.bold, fontSize: 12, color: colors.plum, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10, overflow: 'hidden' },
  slot: { width: 76, alignItems: 'center', gap: 4, backgroundColor: colors.cream, borderRadius: radius.md, padding: 6, borderWidth: 1, borderColor: colors.line },
  slotText: { fontFamily: fonts.bold, fontSize: 10, color: colors.plum, textAlign: 'center' },
  gestures: { flexDirection: 'row', gap: space.sm },
  gesture: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: space.md, alignItems: 'center', gap: 4 },
  gestureEmoji: { fontSize: 24 },
  gestureLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.plum, textAlign: 'center' },
});
