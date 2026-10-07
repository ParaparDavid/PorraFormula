import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Button, Card, Field, Screen, text } from '../../components/ui';
import { createGroup, GroupError } from '../../data/groups';
import { TEMPLATES, type TemplateKey } from '../../engine';
import { useAuth } from '../../firebase/AuthContext';
import { colors } from '../../theme';

const DESCRIPTIONS: Record<TemplateKey, string> = {
  classic: 'Las reglas de la Porra 5 Sentidos: pole, escudería, top 10, bonus, gafe y penalización por huecos.',
  simple: 'Solo pole y top 10.',
  blank: 'Sin reglas: las montas tú desde cero.',
};

export default function NuevoGrupo() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<TemplateKey>('classic');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onCreate = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      const id = await createGroup(user, name, template);
      router.replace({ pathname: '/grupos/[id]', params: { id } });
    } catch (e) {
      setError(e instanceof GroupError ? e.message : 'No se pudo crear el grupo. Comprueba la conexión.');
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={text.h2}>Nuevo grupo</Text>
      <Field label="Nombre del grupo" value={name} onChangeText={setName} placeholder="Los de la oficina" maxLength={40} />
      <Text style={[text.muted, { marginTop: 20 }]}>REGLAS DE PARTIDA (podrás cambiarlas luego)</Text>
      {(Object.keys(TEMPLATES) as TemplateKey[]).map((k) => (
        <Pressable key={k} onPress={() => setTemplate(k)}>
          <Card style={{ flexDirection: 'column', alignItems: 'flex-start', borderColor: template === k ? colors.accent : colors.border }}>
            <Text style={[text.body, { fontWeight: '700' }]}>{TEMPLATES[k].name}</Text>
            <Text style={text.muted}>{DESCRIPTIONS[k]}</Text>
          </Card>
        </Pressable>
      ))}
      {error ? <Text style={{ color: colors.bad, marginTop: 12 }}>{error}</Text> : null}
      {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} /> : <Button label="Crear grupo" onPress={onCreate} />}
    </Screen>
  );
}
