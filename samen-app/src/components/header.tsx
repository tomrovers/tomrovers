import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { colors } from '@/theme';

import { Icon } from './icon';
import { Eyebrow, H1, Row } from './ui';

/** Title block with a back button for screens outside the tab bar. */
export function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <Row>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/thuis'))}
          accessibilityRole="button"
          accessibilityLabel="Terug"
          hitSlop={12}>
          <Icon name="back" color={colors.plum} size={26} />
        </Pressable>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Row>
      <H1>{title}</H1>
    </>
  );
}
