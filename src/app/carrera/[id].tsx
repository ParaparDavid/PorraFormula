import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Button, Card, Screen, text } from '../../components/ui';
import { daysUntil, formatDate, raceById } from '../../data/f1';
import { colors } from '../../theme';

export default function CarreraDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const race = raceById(id);
  if (!race) return <Screen title="Carrera no encontrada" />;
  const d = daysUntil(race.date);
  return (
    <Screen>
      <Stack.Screen options={{ title: race.name }} />
      <Text style={{ color: colors.accent, fontSize: 30, fontWeight: '800' }}>{race.name}</Text>
      <Text style={text.muted}>{formatDate(race.date)}</Text>
      <Card style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Text style={text.h2}>Resultados</Text>
        <Text style={[text.muted, { marginTop: 4 }]}>
          {d >= 0 ? 'Disponibles cuando termine la carrera.' : 'Aún no cargados: llegarán con la conexión a los datos de F1.'}
        </Text>
      </Card>
      {d >= 0 ? <Button label="Hacer predicción" onPress={() => router.push({ pathname: '/prediccion/[id]', params: { id: race.id } })} /> : null}
    </Screen>
  );
}
