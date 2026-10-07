import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Card, Screen, text } from '../../components/ui';
import { daysUntil, formatDate, nextRace } from '../../data/f1';
import { hasPick, usePicksVersion } from '../../data/picksStore';
import { colors } from '../../theme';

export default function Inicio() {
  usePicksVersion();
  const race = nextRace();
  if (!race) {
    return (
      <Screen title="La Porra de la Fórmula" subtitle="Temporada 2026">
        <Card><Text style={text.body}>La temporada ha terminado. ¡Hasta la próxima!</Text></Card>
      </Screen>
    );
  }
  const days = daysUntil(race.date);
  const done = hasPick(race.id);
  return (
    <Screen title="La Porra de la Fórmula" subtitle="Temporada 2026">
      <Text style={[text.muted, { marginTop: 8 }]}>PRÓXIMO GRAN PREMIO</Text>
      <Card style={{ flexDirection: 'column', alignItems: 'flex-start' }} onPress={() => router.push({ pathname: '/carrera/[id]', params: { id: race.id } })}>
        <Text style={{ color: colors.accent, fontSize: 24, fontWeight: '800' }}>{race.name}</Text>
        <Text style={text.muted}>{formatDate(race.date)}</Text>
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.text, fontSize: 40, fontWeight: '800' }}>
            {days === 0 ? 'Hoy' : days}
            {days > 0 ? <Text style={text.muted}>{days === 1 ? '  día' : '  días'}</Text> : null}
          </Text>
        </View>
      </Card>
      <Card style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <Text style={text.h2}>{done ? 'Predicción guardada' : 'Predicción pendiente'}</Text>
        <Text style={[text.muted, { marginTop: 4 }]}>
          {done ? 'Puedes cambiarla hasta que cierre.' : 'Aún no has rellenado esta carrera.'}
        </Text>
        <Button label={done ? 'Editar predicción' : 'Hacer predicción'} onPress={() => router.push({ pathname: '/prediccion/[id]', params: { id: race.id } })} />
      </Card>
    </Screen>
  );
}
