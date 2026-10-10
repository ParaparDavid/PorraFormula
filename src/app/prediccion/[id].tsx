import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { OptionPicker } from '../../components/OptionPicker';
import { Button, Card, Screen, text } from '../../components/ui';
import { closeLabel, isOpen } from '../../data/deadlines';
import { DRIVERS, formatDate, raceById, TEAMS, teamColor } from '../../data/f1';
import { PicksError, savePickToGroups } from '../../data/picks';
import { getGroupIds, getPick, savePick } from '../../data/picksStore';
import type { Pick } from '../../engine';
import { useAuth } from '../../firebase/AuthContext';
import { colors } from '../../theme';

const driverOptions = DRIVERS.map((d) => ({ id: d.id, label: d.name, color: teamColor(d.team) }));
const teamOptions = TEAMS.filter((t) => t.id !== 'otros').map((t) => ({ id: t.id, label: t.name, color: t.color }));

export default function Prediccion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const race = raceById(id);
  const [pick, setPick] = useState<Pick>(() => getPick(id));
  const [saving, setSaving] = useState(false);
  if (!race) return <Screen title="Carrera no encontrada" />;

  const open = isOpen(race.date);
  const setTop = (i: number, v: string) => setPick((p) => ({ ...p, top10: p.top10.map((x, j) => (j === i ? v : x)) }));

  const onSave = async () => {
    if (!isOpen(race.date)) {
      Alert.alert('Carrera cerrada', 'Ya no se pueden cambiar las predicciones de esta carrera.');
      return;
    }
    setSaving(true);
    try {
      if (user) await savePickToGroups(user.uid, getGroupIds(), race.id, pick);
      savePick(race.id, pick);
      router.back();
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof PicksError ? e.message : 'Inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: race.name }} />
      <Text style={text.h2}>{race.name}</Text>
      <Text style={text.muted}>{formatDate(race.date)}</Text>
      <Card style={{ borderColor: open ? colors.border : colors.bad, flexDirection: 'column', alignItems: 'flex-start' }}>
        <Text style={{ color: open ? colors.accent : colors.bad, fontWeight: '700' }}>
          {open ? `Abierta hasta el ${closeLabel(race.date)} (hora de España)` : 'Cerrada: solo puedes verla'}
        </Text>
        {open ? <Text style={[text.muted, { marginTop: 4 }]}>Los campos vacíos penalizan.</Text> : null}
      </Card>
      <OptionPicker disabled={!open} label="Pole" value={pick.pole} options={driverOptions} onChange={(v) => setPick((p) => ({ ...p, pole: v }))} />
      <OptionPicker disabled={!open} label="Escudería" value={pick.team} options={teamOptions} onChange={(v) => setPick((p) => ({ ...p, team: v }))} />
      {pick.top10.map((v, i) => (
        <OptionPicker
          key={i}
          disabled={!open}
          label={`Posición ${i + 1}`}
          value={v}
          // Un piloto ya elegido en otra posición del top 10 no aparece. La pole es aparte y sí puede repetirse.
          options={driverOptions.filter((o) => o.id === v || !pick.top10.includes(o.id))}
          onChange={(x) => setTop(i, x)}
        />
      ))}
      {open ? saving ? <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} /> : <Button label="Guardar predicción" onPress={onSave} /> : null}
    </Screen>
  );
}
