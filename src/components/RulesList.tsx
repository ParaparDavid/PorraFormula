import { Text } from 'react-native';
import type { Rule } from '../engine';
import { colors } from '../theme';
import { Card, text } from './ui';

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

export function RulesList({ rules }: { rules: Rule[] }) {
  if (!rules.length) return <Card><Text style={text.muted}>Este grupo no tiene reglas todavía.</Text></Card>;
  return (
    <>
      {rules.map((r) => (
        <Card key={r.id} style={{ opacity: r.enabled ? 1 : 0.45 }}>
          <Text style={[text.body, { flex: 1 }]}>{LABEL[r.type]}</Text>
          <Text style={{ color: colors.accent, fontWeight: '800' }}>{r.enabled ? valueOf(r) : 'Desactivada'}</Text>
        </Card>
      ))}
    </>
  );
}
