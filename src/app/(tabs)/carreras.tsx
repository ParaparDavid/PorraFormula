import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Card, Screen, text } from '../../components/ui';
import { closeLabel, isOpen } from '../../data/deadlines';
import { formatDate, nextRace, RACES, todayISO } from '../../data/f1';
import { hasPick, usePicksVersion } from '../../data/picksStore';
import { colors } from '../../theme';

export default function Carreras() {
  usePicksVersion();
  const today = todayISO();
  const next = nextRace(today);
  const open = RACES.filter((r) => isOpen(r.date));
  const filledOpen = open.filter((r) => hasPick(r.id)).length;
  return (
    <Screen
      title="Carreras"
      subtitle={open.length ? `Predicciones abiertas: ${filledOpen} de ${open.length} rellenadas` : 'Todas las predicciones están cerradas'}
    >
      {RACES.map((r, i) => {
        const past = r.date < today;
        const isNext = r.id === next?.id;
        const canEdit = isOpen(r.date);
        const done = hasPick(r.id);
        return (
          <Card
            key={r.id}
            onPress={() => router.push({ pathname: '/carrera/[id]', params: { id: r.id } })}
            style={{ opacity: past ? 0.55 : 1, borderColor: isNext ? colors.accent : colors.border }}
          >
            <Text style={{ color: colors.textMuted, width: 34, fontWeight: '700' }}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={text.body}>{r.name}</Text>
              <Text style={text.muted}>{formatDate(r.date)}</Text>
              <Text style={{ color: canEdit ? colors.textMuted : colors.bad, fontSize: 12, marginTop: 2 }}>
                {canEdit ? `Cierra: ${closeLabel(r.date)}` : 'Predicción cerrada'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {isNext ? <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>PRÓXIMA</Text> : null}
              <Text style={{ color: done ? colors.good : colors.textMuted, fontSize: 12, fontWeight: '700' }}>
                {done ? 'Rellenada' : canEdit ? 'Pendiente' : 'Sin predicción'}
              </Text>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
