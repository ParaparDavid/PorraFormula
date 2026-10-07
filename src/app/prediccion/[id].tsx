import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { OptionPicker } from '../../components/OptionPicker';
import { Button, Screen, text } from '../../components/ui';
import { DRIVERS, formatDate, raceById, TEAMS, teamColor } from '../../data/f1';
import { getPick, savePick } from '../../data/picksStore';
import type { Pick } from '../../engine';

const driverOptions = DRIVERS.map((d) => ({ id: d.id, label: d.name, color: teamColor(d.team) }));
const teamOptions = TEAMS.filter((t) => t.id !== 'otros').map((t) => ({ id: t.id, label: t.name, color: t.color }));

export default function Prediccion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const race = raceById(id);
  const [pick, setPick] = useState<Pick>(() => getPick(id));
  if (!race) return <Screen title="Carrera no encontrada" />;

  const setTop = (i: number, v: string) => setPick((p) => ({ ...p, top10: p.top10.map((x, j) => (j === i ? v : x)) }));
  return (
    <Screen>
      <Stack.Screen options={{ title: race.name }} />
      <Text style={text.h2}>{race.name}</Text>
      <Text style={text.muted}>{formatDate(race.date)}. Los campos vacíos penalizan.</Text>
      <OptionPicker label="Pole" value={pick.pole} options={driverOptions} onChange={(v) => setPick((p) => ({ ...p, pole: v }))} />
      <OptionPicker label="Escudería" value={pick.team} options={teamOptions} onChange={(v) => setPick((p) => ({ ...p, team: v }))} />
      {pick.top10.map((v, i) => (
        <OptionPicker
          key={i}
          label={`Posición ${i + 1}`}
          value={v}
          // Un piloto ya elegido en otra posición del top 10 no aparece. La pole es aparte y sí puede repetirse.
          options={driverOptions.filter((o) => o.id === v || !pick.top10.includes(o.id))}
          onChange={(x) => setTop(i, x)}
        />
      ))}
      <Button
        label="Guardar predicción"
        onPress={() => {
          savePick(race.id, pick);
          Alert.alert('Guardada', 'De momento se guarda solo en esta sesión; se sincronizará con tu grupo al conectar la cuenta.');
          router.back();
        }}
      />
    </Screen>
  );
}
