import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  containerStyle?: ViewStyle;
  minimumDate?: Date;
};

const parseDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const displayDate = (date: Date) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(date);

export function DateInput({ label, value, onChange, containerStyle, minimumDate }: Props) {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const selected = parseDate(value);
  const choose = (event: DateTimePickerEvent, date?: Date) => {
    setOpen(false);
    if (event.type === 'set' && date) onChange(formatDate(date));
  };

  return <View style={[styles.group, containerStyle]}>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`เลือก${label}`} onPress={() => setOpen(true)} style={styles.input}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value ? displayDate(selected) : 'เลือกวันที่จากปฏิทิน'}</Text>
      <Text style={styles.icon}>📅</Text>
    </Pressable>
    {open && Platform.OS === 'ios' ? <Modal visible transparent animationType="slide" onRequestClose={() => setOpen(false)}><View style={styles.modalBackdrop}><View style={styles.calendarSheet}><View style={styles.calendarHeader}><Text style={styles.calendarTitle}>{label}</Text><Pressable accessibilityRole="button" onPress={() => setOpen(false)} hitSlop={12}><Text style={styles.close}>ปิด</Text></Pressable></View><View style={styles.calendarCenter}><DateTimePicker
      value={selected}
      mode="date"
      display="inline"
      style={{ width: Math.min(width - 28, 380), alignSelf: 'center' }}
      themeVariant="light"
      textColor={Theme.colors.text}
      accentColor={Theme.colors.primary}
      onChange={choose}
      minimumDate={minimumDate}
    /></View></View></View></Modal> : null}
    {open && Platform.OS !== 'ios' ? <DateTimePicker value={selected} mode="date" display="default" onChange={choose} minimumDate={minimumDate} /> : null}
  </View>;
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { color: Theme.colors.text, fontSize: 14, fontWeight: '600' },
  input: { minHeight: 52, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.input, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { color: Theme.colors.text, fontSize: 16 },
  placeholder: { color: Theme.colors.muted },
  icon: { fontSize: 18 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(40,33,47,0.45)' },
  calendarSheet: { backgroundColor: Theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  calendarCenter: { alignItems: 'center', marginHorizontal: -14 },
  calendarTitle: { color: Theme.colors.text, fontSize: Theme.type.section, fontWeight: '700' },
  close: { color: Theme.colors.primary, fontSize: Theme.type.body, fontWeight: '700' },
});
