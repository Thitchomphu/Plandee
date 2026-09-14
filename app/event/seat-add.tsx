import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { Theme } from '@/constants/theme';
import { assignGuestToTable, getGuests, getTable, getTableGuests, getTables, Guest } from '@/data/guests';

export default function AddGuestToTableScreen() {
  const { eventId = '', tableId = '' } = useLocalSearchParams<{ eventId?: string; tableId?: string }>();
  const table = getTable(tableId) ?? getTables(eventId)[0];
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string>('');
  const available = useMemo(() => getGuests(eventId).filter((guest) => !guest.tableId && guest.name.toLowerCase().includes(query.toLowerCase())), [eventId, query]);
  const confirm = () => {
    if (!selected || !table) return Alert.alert('ยังไม่ได้เลือกแขก', 'กรุณาเลือกแขกก่อนยืนยัน');
    if (getTableGuests(table.id).length >= table.capacity) return Alert.alert('โต๊ะเต็มแล้ว', 'ไม่สามารถเพิ่มแขกเกินจำนวนที่นั่งได้');
    assignGuestToTable(selected, table.id);
    router.back();
  };
  return <SafeAreaView style={styles.overlay}><Pressable style={styles.dismiss} onPress={() => router.back()} /><ScrollView contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled"><View style={styles.notch} /><Text style={styles.title}>เพิ่มแขกเข้าโต๊ะ</Text><Text style={styles.subtitle}>ค้นหาและเลือกแขกที่ต้องการจัดลง {table?.name ?? 'โต๊ะ'}</Text><AppInput label="ค้นหาแขก" value={query} onChangeText={setQuery} placeholder="ค้นหาชื่อแขก..." /><Text style={styles.label}>เลือกแขกที่ยังไม่มีโต๊ะ</Text><View style={styles.guestList}>{available.map((guest) => <GuestOption key={guest.id} guest={guest} selected={selected === guest.id} onPress={() => setSelected(guest.id)} />)}{available.length === 0 && <Text style={styles.empty}>ไม่มีแขกที่ยังไม่ได้จัดโต๊ะ</Text>}</View><AppButton title="ยืนยันการเพิ่มแขก" onPress={confirm} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}

function GuestOption({ guest, selected, onPress }: { guest: Guest; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.option}><Text style={[styles.checkbox, selected && styles.checkboxSelected]}>{selected ? '✓' : ''}</Text><View style={styles.optionText}><Text style={styles.name}>{guest.name}</Text><Text style={styles.group}>{guest.group}</Text></View></Pressable>;
}

const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: 'rgba(43,34,51,0.45)' }, dismiss: { flex: 1 }, sheet: { backgroundColor: '#FFFBF3', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 30, gap: 14 }, notch: { width: 40, height: 4, borderRadius: 4, backgroundColor: Theme.colors.border, alignSelf: 'center', marginBottom: 4 }, title: { color: Theme.colors.text, fontSize: 20, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 13 }, label: { color: Theme.colors.muted, fontSize: 13, fontWeight: '600' }, guestList: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 16, padding: 12, gap: 10, maxHeight: 220 }, option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 38 }, checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 5, textAlign: 'center', color: '#FFFFFF', backgroundColor: Theme.colors.surface }, checkboxSelected: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary }, optionText: { flex: 1, gap: 2 }, name: { color: Theme.colors.text, fontSize: 14 }, group: { color: Theme.colors.muted, fontSize: 12 }, empty: { color: Theme.colors.muted, textAlign: 'center', padding: 20 } });
