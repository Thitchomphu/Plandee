import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Alert } from '@/components/AppDialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { ChecklistCategoryPicker } from '@/components/ChecklistCategoryPicker';
import { CurrencyInput, currencyValue } from '@/components/CurrencyInput';
import { DateInput } from '@/components/DateInput';
import { EventPageHeader } from '@/components/EventPageHeader';
import { Theme } from '@/constants/theme';
import { addChecklistItem } from '@/data/checklists';
import { getChecklistCategoryNames } from '@/data/eventBudget';

export default function NewChecklistItemScreen() {
  const { eventId = '' } = useLocalSearchParams<{ eventId?: string }>();
  const [title, setTitle] = useState('');
  const categories = getChecklistCategoryNames(eventId);
  const [category, setCategory] = useState(categories[0] ?? 'อื่น ๆ');
  const [dueDate, setDueDate] = useState('');
  const [budget, setBudget] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!title.trim() || !category) return Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อรายการและเลือกหมวดหมู่');
    if (assigneeName.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assigneeName.trim())) return Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณาตรวจสอบอีเมลผู้รับผิดชอบ');
    setSaving(true);
    const { error } = await addChecklistItem({ eventId, title: title.trim(), category, dueDate, budget: currencyValue(budget), note: note.trim(), done: false, assigneeName: assigneeName.trim() });
    setSaving(false);
    if (error) return Alert.alert('เพิ่มรายการไม่สำเร็จ', error.message);
    router.back();
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <EventPageHeader title="เพิ่มรายการเช็กลิสต์" backLabel="กลับเช็กลิสต์" onBack={() => router.back()} />
    <Text style={styles.subtitle}>ใส่ชื่อและหมวดหมู่ก่อน แล้วค่อยเติมข้อมูลอื่นภายหลังได้</Text>
    <AppInput label="ชื่อรายการ" value={title} onChangeText={setTitle} placeholder="เช่น จองรถตกแต่งดอกไม้" />
    <ChecklistCategoryPicker value={category} onChange={setCategory} categories={categories} />
    <AppInput label="ผู้รับผิดชอบ (ชื่อหรืออีเมล)" value={assigneeName} onChangeText={setAssigneeName} placeholder="เช่น nui@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
    <Text style={styles.assigneeHint}>ใช้แสดงว่าใครรับผิดชอบงานนี้ ยังไม่ได้ส่งคำเชิญทางอีเมล</Text>
    <Text style={styles.fieldHint}>กำหนดการและค่าใช้จ่าย (ไม่บังคับ)</Text>
    <DateInput label="วันครบกำหนด" value={dueDate} onChange={setDueDate} />
    <CurrencyInput label="งบที่คาดว่าจะใช้ (บาท)" value={budget} onChangeText={setBudget} placeholder="0" />
    <AppInput label="หมายเหตุ" value={note} onChangeText={setNote} placeholder="ระบุรายละเอียดเพิ่มเติม..." multiline numberOfLines={4} style={styles.note} />
    <AppButton title={saving ? 'กำลังบันทึก...' : 'เพิ่มรายการ'} disabled={saving} onPress={submit} />
    <AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" />
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: Theme.spacing.xl, paddingBottom: 36, gap: Theme.spacing.lg }, title: { color: Theme.colors.text, fontSize: 22, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: Theme.type.label }, fieldHint: { color: Theme.colors.muted, fontSize: Theme.type.label, fontWeight: '600', marginTop: 4 }, assigneeHint: { color: Theme.colors.muted, fontSize: Theme.type.caption, marginTop: -10 }, note: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 } });
