import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Card, ColorBar, Screen, text } from '../../components/ui';
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
        <ColorBar color={color} />
        <View>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>{d.name}</Text>
          <Text style={{ color, fontWeight: '700' }}>{teamName(d.team)}</Text>
        </View>
      </View>
      <Card style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Text style={text.h2}>Estadísticas</Text>
        <Text style={[text.muted, { marginTop: 4 }]}>Puntos, victorias, poles y forma reciente llegarán con la conexión a los datos de F1.</Text>
      </Card>
      {mates.map((m) => (
        <Card key={m.id} onPress={() => router.push({ pathname: '/piloto/[id]', params: { id: m.id } })}>
          <View style={{ flex: 1 }}>
            <Text style={text.muted}>Compañero</Text>
            <Text style={text.body}>{m.name}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
