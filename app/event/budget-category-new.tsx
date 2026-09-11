import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { Theme } from '@/constants/theme';
import { addBudgetCategory } from '@/data/eventBudget';

export default function NewBudgetCategoryScreen() {
  const { eventId = '' } = useLocalSearchParams<{ eventId?: string }>();
  const [name, setName] = useState(''); const [amount, setAmount] = useState(''); const [note, setNote] = useState('');
  const save = () => { const planned = Number(amount.replace(/[^0-9]/g, '')); if (!name.trim() || !planned || planned <= 0) return Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกชื่อหมวดและงบเป็นตัวเลขบวก'); addBudgetCategory({ eventId, name: name.trim(), planned, note: note.trim() }); router.back(); };
  return <SafeAreaView style={styles.overlay}><ScrollView contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled"><Text style={styles.notch}>—</Text><Text style={styles.title}>เพิ่มงบแต่ละหมวด</Text><Text style={styles.subtitle}>กำหนดวงเงินและงบสำหรับหมวดหมู่ของงาน</Text><AppInput label="ชื่อหมวด" value={name} onChangeText={setName} placeholder="เช่น ดนตรี หรือของชำร่วย" /><AppInput label="งบประมาณที่ตั้งไว้ (บาท)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="เช่น 50000" /><AppInput label="หมายเหตุ" value={note} onChangeText={setNote} multiline numberOfLines={4} style={styles.note} /><AppButton title="เพิ่มหมวดงบประมาณ" onPress={save} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: 'rgba(43,34,51,0.45)' }, sheet: { marginTop: 'auto', backgroundColor: '#FFFBF3', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 30, gap: 14 }, notch: { color: Theme.colors.border, fontSize: 28, lineHeight: 12, textAlign: 'center' }, title: { color: Theme.colors.text, fontSize: 20, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 13 }, note: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 } });
