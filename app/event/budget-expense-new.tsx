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
import { getChecklistItem } from '@/data/checklists';
import { addBudgetExpense, getBudgetCategory, getExpenseOverrun, recordChecklistPayment, updateBudgetExpense } from '@/data/eventBudget';

export default function BudgetExpenseFormScreen() {
  const { eventId = '', categoryId = '', expenseId, checklistItemId } = useLocalSearchParams<{ eventId?: string; categoryId?: string; expenseId?: string; checklistItemId?: string }>();
  const expense = getBudgetCategory(eventId, categoryId)?.expenses.find((item) => item.id === expenseId);
  const checklistItem = checklistItemId ? getChecklistItem(checklistItemId) : undefined;
  const [name, setName] = useState(expense?.name ?? checklistItem?.title ?? ''); const [amount, setAmount] = useState((expense?.amount || checklistItem?.budget) ? (expense?.amount || checklistItem?.budget)?.toLocaleString('en-US') ?? '' : ''); const [paid, setPaid] = useState(checklistItemId ? true : expense?.paid ?? false);
  const [saving, setSaving] = useState(false);
  const persist = async (parsed: number) => {
    setSaving(true);
    try {
      const result = checklistItemId
        ? await recordChecklistPayment(eventId, categoryId, checklistItemId, name.trim(), parsed)
        : expenseId
          ? await updateBudgetExpense(expenseId, { name: name.trim(), amount: parsed, paid })
          : await addBudgetExpense({ eventId, categoryId, name: name.trim(), amount: parsed, paid });
      if (result.error) return Alert.alert('บันทึกไม่สำเร็จ', result.error.message);
      router.back();
    } catch {
      Alert.alert('บันทึกไม่สำเร็จ', 'ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง');
    } finally {
      setSaving(false);
    }
  };
  const save = () => {
    if (saving) return;
    const parsed = currencyValue(amount);
    if (!name.trim() || !parsed || parsed <= 0) return Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกชื่อรายการและจำนวนเงินเป็นตัวเลขบวก');
    const warning = getExpenseOverrun(eventId, categoryId, parsed, expenseId ?? (checklistItemId ? `checklist-${checklistItemId}` : undefined));
    if (warning) return Alert.alert('ค่าใช้จ่ายอาจเกินงบ', warning, [
      { text: 'กลับไปแก้ไข', style: 'cancel' },
      { text: 'บันทึกต่อ', onPress: () => { void persist(parsed); } },
    ]);
    void persist(parsed);
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><EventPageHeader title={checklistItemId ? 'บันทึกการจ่ายเงิน' : expense ? 'แก้ไขค่าใช้จ่าย' : 'เพิ่มค่าใช้จ่าย'} backLabel="กลับหมวดงบงาน" onBack={() => router.back()} /><Text style={styles.subtitle}>{checklistItemId ? 'ยอดประมาณการจากเช็กลิสต์จะถูกแทนด้วยยอดที่จ่ายจริง ไม่ได้นับซ้ำ' : 'บันทึกรายการย่อยของหมวดงบประมาณ'}</Text><AppInput label="ชื่อรายการ" value={name} onChangeText={setName} placeholder="เช่น ค่าเช่าอุปกรณ์" /><CurrencyInput label="จำนวนเงิน (บาท)" value={amount} onChangeText={setAmount} placeholder="เช่น 15,000" />{!checklistItemId ? <AppButton title={paid ? 'สถานะ: จ่ายแล้ว' : 'สถานะ: ยังไม่จ่าย'} onPress={() => setPaid((value) => !value)} variant="outline" disabled={saving} /> : null}<AppButton title={saving ? 'กำลังบันทึก...' : checklistItemId ? 'ยืนยันว่าจ่ายแล้ว' : expense ? 'บันทึกการแก้ไข' : 'เพิ่มค่าใช้จ่าย'} onPress={save} disabled={saving} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" disabled={saving} /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: Theme.spacing.xl, paddingBottom: 36, gap: Theme.spacing.lg }, subtitle: { color: Theme.colors.muted, fontSize: Theme.type.label } });
