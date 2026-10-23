import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { HouseItemId } from '@/lib/content';
import type { AvatarConfig, Expression } from '@/lib/types';

import { Avatar } from './avatar';

type Person = { avatar: AvatarConfig; expression: Expression };

const W = 360;
const H = 260;

function Items({ items }: { items: Set<HouseItemId> }) {
  const has = (id: HouseItemId) => items.has(id);
  return (
    <G>
      {has('lichtslinger') && (
        <G>
          <Path d="M0 14 Q45 34 90 14 T180 14 T270 14 T360 14" stroke="#6E2D5C" strokeWidth={1.5} fill="none" />
          {[22, 66, 112, 156, 202, 246, 292, 336].map((x, i) => (
            <Circle key={x} cx={x} cy={i % 2 ? 22 : 24} r={4.5} fill={['#F7C948', '#F59AB0', '#9AD3BC', '#B9A2E6'][i % 4]} />
          ))}
        </G>
      )}
      {has('fotolijst') && (
        <G>
          <Rect x={36} y={44} width={58} height={46} rx={4} fill="#FFF8F0" stroke="#D9A441" strokeWidth={5} />
          <Path d="M65 79c-7-5-12-8-12-13a5.5 5.5 0 0 1 12-2 5.5 5.5 0 0 1 12 2c0 5-5 8-12 13z" fill="#E0558A" />
        </G>
      )}
      {(has('boekenkast') || has('arcadetrofee')) && <Rect x={244} y={50} width={96} height={6} rx={2} fill="#A8705A" />}
      {has('boekenkast') &&
        [0, 1, 2, 3, 4].map(i => (
          <Rect key={i} x={250 + i * 11} y={24 + (i % 2) * 4} width={9} height={26 - (i % 2) * 4} rx={1.5} fill={['#6C8BD6', '#E0558A', '#7FB8A4', '#F2B15C', '#6E2D5C'][i]} />
        ))}
      {has('arcadetrofee') && (
        <G>
          <Path d="M312 26h20v6a10 10 0 0 1-20 0z" fill="#F2C14E" />
          <Rect x={319} y={40} width={6} height={6} fill="#D9A441" />
          <Rect x={314} y={45} width={16} height={5} rx={1} fill="#6E2D5C" />
        </G>
      )}
      {has('kompas-schilderij') && (
        <G>
          <Rect x={258} y={68} width={52} height={40} rx={4} fill="#E5EAFB" stroke="#A8705A" strokeWidth={4} />
          <Circle cx={284} cy={88} r={12} fill="none" stroke="#6E2D5C" strokeWidth={2} />
          <Path d="M290 82l-4 8-8 4 4-8z" fill="#E0558A" />
        </G>
      )}
      {has('plant') && (
        <G>
          <Ellipse cx={30} cy={150} rx={9} ry={20} fill="#5FA77F" transform="rotate(-25 30 150)" />
          <Ellipse cx={40} cy={146} rx={8} ry={22} fill="#7FB8A4" />
          <Ellipse cx={50} cy={152} rx={9} ry={19} fill="#5FA77F" transform="rotate(25 50 152)" />
          <Path d="M24 168h32l-4 26H28z" fill="#D9825B" />
        </G>
      )}
      {has('sfeerlamp') && (
        <G>
          <Circle cx={338} cy={118} r={34} fill="#FFE7A8" opacity={0.45} />
          <Line x1={338} y1={124} x2={338} y2={196} stroke="#6E2D5C" strokeWidth={3} />
          <Path d="M322 124h32l-6-24h-20z" fill="#F7C948" />
          <Rect x={328} y={194} width={20} height={4} rx={2} fill="#6E2D5C" />
        </G>
      )}
      {has('kristallen-bol') && (
        <G>
          <Rect x={292} y={204} width={30} height={6} rx={2} fill="#A8705A" />
          <Rect x={303} y={210} width={8} height={22} fill="#A8705A" />
          <Circle cx={307} cy={192} r={13} fill="#B9A2E6" opacity={0.85} />
          <Circle cx={302} cy={187} r={4} fill="#fff" opacity={0.7} />
        </G>
      )}
    </G>
  );
}

export function House({ items, me, partner }: { items: Set<HouseItemId>; me?: Person; partner?: Person }) {
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FBE8EC" />
            <Stop offset="1" stopColor="#F3CDD7" />
          </LinearGradient>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#B9C9F2" />
            <Stop offset="1" stopColor="#F7C6D4" />
          </LinearGradient>
        </Defs>
        <Rect width={W} height={196} fill="url(#wall)" />
        <Rect y={196} width={W} height={H - 196} fill="#D9A88A" />
        {[60, 130, 200, 270, 340].map(x => (
          <Line key={x} x1={x} y1={196} x2={x - 20} y2={H} stroke="#C99577" strokeWidth={1.5} />
        ))}
        <Rect x={140} y={30} width={80} height={62} rx={8} fill="url(#sky)" stroke="#FFFFFF" strokeWidth={5} />
        <Line x1={180} y1={30} x2={180} y2={92} stroke="#FFFFFF" strokeWidth={4} />
        <Circle cx={200} cy={48} r={7} fill="#FFF3C4" />
        <Ellipse cx={180} cy={236} rx={120} ry={16} fill="#EFB8C8" />
        <Rect x={72} y={118} width={216} height={62} rx={24} fill="#B86A8C" />
        <Items items={items} />
        {items.has('kussens') && (
          <G>
            <Rect x={84} y={136} width={30} height={26} rx={8} fill="#FFD9A8" transform="rotate(-12 99 149)" />
            <Rect x={246} y={136} width={30} height={26} rx={8} fill="#D9C8F2" transform="rotate(12 261 149)" />
          </G>
        )}
      </Svg>
      <View style={styles.people} pointerEvents="none">
        {me && <Avatar config={me.avatar} expression={me.expression} size={92} />}
        {partner && <Avatar config={partner.avatar} expression={partner.expression} size={92} />}
      </View>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Rect x={60} y={170} width={240} height={36} rx={14} fill="#C97A9B" />
        <Rect x={52} y={140} width={30} height={66} rx={14} fill="#B86A8C" />
        <Rect x={278} y={140} width={30} height={66} rx={14} fill="#B86A8C" />
        <Rect x={78} y={204} width={8} height={12} rx={2} fill="#7A4A3A" />
        <Rect x={274} y={204} width={8} height={12} rx={2} fill="#7A4A3A" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: W / H, borderRadius: 22, overflow: 'hidden', backgroundColor: '#FBE8EC' },
  people: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '28%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
});
