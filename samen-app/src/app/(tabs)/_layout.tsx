import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { useReminders } from '@/lib/reminder';
import { colors, fonts } from '@/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, focused }: { color: string | unknown; focused: boolean }) => (
    <View style={{ width: 52, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? colors.pink : 'transparent' }}>
      <Icon name={icon} color={String(color)} size={21} />
    </View>
  ),
});

export default function TabLayout() {
  useReminders();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.plum,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.line },
        sceneStyle: { backgroundColor: colors.cream },
      }}>
      <Tabs.Screen name="vandaag" options={tab('Vandaag', 'home')} />
      <Tabs.Screen name="kaarten" options={tab('Kaarten', 'cards')} />
      <Tabs.Screen name="spelen" options={tab('Spelen', 'game')} />
      <Tabs.Screen name="kompas" options={tab('Kompas', 'compass')} />
      <Tabs.Screen name="prestaties" options={tab('Stickers', 'stickers')} />
      {/* The isometric house is parked for now; see FOCUS.md. */}
      <Tabs.Screen name="thuis" options={{ href: null }} />
    </Tabs>
  );
}
