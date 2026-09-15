import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { addGuestTable, getTables } from '@/data/guests';

export default function NewTableScreen() {
  const { eventId = '' } = useLocalSearchParams<{ eventId?: string }>();
  const [name, setName] = useState(`โต๊ะ ${getTables(eventId).length + 1}`);
  const [capacity, setCapacity] = useState('10');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const seats = Number(capacity.replace(/[^0-9]/g, ''));
    if (!name.trim() || !seats || seats < 1) return Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกชื่อโต๊ะและจำนวนที่นั่งอย่างน้อย 1 ที่');
    setSaving(true);
    const { error } = await addGuestTable({ eventId, name: name.trim(), capacity: seats });
    setSaving(false);
    if (error) return Alert.alert('เพิ่มโต๊ะไม่สำเร็จ', error.message);
    router.back();
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>เพิ่มโต๊ะ</Text><Text style={styles.subtitle}>กำหนดจำนวนที่นั่งก่อนจัดแขกลงโต๊ะ</Text><AppInput label="ชื่อโต๊ะ" value={name} onChangeText={setName} placeholder="เช่น โต๊ะ 1 (VIP)" /><AppInput label="จำนวนที่นั่ง (คน)" value={capacity} onChangeText={(value) => setCapacity(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="เช่น 10" /><AppButton title={saving ? 'กำลังบันทึก...' : 'เพิ่มโต๊ะ'} disabled={saving} onPress={save} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 22, paddingBottom: 36, gap: 14 }, title: { color: Theme.colors.text, fontSize: 22, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 13 } });
