import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { StoreProvider, useStore } from '@/lib/store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

function Navigator() {
  const { status } = useStore();
  const ready = status === 'ready';
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!ready}>
        <Stack.Screen name="welkom" />
        <Stack.Screen name="koppelen" />
      </Stack.Protected>
      <Stack.Protected guard={ready}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="kaart/[id]" />
        <Stack.Screen name="spel/reflex" options={{ gestureEnabled: false }} />
        <Stack.Screen name="spel/kenjemij" />
        <Stack.Screen name="beloningen" />
        <Stack.Screen name="avatar" />
        <Stack.Screen name="instellingen" />
        <Stack.Screen name="afterdark" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lato: require('@/assets/fonts/Lato-Regular.ttf'),
    'Lato-Bold': require('@/assets/fonts/Lato-Bold.ttf'),
    'Lato-Black': require('@/assets/fonts/Lato-Black.ttf'),
  });
  const done = fontsLoaded || !!fontError;

  useEffect(() => {
    if (done) SplashScreen.hideAsync();
  }, [done]);

  if (!done) return null;
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Navigator />
    </StoreProvider>
  );
}
