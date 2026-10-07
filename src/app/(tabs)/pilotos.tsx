import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { DriverAvatar } from '../../components/Avatar';
import { Card, Screen, text } from '../../components/ui';
import { DRIVERS, TEAMS, teamName } from '../../data/f1';

export default function Pilotos() {
  return (
    <Screen title="Pilotos" subtitle="Parrilla 2026">
      {TEAMS.map((t) => {
        const ds = DRIVERS.filter((d) => d.team === t.id);
        if (!ds.length) return null;
        return ds.map((d) => (
          <Card key={d.id} onPress={() => router.push({ pathname: '/piloto/[id]', params: { id: d.id } })}>
            <View style={{ marginRight: 14 }}>
              <DriverAvatar id={d.id} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={text.body}>{d.name}</Text>
              <Text style={text.muted}>{teamName(d.team)}</Text>
            </View>
          </Card>
        ));
      })}
    </Screen>
  );
}
