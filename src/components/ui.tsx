import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';

export function Screen({ children, title, subtitle }: { children?: ReactNode; title?: string; subtitle?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl * 2 }}
    >
      {title ? <Text style={s.title}>{title}</Text> : null}
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: ViewStyle; onPress?: () => void }) {
  const body = <View style={[s.card, style]}>{children}</View>;
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>{body}</Pressable> : body;
}

export function ColorBar({ color }: { color: string }) {
  return <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: color, marginRight: spacing.md }} />;
}

export function Button({ label, onPress, variant = 'primary' }: { label: string; onPress: () => void; variant?: 'primary' | 'ghost' }) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.button, primary ? s.buttonPrimary : s.buttonGhost, { opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={[s.buttonText, { color: primary ? colors.accentText : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, autoCapitalize = 'sentences', maxLength }: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
}) {
  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          color: colors.text,
          fontSize: 16,
          padding: spacing.md,
        }}
      />
    </View>
  );
}

export const text = StyleSheet.create({
  h2: { color: colors.text, fontSize: 18, fontWeight: '700' },
  body: { color: colors.text, fontSize: 15 },
  muted: { color: colors.textMuted, fontSize: 13 },
});

const s = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: { borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.md },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonGhost: { borderWidth: 1, borderColor: colors.border },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
