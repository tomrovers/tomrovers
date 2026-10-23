import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useStore } from '@/lib/store';
import { colors } from '@/theme';

export default function Index() {
  const { status } = useStore();
  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.plum} />
      </View>
    );
  }
  if (status === 'needs-profile') return <Redirect href="/welkom" />;
  if (status === 'needs-couple') return <Redirect href="/koppelen" />;
  return <Redirect href="/thuis" />;
}
