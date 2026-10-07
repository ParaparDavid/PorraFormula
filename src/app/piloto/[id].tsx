import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { DriverAvatar, TeamBadge } from '../../components/Avatar';
import { Card, Screen, text } from '../../components/ui';
import { driverById, driversOfTeam, teamColor, teamName } from '../../data/f1';

export default function PilotoDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = driverById(id);
  if (!d) return <Screen title="Piloto no encontrado" />;
  const color = teamColor(d.team);
  const mates = driversOfTeam(d.team).filter((x) => x.id !== d.id);
  return (
    <Screen>
      <Stack.Screen options={{ title: d.id }} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ marginRight: 16 }}>
          <DriverAvatar id={d.id} size={84} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>{d.name}</Text>
          <Text style={{ color, fontWeight: '700' }}>{teamName(d.team)}</Text>
        </View>
        <TeamBadge id={d.team} size={44} />
      </View>
      <Card style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Text style={text.h2}>Estadísticas</Text>
        <Text style={[text.muted, { marginTop: 4 }]}>Puntos, victorias, poles y forma reciente llegarán con la conexión a los datos de F1.</Text>
      </Card>
      {mates.map((m) => (
        <Card key={m.id} onPress={() => router.push({ pathname: '/piloto/[id]', params: { id: m.id } })}>
          <View style={{ marginRight: 14 }}>
            <DriverAvatar id={m.id} size={40} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={text.muted}>Compañero</Text>
            <Text style={text.body}>{m.name}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
