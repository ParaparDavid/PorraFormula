import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { colors } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={icon} color={color} size={size} />,
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={tab('Inicio', 'speedometer-outline')} />
      <Tabs.Screen name="carreras" options={tab('Carreras', 'flag-outline')} />
      <Tabs.Screen name="pilotos" options={tab('Pilotos', 'person-outline')} />
      <Tabs.Screen name="clasificacion" options={tab('Clasificación', 'trophy-outline')} />
      <Tabs.Screen name="grupo" options={tab('Grupo', 'people-outline')} />
    </Tabs>
  );
}
