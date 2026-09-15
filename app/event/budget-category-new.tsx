import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { CurrencyInput, currencyValue } from '@/components/CurrencyInput';
import { Theme } from '@/constants/theme';
import { addBudgetCategory, getBudgetCategory, setBudgetCategory } from '@/data/eventBudget';

export default function BudgetCategorySetupScreen() {
  const { eventId = '', categoryId } = useLocalSearchParams<{ eventId?: string; categoryId?: string }>();
  const existing = categoryId ? getBudgetCategory(eventId, categoryId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing?.planned ? existing.planned.toLocaleString('en-US') : '');
  const [note, setNote] = useState(existing?.note ?? '');
  const save = () => {
    const planned = currencyValue(amount);
    if (!name.trim() || !planned || planned <= 0) return Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกชื่อหมวดและงบเป็นตัวเลขบวก');
    if (categoryId) setBudgetCategory(eventId, categoryId, planned, note.trim());
    else addBudgetCategory({ eventId, name: name.trim(), planned, note: note.trim() });
    router.back();
  };
  return <SafeAreaView style={styles.overlay}><ScrollView contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled"><Text style={styles.notch}>—</Text><Text style={styles.title}>{existing ? 'ตั้งงบประมาณหมวดนี้' : 'เพิ่มงบแต่ละหมวด'}</Text><Text style={styles.subtitle}>กำหนดงบตั้งต้นเพื่อใช้คำนวณยอดคงเหลือของหมวด</Text><AppInput label="ชื่อหมวด" value={name} onChangeText={setName} editable={!existing} placeholder="เช่น สถานที่ ตกแต่ง หรือดนตรี" /><CurrencyInput label="งบประมาณตั้งต้น (บาท)" value={amount} onChangeText={setAmount} placeholder="เช่น 50,000" /><AppInput label="หมายเหตุ" value={note} onChangeText={setNote} multiline numberOfLines={4} style={styles.note} /><AppButton title={existing ? 'บันทึกงบประมาณ' : 'เพิ่มหมวดงบประมาณ'} onPress={save} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: 'rgba(43,34,51,0.45)' }, sheet: { marginTop: 'auto', backgroundColor: '#FFFBF3', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 30, gap: 14 }, notch: { color: Theme.colors.border, fontSize: 28, lineHeight: 12, textAlign: 'center' }, title: { color: Theme.colors.text, fontSize: 20, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 13 }, note: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 } });
