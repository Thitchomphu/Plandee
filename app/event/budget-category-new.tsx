import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Alert } from '@/components/AppDialog';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { CurrencyInput, currencyValue } from '@/components/CurrencyInput';
import { Theme } from '@/constants/theme';
import { EventPageHeader } from '@/components/EventPageHeader';
import { addBudgetCategory, getBudgetCategory, setBudgetCategory } from '@/data/eventBudget';

export default function BudgetCategorySetupScreen() {
  const { eventId = '', categoryId } = useLocalSearchParams<{ eventId?: string; categoryId?: string }>();
  const existing = categoryId ? getBudgetCategory(eventId, categoryId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing?.planned ? existing.planned.toLocaleString('en-US') : '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (saving) return;
    const planned = currencyValue(amount);
    if (!name.trim() || !planned || planned <= 0) return Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกชื่อหมวดและงบเป็นตัวเลขบวก');
    setSaving(true);
    try {
      const result = categoryId
        ? await setBudgetCategory(eventId, categoryId, planned, note.trim())
        : await addBudgetCategory({ eventId, name: name.trim(), planned, note: note.trim() });
      if (result.error) return Alert.alert('บันทึกไม่สำเร็จ', result.error.message);
      router.back();
    } catch {
      Alert.alert('บันทึกไม่สำเร็จ', 'ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง');
    } finally {
      setSaving(false);
    }
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><EventPageHeader title={existing ? 'ตั้งงบประมาณหมวดนี้' : 'เพิ่มหมวดงบประมาณ'} backLabel="กลับงบงาน" onBack={() => router.back()} /><Text style={styles.subtitle}>กำหนดงบตั้งต้นเพื่อใช้คำนวณยอดคงเหลือของหมวด โดยงบทุกหมวดรวมกันต้องไม่เกินงบงาน</Text><AppInput label="ชื่อหมวด" value={name} onChangeText={setName} editable={!existing} placeholder="เช่น สถานที่ ตกแต่ง หรือดนตรี" /><CurrencyInput label="งบประมาณตั้งต้น (บาท)" value={amount} onChangeText={setAmount} placeholder="เช่น 50,000" /><AppInput label="หมายเหตุ" value={note} onChangeText={setNote} multiline numberOfLines={4} style={styles.note} /><AppButton title={saving ? 'กำลังบันทึก...' : existing ? 'บันทึกงบประมาณ' : 'เพิ่มหมวดงบประมาณ'} onPress={() => { void save(); }} disabled={saving} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" disabled={saving} /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: Theme.spacing.xl, paddingBottom: 36, gap: Theme.spacing.lg }, subtitle: { color: Theme.colors.muted, fontSize: Theme.type.label }, note: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 } });
