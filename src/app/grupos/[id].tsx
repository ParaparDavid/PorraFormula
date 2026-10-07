import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Share, Text, View } from 'react-native';
import { Button, Card, Screen, text } from '../../components/ui';
import { RulesList } from '../../components/RulesList';
import { getGroup, leaveGroup, listMembers, type GroupInfo, type Member } from '../../data/groups';
import { useAuth } from '../../firebase/AuthContext';
import { colors } from '../../theme';

export default function GrupoDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    Promise.all([getGroup(id), listMembers(id)])
      .then(([g, m]) => {
        if (!alive) return;
        setGroup(g);
        setMembers(m);
        setState(g ? 'ok' : 'error');
      })
      .catch(() => alive && setState('error'));
    return () => {
      alive = false;
    };
  }, [id]);

  if (state === 'loading') return <Screen><ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /></Screen>;
  if (state === 'error' || !group) return <Screen title="No se pudo abrir el grupo" subtitle="Puede que ya no exista o que no seas miembro." />;

  const isOwner = user?.uid === group.ownerId;
  const share = () =>
    Share.share({ message: `Únete a mi grupo "${group.name}" en La Porra de la Fórmula con este código: ${group.inviteCode}` });
  const leave = () =>
    Alert.alert('Salir del grupo', `¿Seguro que quieres salir de "${group.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          try {
            await leaveGroup(user.uid, group.id);
            router.replace('/(tabs)/grupo');
          } catch {
            Alert.alert('No se pudo salir', 'Inténtalo de nuevo.');
          }
        },
      },
    ]);

  return (
    <Screen>
      <Stack.Screen options={{ title: group.name }} />
      <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '800' }}>{group.name}</Text>

      <Text style={[text.muted, { marginTop: 20 }]}>CÓDIGO DE INVITACIÓN</Text>
      <Card style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Text selectable style={{ color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: 4 }}>{group.inviteCode}</Text>
        <Button label="Compartir código" onPress={share} />
      </Card>

      <Text style={[text.muted, { marginTop: 20 }]}>MIEMBROS ({members.length})</Text>
      {members.map((m) => (
        <Card key={m.uid}>
          <View style={{ flex: 1 }}>
            <Text style={text.body}>{m.displayName}</Text>
            <Text style={text.muted}>{m.uid === group.ownerId ? 'Creador' : m.role === 'admin' ? 'Administrador' : 'Miembro'}</Text>
          </View>
        </Card>
      ))}

      <Text style={[text.muted, { marginTop: 20 }]}>REGLAS</Text>
      <RulesList rules={group.rules ?? []} />

      {!isOwner ? <Button variant="ghost" label="Salir del grupo" onPress={leave} /> : null}
    </Screen>
  );
}
