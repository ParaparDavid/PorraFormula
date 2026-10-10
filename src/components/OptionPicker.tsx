import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';

export type Option = { id: string; label: string; color?: string };

/** Campo que abre una lista para elegir una opción (piloto, escudería...). */
export function OptionPicker({
  label,
  value,
  options,
  onChange,
  placeholder = 'Elegir',
  disabled = false,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const current = options.find((o) => o.id === value);
  return (
    <>
      <Pressable onPress={() => !disabled && setOpen(true)} style={[s.field, disabled && { opacity: 0.6 }]}>
        <Text style={s.label}>{label}</Text>
        <View style={s.valueRow}>
          {current?.color ? <View style={[s.dot, { backgroundColor: current.color }]} /> : null}
          <Text style={[s.value, !current && { color: colors.textMuted }]}>{current ? current.label : placeholder}</Text>
        </View>
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={s.backdrop}>
          <View style={[s.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <Text style={s.sheetTitle}>{label}</Text>
            <FlatList
              data={[{ id: '', label: 'Vaciar' } as Option, ...options]}
              keyExtractor={(o) => o.id || 'none'}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  style={s.option}
                >
                  {item.color ? <View style={[s.dot, { backgroundColor: item.color }]} /> : null}
                  <Text style={[s.optionText, item.id === value && { color: colors.accent }]}>{item.label}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setOpen(false)} style={s.close}>
              <Text style={{ color: colors.textMuted }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  field: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  valueRow: { flexDirection: 'row', alignItems: 'center' },
  value: { color: colors.text, fontSize: 16, fontWeight: '600' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '75%',
    padding: spacing.md,
  },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  optionText: { color: colors.text, fontSize: 16 },
  close: { alignItems: 'center', paddingTop: spacing.md },
});
