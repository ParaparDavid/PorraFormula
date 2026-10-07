import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { Button, Field, Screen, text } from '../../components/ui';
import { GroupError, joinGroup } from '../../data/groups';
import { useAuth } from '../../firebase/AuthContext';
import { colors } from '../../theme';

export default function Unirse() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onJoin = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      const id = await joinGroup(user, code);
      router.replace({ pathname: '/grupos/[id]', params: { id } });
    } catch (e) {
      setError(e instanceof GroupError ? e.message : 'No se pudo entrar. Comprueba la conexión.');
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={text.h2}>Unirme a un grupo</Text>
      <Text style={text.muted}>Pega el código de 6 caracteres que te han pasado.</Text>
      <Field label="Código" value={code} onChangeText={setCode} placeholder="ABC234" autoCapitalize="characters" maxLength={12} />
      {error ? <Text style={{ color: colors.bad, marginTop: 12 }}>{error}</Text> : null}
      {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} /> : <Button label="Unirme" onPress={onJoin} />}
    </Screen>
  );
}
