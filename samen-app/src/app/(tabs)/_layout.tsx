import { Tabs } from 'expo-router/js-tabs';

import { Icon, type IconName } from '@/components/icon';
import { useReminders } from '@/lib/reminder';
import { colors, fonts } from '@/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: string | unknown }) => <Icon name={icon} color={String(color)} size={24} />,
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
      <Tabs.Screen name="prestaties" options={tab('Stickers', 'trophy')} />
      {/* The isometric house is parked for now; see FOCUS.md. */}
      <Tabs.Screen name="thuis" options={{ href: null }} />
    </Tabs>
  );
}
