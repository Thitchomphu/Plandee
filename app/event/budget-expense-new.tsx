import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { Theme } from '@/constants/theme';
import { addBudgetExpense, getBudgetCategory, updateBudgetExpense } from '@/data/eventBudget';

export default function BudgetExpenseFormScreen() {
  const { eventId = '', categoryId = '', expenseId } = useLocalSearchParams<{ eventId?: string; categoryId?: string; expenseId?: string }>();
  const expense = getBudgetCategory(eventId, categoryId)?.expenses.find((item) => item.id === expenseId);
  const [name, setName] = useState(expense?.name ?? ''); const [amount, setAmount] = useState(expense?.amount ? String(expense.amount) : ''); const [paid, setPaid] = useState(expense?.paid ?? false);
  const save = () => { const parsed = Number(amount.replace(/[^0-9]/g, '')); if (!name.trim() || !parsed || parsed <= 0) return Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกชื่อรายการและจำนวนเงินเป็นตัวเลขบวก'); if (expenseId) updateBudgetExpense(expenseId, { name: name.trim(), amount: parsed, paid }); else addBudgetExpense({ eventId, categoryId, name: name.trim(), amount: parsed, paid }); router.back(); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.notch}><Text>—</Text></View><Text style={styles.title}>{expense ? 'แก้ไขค่าใช้จ่าย' : 'เพิ่มค่าใช้จ่าย'}</Text><Text style={styles.subtitle}>บันทึกรายการย่อยของหมวดงบประมาณ</Text><AppInput label="ชื่อรายการ" value={name} onChangeText={setName} placeholder="เช่น ค่าเช่าอุปกรณ์" /><AppInput label="จำนวนเงิน (บาท)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="เช่น 15000" /><AppButton title={paid ? 'สถานะ: จ่ายแล้ว' : 'สถานะ: ยังไม่จ่าย'} onPress={() => setPaid((value) => !value)} variant="outline" /><AppButton title={expense ? 'บันทึกการแก้ไข' : 'เพิ่มค่าใช้จ่าย'} onPress={save} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#FFFBF3' }, content: { padding: 22, paddingBottom: 30, gap: 14, marginTop: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28 }, notch: { alignItems: 'center', height: 10 }, title: { color: Theme.colors.text, fontSize: 20, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 13 } });
