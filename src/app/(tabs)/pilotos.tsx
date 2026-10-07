import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Card, ColorBar, Screen, text } from '../../components/ui';
import { DRIVERS, TEAMS, teamName } from '../../data/f1';

export default function Pilotos() {
  return (
    <Screen title="Pilotos" subtitle="Parrilla 2026">
      {TEAMS.map((t) => {
        const ds = DRIVERS.filter((d) => d.team === t.id);
        if (!ds.length) return null;
        return ds.map((d) => (
          <Card key={d.id} onPress={() => router.push({ pathname: '/piloto/[id]', params: { id: d.id } })}>
            <ColorBar color={t.color} />
            <View style={{ flex: 1 }}>
              <Text style={text.body}>{d.name}</Text>
              <Text style={text.muted}>{teamName(d.team)}</Text>
            </View>
            <Text style={{ color: t.color, fontWeight: '800' }}>{d.id}</Text>
          </Card>
        ));
      })}
    </Screen>
  );
}
