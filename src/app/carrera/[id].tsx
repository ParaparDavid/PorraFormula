import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Button, Card, Screen, text } from '../../components/ui';
import { closeLabel, isOpen } from '../../data/deadlines';
import { daysUntil, formatDate, raceById } from '../../data/f1';
import { hasPick, usePicksVersion } from '../../data/picksStore';
import { colors } from '../../theme';

export default function CarreraDetalle() {
  usePicksVersion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const race = raceById(id);
  if (!race) return <Screen title="Carrera no encontrada" />;
  const d = daysUntil(race.date);
  const open = isOpen(race.date);
  const done = hasPick(race.id);
  const go = () => router.push({ pathname: '/prediccion/[id]', params: { id: race.id } });
  return (
    <Screen>
      <Stack.Screen options={{ title: race.name }} />
      <Text style={{ color: colors.accent, fontSize: 30, fontWeight: '800' }}>{race.name}</Text>
      <Text style={text.muted}>{formatDate(race.date)}</Text>
      <Card style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Text style={text.h2}>Tu predicción</Text>
        <Text style={[{ marginTop: 4, color: open ? colors.textMuted : colors.bad }]}>
          {open ? `Abierta hasta el ${closeLabel(race.date)} (hora de España)` : 'Cerrada'}
        </Text>
        <Text style={[text.muted, { marginTop: 2 }]}>{done ? 'Ya la has rellenado.' : 'Aún no la has rellenado.'}</Text>
      </Card>
      {open ? <Button label={done ? 'Editar predicción' : 'Hacer predicción'} onPress={go} /> : done ? <Button variant="ghost" label="Ver mi predicción" onPress={go} /> : null}
      <Card style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Text style={text.h2}>Resultados</Text>
        <Text style={[text.muted, { marginTop: 4 }]}>
          {d >= 0 ? 'Disponibles cuando termine la carrera.' : 'Aún no cargados: llegarán con la conexión a los datos de F1.'}
        </Text>
      </Card>
    </Screen>
  );
}
