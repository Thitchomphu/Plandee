import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { CurrencyInput, currencyValue } from '@/components/CurrencyInput';
import { Theme } from '@/constants/theme';
import { ChecklistCategory } from '@/data/checklists';
import { createEventWithChecklist } from '@/data/events';

type Template = { id: string; title: string; category: ChecklistCategory };
const eventTypes = ['งานแต่งงาน', 'งานสัมมนา', 'วันเกิด', 'งานเปิดตัว'];
const templatesByType: Record<string, Template[]> = {
  งานแต่งงาน: [{ id: 'wedding-venue', title: 'เลือกสถานที่จัดงาน', category: 'สถานที่' }, { id: 'wedding-food', title: 'เลือกเมนูอาหารและเครื่องดื่ม', category: 'อาหาร' }, { id: 'wedding-decor', title: 'สรุปแบบตกแต่งสถานที่', category: 'ตกแต่ง' }],
  งานสัมมนา: [{ id: 'seminar-venue', title: 'จองห้องประชุม', category: 'สถานที่' }, { id: 'seminar-food', title: 'จัดเตรียมอาหารว่าง', category: 'อาหาร' }, { id: 'seminar-materials', title: 'เตรียมเอกสารและอุปกรณ์', category: 'อื่น ๆ' }],
  วันเกิด: [{ id: 'birthday-venue', title: 'เลือกสถานที่จัดปาร์ตี้', category: 'สถานที่' }, { id: 'birthday-food', title: 'สั่งอาหารและเค้ก', category: 'อาหาร' }, { id: 'birthday-decor', title: 'เตรียมของตกแต่ง', category: 'ตกแต่ง' }],
  งานเปิดตัว: [{ id: 'launch-venue', title: 'ยืนยันสถานที่เปิดตัว', category: 'สถานที่' }, { id: 'launch-materials', title: 'เตรียมสื่อประชาสัมพันธ์', category: 'อื่น ๆ' }, { id: 'launch-decor', title: 'จัดเตรียมเวทีและตกแต่ง', category: 'ตกแต่ง' }],
};

const dateForDatabase = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dateForDisplay = (date: Date) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

export default function NewEventScreen() {
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [type, setType] = useState(eventTypes[0]);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const templates = useMemo(() => templatesByType[type], [type]);
  const [selected, setSelected] = useState<string[]>(templates.map((item) => item.id));

  const chooseType = (value: string) => { setType(value); setSelected(templatesByType[value].map((item) => item.id)); };
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const selectDate = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) setEventDate(selectedDate);
  };
  const submit = async () => {
    const parsedBudget = currencyValue(budget);
    if (!title.trim() || !venue.trim() || !eventDate || !parsedBudget || parsedBudget <= 0) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่องาน สถานที่ เลือกวันที่ และงบประมาณเป็นตัวเลขบวก');
      return;
    }
    setSubmitting(true);
    const eventDateValue = dateForDatabase(eventDate);
    const result = await createEventWithChecklist({ title: title.trim(), kind: type, eventDate: eventDateValue, venue: venue.trim(), budget: parsedBudget, checklist: templates.filter((item) => selected.includes(item.id)).map((item) => ({ title: item.title, category: item.category, dueDate: eventDateValue })) });
    setSubmitting(false);
    if (result.error || !result.event) {
      Alert.alert('สร้างงานไม่สำเร็จ', result.error?.message ?? 'กรุณาลองใหม่อีกครั้ง');
      return;
    }
    router.replace({ pathname: '/event/[id]', params: { id: result.event.id } });
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><Text style={styles.title}>สร้างงาน</Text><Pressable onPress={() => router.back()}><Text style={styles.cancel}>ยกเลิก</Text></Pressable></View>
    <View style={styles.tip}><Text style={styles.tipIcon}>💡</Text><View style={styles.tipText}><Text style={styles.tipTitle}>เริ่มต้นด้วยเช็กลิสต์ที่เหมาะกับงาน</Text><Text style={styles.tipBody}>เลือกประเภทงาน แล้วเลือกเฉพาะรายการที่ต้องการใช้ได้ทันที</Text></View></View>
    <AppInput label="ชื่องาน" value={title} onChangeText={setTitle} placeholder="กรอกชื่องาน" />
    <AppInput label="สถานที่จัดงาน" value={venue} onChangeText={setVenue} placeholder="เช่น โรงแรม หรือสถานที่จัดงาน" />
    <Text style={styles.label}>ประเภทงาน</Text><View style={styles.types}>{eventTypes.map((item) => <Pressable key={item} onPress={() => chooseType(item)} style={[styles.type, item === type && styles.typeActive]}><Text style={[styles.typeText, item === type && styles.typeTextActive]}>{item}</Text></Pressable>)}</View>
    <Text style={styles.label}>วันที่จัดงาน</Text><Pressable accessibilityRole="button" accessibilityLabel="เลือกวันที่จัดงาน" onPress={() => setShowPicker(true)} style={styles.dateField}><Text style={[styles.dateValue, !eventDate && styles.placeholder]}>{eventDate ? dateForDisplay(eventDate) : 'เลือกวันที่จากปฏิทิน'}</Text><Text style={styles.calendar}>📅</Text></Pressable>
    {showPicker ? <DateTimePicker value={eventDate ?? new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={selectDate} minimumDate={new Date()} /> : null}
    {showPicker && Platform.OS === 'ios' ? <AppButton title="ยืนยันวันที่" onPress={() => setShowPicker(false)} variant="outline" /> : null}
    <CurrencyInput label="งบประมาณ (บาท)" value={budget} onChangeText={setBudget} placeholder="เช่น 150,000" />
    <View style={styles.checklistHeader}><Text style={styles.label}>เช็กลิสต์เบื้องต้น</Text><Text style={styles.selected}>{selected.length}/{templates.length} รายการ</Text></View>
    <View style={styles.checklist}>{templates.map((item) => <Pressable key={item.id} onPress={() => toggle(item.id)} style={styles.checkItem}><Text style={[styles.checkbox, selected.includes(item.id) && styles.checkboxActive]}>{selected.includes(item.id) ? '✓' : ''}</Text><View style={styles.checkText}><Text style={styles.checkTitle}>{item.title}</Text><Text style={styles.checkMeta}>{item.category}</Text></View></Pressable>)}</View>
    <AppButton title={submitting ? 'กำลังสร้างงาน...' : 'สร้างงาน'} onPress={submit} disabled={submitting} />
    <AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" />
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 24, paddingBottom: 40, gap: 14 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 42 }, title: { color: Theme.colors.text, fontSize: 26, fontWeight: '800' }, cancel: { color: Theme.colors.primary, fontSize: 14, fontWeight: '700' }, tip: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#FDE3EA', borderWidth: 1, borderColor: Theme.colors.primary, borderRadius: 20 }, tipIcon: { fontSize: 22 }, tipText: { flex: 1, gap: 4 }, tipTitle: { color: Theme.colors.primary, fontSize: 14, fontWeight: '700' }, tipBody: { color: Theme.colors.text, fontSize: 12, lineHeight: 18 }, label: { color: Theme.colors.muted, fontSize: 13, fontWeight: '600' }, types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, type: { borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 9 }, typeActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary }, typeText: { color: Theme.colors.muted, fontSize: 13 }, typeTextActive: { color: '#FFFFFF', fontWeight: '700' }, dateField: { minHeight: 52, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, dateValue: { color: Theme.colors.text, fontSize: 14 }, placeholder: { color: Theme.colors.placeholder }, calendar: { fontSize: 18 }, checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }, selected: { color: Theme.colors.primary, fontSize: 12, fontWeight: '700' }, checklist: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 18, padding: 12, gap: 10 }, checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }, checkbox: { width: 22, height: 22, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 6, textAlign: 'center', color: '#FFFFFF', backgroundColor: Theme.colors.surface }, checkboxActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary }, checkText: { flex: 1, gap: 2 }, checkTitle: { color: Theme.colors.text, fontSize: 14, fontWeight: '600' }, checkMeta: { color: Theme.colors.muted, fontSize: 11 } });
