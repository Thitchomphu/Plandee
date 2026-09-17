import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { ChecklistCategoryPicker } from '@/components/ChecklistCategoryPicker';
import { CurrencyInput, currencyValue } from '@/components/CurrencyInput';
import { DateInput } from '@/components/DateInput';
import { Theme } from '@/constants/theme';
import { deleteChecklistItem, getChecklistItem, updateChecklistItem } from '@/data/checklists';
import { getChecklistCategoryNames } from '@/data/eventBudget';

export default function EditChecklistItemScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const item = getChecklistItem(id);
  const [title, setTitle] = useState(item?.title ?? '');
  const [category, setCategory] = useState(item?.category ?? 'อื่น ๆ');
  const [dueDate, setDueDate] = useState(item?.dueDate ?? '');
  const [budget, setBudget] = useState(item?.budget ? item.budget.toLocaleString('en-US') : '');
  const [responsible, setResponsible] = useState(item?.responsible ?? '');
  const [note, setNote] = useState(item?.note ?? '');
  const [done, setDone] = useState(item?.done ?? false);
  const [saving, setSaving] = useState(false);
  if (!item) return <SafeAreaView style={styles.safe}><Text style={styles.empty}>ไม่พบรายการเช็กลิสต์</Text></SafeAreaView>;
  const save = async () => {
    if (!title.trim() || !category) return Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อรายการและเลือกหมวดหมู่');
    setSaving(true);
    const { error } = await updateChecklistItem(id, { title: title.trim(), category, dueDate, budget: currencyValue(budget), note: note.trim(), responsible: responsible.trim(), done });
    setSaving(false);
    if (error) return Alert.alert('บันทึกไม่สำเร็จ', error.message);
    router.back();
  };
  const remove = () => Alert.alert('ลบรายการนี้?', 'ข้อมูลรายการและงบประมาณที่เกี่ยวข้องจะถูกลบ', [{ text: 'ยกเลิก', style: 'cancel' }, { text: 'ลบรายการ', style: 'destructive', onPress: async () => { const { error } = await deleteChecklistItem(id); if (error) Alert.alert('ลบรายการไม่สำเร็จ', error.message); else router.back(); } }]);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.notch} /><Text style={styles.title}>แก้ไขรายการเช็กลิสต์</Text><Text style={styles.subtitle}>ปรับรายละเอียดงานและค่าใช้จ่ายที่เกี่ยวข้อง</Text><AppInput label="ชื่อรายการ" value={title} onChangeText={setTitle} /><ChecklistCategoryPicker value={category} onChange={setCategory} categories={getChecklistCategoryNames(item.eventId)} /><AppInput label="ร้านหรือผู้รับผิดชอบ" value={responsible} onChangeText={setResponsible} placeholder="เช่น ร้านดอกไม้ ABC หรือ คุณมิว" /><DateInput label="วันครบกำหนด" value={dueDate} onChange={setDueDate} /><CurrencyInput label="จำนวนเงินที่ใช้ (บาท)" value={budget} onChangeText={setBudget} /><AppInput label="หมายเหตุ" value={note} onChangeText={setNote} multiline numberOfLines={4} style={styles.note} /><View style={styles.status}><Text style={styles.statusText}>สถานะงาน: {done ? 'เสร็จสิ้นแล้ว' : 'ยังไม่เสร็จ'}</Text><Switch value={done} onValueChange={setDone} trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }} thumbColor="#FFFFFF" /></View><AppButton title={saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'} disabled={saving} onPress={save} /><Pressable onPress={remove} style={styles.delete}><Text style={styles.deleteText}>ลบรายการนี้</Text></Pressable><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#FFFBF3' }, content: { padding: 22, paddingBottom: 30, gap: 14 }, notch: { width: 40, height: 4, borderRadius: 4, backgroundColor: Theme.colors.border, alignSelf: 'center', marginBottom: 4 }, title: { color: Theme.colors.text, fontSize: 20, fontWeight: '800' }, subtitle: { color: '#847892', fontSize: 13 }, note: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 }, status: { minHeight: 52, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, statusText: { color: Theme.colors.text, fontSize: 14, fontWeight: '600' }, delete: { minHeight: 52, borderWidth: 1, borderColor: Theme.colors.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, deleteText: { color: Theme.colors.primary, fontSize: 16, fontWeight: '700' }, empty: { color: Theme.colors.muted, textAlign: 'center', marginTop: 80 } });
