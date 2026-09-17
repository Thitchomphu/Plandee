import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { ChecklistCategoryPicker } from '@/components/ChecklistCategoryPicker';
import { CurrencyInput, currencyValue } from '@/components/CurrencyInput';
import { DateInput } from '@/components/DateInput';
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
  const [responsible, setResponsible] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!title.trim() || !category) return Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อรายการและเลือกหมวดหมู่');
    setSaving(true);
    const { error } = await addChecklistItem({ eventId, title: title.trim(), category, dueDate, budget: currencyValue(budget), note: note.trim(), responsible: responsible.trim(), done: false });
    setSaving(false);
    if (error) return Alert.alert('เพิ่มรายการไม่สำเร็จ', error.message);
    router.back();
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ ยกเลิก</Text></Pressable><Text style={styles.title}>เพิ่มรายการเช็กลิสต์</Text><Text style={styles.subtitle}>ใส่ชื่อและหมวดหมู่ก่อน แล้วค่อยเติมข้อมูลอื่นภายหลังได้</Text><AppInput label="ชื่อรายการ" value={title} onChangeText={setTitle} placeholder="เช่น จองรถตกแต่งดอกไม้" /><ChecklistCategoryPicker value={category} onChange={setCategory} categories={categories} /><AppInput label="ร้านหรือผู้รับผิดชอบ" value={responsible} onChangeText={setResponsible} placeholder="เช่น ร้านดอกไม้ ABC หรือ คุณมิว" /><Text style={styles.fieldHint}>กำหนดการและค่าใช้จ่าย (ไม่บังคับ)</Text><DateInput label="วันครบกำหนด" value={dueDate} onChange={setDueDate} /><CurrencyInput label="จำนวนเงินที่ใช้ (บาท)" value={budget} onChangeText={setBudget} placeholder="0" /><AppInput label="หมายเหตุ" value={note} onChangeText={setNote} placeholder="ระบุรายละเอียดเพิ่มเติม..." multiline numberOfLines={4} style={styles.note} /><AppButton title={saving ? 'กำลังบันทึก...' : 'เพิ่มรายการ'} disabled={saving} onPress={submit} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#FFFBF3' }, content: { padding: 22, paddingBottom: 30, gap: 14 }, back: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600', minHeight: 36 }, title: { color: Theme.colors.text, fontSize: 22, fontWeight: '800' }, subtitle: { color: '#847892', fontSize: 13 }, fieldHint: { color: '#847892', fontSize: 13, fontWeight: '600', marginTop: 4 }, note: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 } });
