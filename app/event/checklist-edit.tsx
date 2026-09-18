import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
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
import { deleteChecklistItem, getChecklistItem, updateChecklistItem } from '@/data/checklists';
import { getChecklistCategoryNames } from '@/data/eventBudget';

export default function EditChecklistItemScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const item = getChecklistItem(id);
  const [title, setTitle] = useState(item?.title ?? '');
  const [category, setCategory] = useState(item?.category ?? 'อื่น ๆ');
  const [dueDate, setDueDate] = useState(item?.dueDate ?? '');
  const [budget, setBudget] = useState(item?.budget ? item.budget.toLocaleString('en-US') : '');
  const [assigneeName, setAssigneeName] = useState(item?.assigneeName ?? '');
  const [note, setNote] = useState(item?.note ?? '');
  const [done, setDone] = useState(item?.done ?? false);
  const [saving, setSaving] = useState(false);
  if (!item) return <SafeAreaView style={styles.safe}><Text style={styles.empty}>ไม่พบรายการเช็กลิสต์</Text></SafeAreaView>;
  const save = async () => {
    if (!title.trim() || !category) return Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อรายการและเลือกหมวดหมู่');
    if (assigneeName.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assigneeName.trim())) return Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณาตรวจสอบอีเมลผู้รับผิดชอบ');
    setSaving(true);
    const { error } = await updateChecklistItem(id, { title: title.trim(), category, dueDate, budget: currencyValue(budget), note: note.trim(), done, assigneeName: assigneeName.trim() });
    setSaving(false);
    if (error) return Alert.alert('บันทึกไม่สำเร็จ', error.message);
    router.back();
  };
  const remove = () => Alert.alert('ลบรายการนี้?', 'ข้อมูลรายการและงบประมาณที่เกี่ยวข้องจะถูกลบ', [{ text: 'ยกเลิก', style: 'cancel' }, { text: 'ลบรายการ', style: 'destructive', onPress: async () => { const { error } = await deleteChecklistItem(id); if (error) Alert.alert('ลบรายการไม่สำเร็จ', error.message); else router.back(); } }]);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <EventPageHeader title="แก้ไขรายการเช็กลิสต์" backLabel="กลับเช็กลิสต์" onBack={() => router.back()} />
    <Text style={styles.subtitle}>ปรับรายละเอียดงานและงบประมาณที่เกี่ยวข้อง</Text>
    <AppInput label="ชื่อรายการ" value={title} onChangeText={setTitle} />
    <ChecklistCategoryPicker value={category} onChange={setCategory} categories={getChecklistCategoryNames(item.eventId)} />
    <AppInput label="ผู้รับผิดชอบ (ชื่อหรืออีเมล)" value={assigneeName} onChangeText={setAssigneeName} placeholder="เช่น nui@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
    <Text style={styles.assigneeHint}>ใช้แสดงผู้รับผิดชอบ ยังไม่ได้ส่งคำเชิญทางอีเมล</Text>
    <DateInput label="วันครบกำหนด" value={dueDate} onChange={setDueDate} />
    <CurrencyInput label="งบที่คาดว่าจะใช้ (บาท)" value={budget} onChangeText={setBudget} />
    <AppInput label="หมายเหตุ" value={note} onChangeText={setNote} multiline numberOfLines={4} style={styles.note} />
    <View style={styles.status}><Text style={styles.statusText}>สถานะงาน: {done ? 'เสร็จสิ้นแล้ว' : 'ยังไม่เสร็จ'}</Text><Switch value={done} onValueChange={setDone} trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }} thumbColor="#FFFFFF" /></View>
    <AppButton title={saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'} disabled={saving} onPress={save} />
    <Pressable onPress={remove} style={styles.delete}><Text style={styles.deleteText}>ลบรายการนี้</Text></Pressable>
    <AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" />
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: Theme.spacing.xl, paddingBottom: 36, gap: Theme.spacing.lg }, notch: { width: 40, height: 4, borderRadius: 4, backgroundColor: Theme.colors.border, alignSelf: 'center', marginBottom: 4 }, title: { color: Theme.colors.text, fontSize: 20, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: Theme.type.label }, assigneeHint: { color: Theme.colors.muted, fontSize: Theme.type.caption, marginTop: -10 }, note: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 }, status: { minHeight: 52, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, statusText: { color: Theme.colors.text, fontSize: Theme.type.label, fontWeight: '600' }, delete: { minHeight: 52, borderWidth: 1, borderColor: Theme.colors.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, deleteText: { color: Theme.colors.primary, fontSize: 16, fontWeight: '700' }, empty: { color: Theme.colors.muted, textAlign: 'center', marginTop: 80, fontSize: Theme.type.body } });
