import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Alert } from '@/components/AppDialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { EventPageHeader } from '@/components/EventPageHeader';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { addGuestTable, deleteGuestTable, getTable, getTables, updateGuestTable } from '@/data/guests';

export default function NewTableScreen() {
  const { eventId = '', tableId } = useLocalSearchParams<{ eventId?: string; tableId?: string }>();
  const existing = tableId ? getTable(tableId) : undefined;
  const [name, setName] = useState(existing?.name ?? `โต๊ะ ${getTables(eventId).length + 1}`);
  const [capacity, setCapacity] = useState(existing?.capacity.toString() ?? '10');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const seats = Number(capacity.replace(/[^0-9]/g, ''));
    if (!name.trim() || !seats || seats < 1) return Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกชื่อโต๊ะและจำนวนที่นั่งอย่างน้อย 1 ที่');
    setSaving(true);
    const { error } = existing && tableId ? await updateGuestTable(tableId, { name: name.trim(), capacity: seats }) : await addGuestTable({ eventId, name: name.trim(), capacity: seats });
    setSaving(false);
    if (error) return Alert.alert('เพิ่มโต๊ะไม่สำเร็จ', error.message);
    router.back();
  };
  const remove = () => { if (!tableId) return; Alert.alert('ลบโต๊ะนี้?', 'การจัดที่นั่งของแขกที่โต๊ะนี้จะถูกยกเลิก', [{ text: 'ยกเลิก', style: 'cancel' }, { text: 'ลบโต๊ะ', style: 'destructive', onPress: async () => { const result = await deleteGuestTable(tableId); if (result.error) Alert.alert('ลบโต๊ะไม่สำเร็จ', result.error.message); else router.back(); } }]); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><EventPageHeader title={existing ? 'แก้ไขโต๊ะ' : 'เพิ่มโต๊ะ'} backLabel="กลับหน้าจัดที่นั่ง" onBack={() => router.back()} /><Text style={styles.subtitle}>กำหนดจำนวนที่นั่งก่อนจัดที่นั่งแขก</Text><AppInput label="ชื่อโต๊ะ" value={name} onChangeText={setName} placeholder="เช่น โต๊ะ 1 (VIP)" /><AppInput label="จำนวนที่นั่ง (คน)" value={capacity} onChangeText={(value) => setCapacity(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="เช่น 10" /><AppButton title={saving ? 'กำลังบันทึก...' : existing ? 'บันทึกการแก้ไข' : 'เพิ่มโต๊ะ'} disabled={saving} onPress={save} />{existing ? <AppButton title="ลบโต๊ะนี้" onPress={remove} variant="outline" disabled={saving} /> : null}<AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: Theme.spacing.xl, paddingBottom: 36, gap: Theme.spacing.lg }, title: { color: Theme.colors.text, fontSize: 22, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: Theme.type.label } });
