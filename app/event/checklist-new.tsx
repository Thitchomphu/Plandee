import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { Theme } from '@/constants/theme';
import { addChecklistItem, ChecklistCategory } from '@/data/checklists';

export default function NewChecklistItemScreen() {
  const { eventId = '' } = useLocalSearchParams<{ eventId?: string }>();
  const [title, setTitle] = useState(''); const [category, setCategory] = useState('อาหาร'); const [dueDate, setDueDate] = useState(''); const [budget, setBudget] = useState(''); const [note, setNote] = useState('');
  const submit = () => { if (!title.trim() || !dueDate.trim()) { Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อรายการและวันครบกำหนด'); return; } addChecklistItem({ eventId, title: title.trim(), category: (['สถานที่', 'อาหาร', 'ตกแต่ง', 'อื่น ๆ'].includes(category) ? category : 'อื่น ๆ') as ChecklistCategory, dueDate: dueDate.trim(), budget: Number(budget.replace(/[^0-9]/g, '')) || 0, note: note.trim(), done: false }); router.back(); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ ยกเลิก</Text></Pressable><Text style={styles.title}>เพิ่มรายการเช็คลิสต์</Text><Text style={styles.subtitle}>ใส่รายละเอียดงานและค่าใช้จ่ายที่เกี่ยวข้อง</Text><AppInput label="ชื่อรายการ" value={title} onChangeText={setTitle} placeholder="เช่น จองรถตกแต่งดอกไม้" /><AppInput label="หมวดหมู่" value={category} onChangeText={setCategory} placeholder="สถานที่ / อาหาร / ตกแต่ง" /><Text style={styles.fieldHint}>กำหนดการและงบประมาณ</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.columns}><AppInput label="วันครบกำหนด" value={dueDate} onChangeText={setDueDate} placeholder="เลือกวันที่" containerStyle={styles.column} /><AppInput label="งบประมาณ (บาท)" value={budget} onChangeText={setBudget} keyboardType="number-pad" placeholder="0" containerStyle={styles.column} /></ScrollView><AppInput label="หมายเหตุ" value={note} onChangeText={setNote} placeholder="ระบุรายละเอียดเพิ่มเติม..." multiline numberOfLines={4} style={styles.note} /><AppButton title="เพิ่มรายการ" onPress={submit} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#FFFBF3' }, content: { padding: 22, paddingBottom: 30, gap: 14, borderTopLeftRadius: 28, borderTopRightRadius: 28 }, back: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600', minHeight: 36 }, title: { color: Theme.colors.text, fontSize: 22, fontWeight: '800' }, subtitle: { color: '#847892', fontSize: 13 }, fieldHint: { color: '#847892', fontSize: 13, fontWeight: '600', marginTop: 4 }, columns: { gap: 12 }, column: { width: 165 }, note: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 } });
