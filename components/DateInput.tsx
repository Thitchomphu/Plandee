import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

type Props = { label: string; value: string; onChange: (value: string) => void; containerStyle?: ViewStyle; minimumDate?: Date };
const parseDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date();
const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const displayDate = (date: Date) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

export function DateInput({ label, value, onChange, containerStyle, minimumDate }: Props) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const choose = (_event: DateTimePickerEvent, date?: Date) => { if (Platform.OS === 'android') setOpen(false); if (date) onChange(formatDate(date)); };
  return <View style={[styles.group, containerStyle]}><Text style={styles.label}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={`เลือก${label}`} onPress={() => setOpen(true)} style={styles.input}><Text style={[styles.value, !value && styles.placeholder]}>{value ? displayDate(selected) : 'เลือกวันที่จากปฏิทิน'}</Text><Text style={styles.icon}>📅</Text></Pressable>{open ? <><DateTimePicker value={selected} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={choose} minimumDate={minimumDate} />{Platform.OS === 'ios' ? <Pressable onPress={() => setOpen(false)} style={styles.done}><Text style={styles.doneText}>ยืนยันวันที่</Text></Pressable> : null}</> : null}</View>;
}

const styles = StyleSheet.create({ group: { gap: 6 }, label: { color: Theme.colors.text, fontSize: 13, fontWeight: '600' }, input: { minHeight: 52, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.input, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, value: { color: Theme.colors.text, fontSize: 14 }, placeholder: { color: Theme.colors.muted }, icon: { fontSize: 18 }, done: { alignSelf: 'flex-start', paddingVertical: 6 }, doneText: { color: Theme.colors.primary, fontSize: 13, fontWeight: '700' } });
