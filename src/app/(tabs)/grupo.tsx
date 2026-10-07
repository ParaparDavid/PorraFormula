import { Text, View } from 'react-native';
import { Card, Screen, text } from '../../components/ui';
import { CLASSIC_5_SENTIDOS, type Rule } from '../../engine';
import { colors } from '../../theme';

const LABEL: Record<Rule['type'], string> = {
  pole_correct: 'Acertar la pole',
  pole_q1_out: 'Pole que no pasa Q1',
  pole_dnf: 'Pole que no acaba la carrera',
  top_positions: 'Posición exacta del top 10',
  bonus_position: 'Posición bonus (sorteo)',
  gafe_position: 'Posición gafe (sorteo)',
  team_both_finish: 'Escudería: ambos coches acaban',
  team_dnf: 'Escudería: coche que no acaba',
  blank_field: 'Campo sin rellenar',
};

function valueOf(r: Rule): string {
  if (r.type === 'top_positions') return r.points.join(' / ');
  if (r.type === 'team_dnf') return `${r.pointsPerCar} por coche`;
  return r.points > 0 ? `+${r.points}` : `${r.points}`;
}

export default function Grupo() {
  return (
    <Screen title="Grupo" subtitle="Reglas: plantilla Clásica 5 Sentidos (solo lectura por ahora)">
      {CLASSIC_5_SENTIDOS.map((r) => (
        <Card key={r.id}>
          <Text style={[text.body, { flex: 1 }]}>{LABEL[r.type]}</Text>
          <View>
            <Text style={{ color: colors.accent, fontWeight: '800' }}>{valueOf(r)}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
