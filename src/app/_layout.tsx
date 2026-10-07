import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from '../components/LoginScreen';
import { AuthProvider, useAuth } from '../firebase/AuthContext';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { user, guest, loading } = useAuth();
  if (loading) return null;
  if (!user && !guest) return <LoginScreen />;
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
        <Stack.Screen name="grupos/nuevo" options={{ title: 'Nuevo grupo' }} />
        <Stack.Screen name="grupos/unirse" options={{ title: 'Unirme' }} />
        <Stack.Screen name="grupos/[id]" options={{ title: 'Grupo' }} />
      </Stack>
    </>
  );
}
