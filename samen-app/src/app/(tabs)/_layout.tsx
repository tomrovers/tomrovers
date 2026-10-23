import { Tabs } from 'expo-router/js-tabs';

import { Icon, type IconName } from '@/components/icon';
import { colors, fonts } from '@/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: string | unknown }) => <Icon name={icon} color={String(color)} size={24} />,
});

export default function TabLayout() {
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
      <Tabs.Screen name="thuis" options={tab('Thuis', 'home')} />
      <Tabs.Screen name="kaarten" options={tab('Kaarten', 'cards')} />
      <Tabs.Screen name="spelen" options={tab('Spelen', 'game')} />
      <Tabs.Screen name="kompas" options={tab('Kompas', 'compass')} />
      <Tabs.Screen name="huisje" options={tab('Huisje', 'sofa')} />
    </Tabs>
  );
}
