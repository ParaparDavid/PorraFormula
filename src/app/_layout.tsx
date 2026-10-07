import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="carrera/[id]" options={{ title: 'Carrera' }} />
        <Stack.Screen name="piloto/[id]" options={{ title: 'Piloto' }} />
        <Stack.Screen name="prediccion/[id]" options={{ title: 'Tu predicción' }} />
      </Stack>
    </>
  );
}
