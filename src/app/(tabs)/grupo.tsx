import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button, Card, Screen, text } from '../../components/ui';
import { listMyGroups, type Membership } from '../../data/groups';
import { signOut } from '../../firebase/auth';
import { useAuth } from '../../firebase/AuthContext';
import { colors } from '../../theme';

export default function Grupos() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Membership[] | null>(null);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let alive = true;
      listMyGroups(user.uid)
        .then((g) => alive && (setGroups(g), setError('')))
        .catch(() => alive && setError('No se pudieron cargar tus grupos. Comprueba la conexión.'));
      return () => {
        alive = false;
      };
    }, [user]),
  );

  if (!user) {
    return (
      <Screen title="Grupos" subtitle="Necesitas una cuenta para crear o unirte a un grupo.">
        <Card><Text style={text.muted}>Estás en modo de pruebas sin cuenta.</Text></Card>
      </Screen>
    );
  }

  return (
    <Screen title="Grupos" subtitle={user.displayName ?? user.email ?? ''}>
      {groups === null && !error ? <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} /> : null}
      {error ? <Text style={{ color: colors.bad, marginTop: 12 }}>{error}</Text> : null}
      {groups?.length === 0 ? (
        <Card style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Text style={text.h2}>Aún no estás en ningún grupo</Text>
          <Text style={[text.muted, { marginTop: 4 }]}>Crea uno o únete con el código que te pase un amigo.</Text>
        </Card>
      ) : null}
      {groups?.map((g) => (
        <Card key={g.groupId} onPress={() => router.push({ pathname: '/grupos/[id]', params: { id: g.groupId } })}>
          <View style={{ flex: 1 }}>
            <Text style={text.body}>{g.name}</Text>
            <Text style={text.muted}>{g.role === 'admin' ? 'Administrador' : 'Miembro'}</Text>
          </View>
        </Card>
      ))}
      <Button label="Crear un grupo" onPress={() => router.push('/grupos/nuevo')} />
      <Button variant="ghost" label="Unirme con un código" onPress={() => router.push('/grupos/unirse')} />
      <Button variant="ghost" label="Cerrar sesión" onPress={() => signOut()} />
    </Screen>
  );
}
