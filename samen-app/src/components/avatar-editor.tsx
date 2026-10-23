import { Pressable, StyleSheet, View } from 'react-native';

import type { AvatarConfig } from '@/lib/types';
import { colors, space } from '@/theme';

import { accessories, Avatar, facialHairStyles, hairColors, hairStyles, outfitColors, skinTones } from './avatar';
import { Card, Chip, Chips, Small } from './ui';

function Swatches({ colorsList, value, onChange, label }: { colorsList: string[]; value: number; onChange: (i: number) => void; label: string }) {
  return (
    <View style={{ gap: space.sm }}>
      <Small>{label}</Small>
      <View style={styles.swatches}>
        {colorsList.map((c, i) => (
          <Pressable
            key={c}
            onPress={() => onChange(i)}
            accessibilityRole="button"
            accessibilityLabel={`${label} ${i + 1}`}
            accessibilityState={{ selected: value === i }}
            style={[styles.swatch, { backgroundColor: c }, value === i && styles.swatchSelected]}
          />
        ))}
      </View>
    </View>
  );
}

function Options({ options, value, onChange, label }: { options: string[]; value: number; onChange: (i: number) => void; label: string }) {
  return (
    <View style={{ gap: space.sm }}>
      <Small>{label}</Small>
      <Chips>
        {options.map((o, i) => (
          <Chip key={o} label={o} selected={value === i} onPress={() => onChange(i)} />
        ))}
      </Chips>
    </View>
  );
}

export function AvatarEditor({ value, onChange }: { value: AvatarConfig; onChange: (v: AvatarConfig) => void }) {
  const set = (key: keyof AvatarConfig) => (i: number) => onChange({ ...value, [key]: i });
  return (
    <View style={{ gap: space.md }}>
      <Card tone="pink" style={{ alignItems: 'center' }}>
        <Avatar config={value} size={130} expression="happy" />
      </Card>
      <Card tone="white" style={{ gap: space.lg }}>
        <Swatches label="Huidskleur" colorsList={skinTones} value={value.skin} onChange={set('skin')} />
        <Options label="Kapsel" options={hairStyles} value={value.hair} onChange={set('hair')} />
        <Swatches label="Haarkleur" colorsList={hairColors} value={value.hairColor} onChange={set('hairColor')} />
        <Options label="Gezichtshaar" options={facialHairStyles} value={value.facialHair} onChange={set('facialHair')} />
        <Swatches label="Outfit" colorsList={outfitColors} value={value.outfit} onChange={set('outfit')} />
        <Options label="Accessoire" options={accessories} value={value.accessory} onChange={set('accessory')} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: colors.white },
  swatchSelected: { borderColor: colors.plum },
});
