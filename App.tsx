import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { CLASSIC_5_SENTIDOS } from './src/engine';
import { colors, spacing } from './src/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>La Porra de la Fórmula</Text>
      <Text style={styles.subtitle}>{CLASSIC_5_SENTIDOS.length} reglas cargadas</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { color: colors.accent, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textMuted, marginTop: spacing.sm },
});
