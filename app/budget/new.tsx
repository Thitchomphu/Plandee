import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { CurrencyInput, currencyValue } from '@/components/CurrencyInput';
import { Theme } from '@/constants/theme';
import { addExpense } from '@/data/budget';

export default function NewExpenseScreen() {
  const [name, setName] = useState(''); const [category, setCategory] = useState(''); const [amount, setAmount] = useState('');
  const submit = () => { const parsedAmount = currencyValue(amount); if (!name.trim() || !parsedAmount) { Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกรายการและจำนวนเงิน'); return; } addExpense({ id: `expense-${Date.now()}`, name: name.trim(), category: category.trim() || 'อื่น ๆ', amount: parsedAmount, paid: false }); Alert.alert('เพิ่มค่าใช้จ่ายสำเร็จ', `${name} ${amount} บาท`, [{ text: 'ตกลง', onPress: () => router.back() }]); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ ยกเลิก</Text></Pressable><Text style={styles.title}>เพิ่มค่าใช้จ่าย</Text><Text style={styles.subtitle}>บันทึกรายการใหม่ในงบประมาณ</Text><AppInput label="รายการ" value={name} onChangeText={setName} placeholder="เช่น ค่าดอกไม้" /><AppInput label="หมวดหมู่" value={category} onChangeText={setCategory} placeholder="เช่น ตกแต่ง" /><CurrencyInput label="จำนวนเงิน (บาท)" value={amount} onChangeText={setAmount} placeholder="0" /><AppButton title="เพิ่มรายการ" onPress={submit} /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 20, gap: 16 }, back: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600', minHeight: 40 }, title: { color: Theme.colors.text, fontSize: 28, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 14, marginBottom: 8 } });
