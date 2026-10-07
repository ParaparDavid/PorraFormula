import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { signInWithGoogle } from '../firebase/auth';
import { useAuth } from '../firebase/AuthContext';
import { colors, spacing } from '../theme';
import { Button } from './ui';

const MESSAGES = {
  unavailable: 'El acceso con Google no funciona en Expo Go. Usa la app de desarrollo (build de EAS).',
  'not-configured': 'Falta configurar el ID de cliente web de Google en src/firebase/config.ts.',
} as const;

export function LoginScreen() {
  const { enterAsGuest } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      const r = await signInWithGoogle();
      if (r === 'unavailable' || r === 'not-configured') setError(MESSAGES[r]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: spacing.lg }}>
      <Text style={{ color: colors.accent, fontSize: 34, fontWeight: '800' }}>La Porra de la Fórmula</Text>
      <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>
        Crea tu grupo, haz tus predicciones y compite con tus amigos.
      </Text>
      {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.lg }} /> : <Button label="Entrar con Google" onPress={onGoogle} />}
      {error ? <Text style={{ color: colors.bad, marginTop: spacing.md }}>{error}</Text> : null}
      {__DEV__ ? <Button variant="ghost" label="Seguir sin cuenta (solo pruebas)" onPress={enterAsGuest} /> : null}
    </View>
  );
}
