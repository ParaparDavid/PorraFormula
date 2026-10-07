import { Text, View } from 'react-native';
import { Card, Screen, text } from '../../components/ui';
import { scoringContext } from '../../data/f1';
import { CLASSIC_5_SENTIDOS, computeStandings, emptyResult, type Pick, type RaceForStandings } from '../../engine';
import { colors } from '../../theme';

// Datos de EJEMPLO inventados para enseñar la pantalla. No son una carrera real.
const TOP = ['VER', 'NOR', 'PIA', 'LEC', 'HAM', 'RUS', 'ALO', 'SAI', 'GAS', 'TSU'];
const pick = (over: Partial<Pick>): Pick => ({ pole: 'VER', team: 'mclaren', top10: [...TOP], ...over });
const NAMES: Record<string, string> = { a: 'Jugador A', b: 'Jugador B', c: 'Jugador C' };
const demo: RaceForStandings[] = [
  {
    id: 'ejemplo',
    result: { ...emptyResult(), entered: true, pole: 'VER', top10: [...TOP], dnf: ['PIA'] },
    rules: CLASSIC_5_SENTIDOS,
    picks: {
      a: pick({}),
      b: pick({ pole: 'NOR', team: 'ferrari', top10: ['NOR', 'VER', 'PIA', 'HAM', 'LEC', 'RUS', 'ALO', 'SAI', 'GAS', 'TSU'] }),
      c: pick({ pole: '', team: '', top10: TOP.map((d, i) => (i < 3 ? d : '')) }),
    },
  },
];

export default function Clasificacion() {
  const rows = computeStandings(['a', 'b', 'c'], demo, scoringContext);
  return (
    <Screen title="Clasificación" subtitle="Datos de ejemplo: no es una carrera real">
      {rows.map((r, i) => (
        <Card key={r.memberId}>
          <Text style={{ color: i === 0 ? colors.accent : colors.textMuted, fontSize: 22, fontWeight: '800', width: 36 }}>{i + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={text.body}>{NAMES[r.memberId]}</Text>
            <Text style={text.muted}>{r.racesScored} carrera(s)</Text>
          </View>
          <Text style={{ color: r.total < 0 ? colors.bad : colors.text, fontSize: 20, fontWeight: '800' }}>{r.total}</Text>
        </Card>
      ))}
    </Screen>
  );
}
