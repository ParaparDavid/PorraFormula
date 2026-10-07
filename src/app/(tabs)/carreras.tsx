import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Card, Screen, text } from '../../components/ui';
import { formatDate, nextRace, RACES, todayISO } from '../../data/f1';
import { colors } from '../../theme';

export default function Carreras() {
  const today = todayISO();
  const next = nextRace(today);
  return (
    <Screen title="Carreras" subtitle={`${RACES.length} Grandes Premios`}>
      {RACES.map((r, i) => {
        const past = r.date < today;
        const isNext = r.id === next?.id;
        return (
          <Card key={r.id} onPress={() => router.push({ pathname: '/carrera/[id]', params: { id: r.id } })} style={{ opacity: past ? 0.55 : 1, borderColor: isNext ? colors.accent : colors.border }}>
            <Text style={{ color: colors.textMuted, width: 34, fontWeight: '700' }}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={text.body}>{r.name}</Text>
              <Text style={text.muted}>{formatDate(r.date)}</Text>
            </View>
            {isNext ? <Text style={{ color: colors.accent, fontWeight: '700' }}>PRÓXIMA</Text> : null}
          </Card>
        );
      })}
    </Screen>
  );
}
