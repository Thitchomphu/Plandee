import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { EventPageHeader } from '@/components/EventPageHeader';
import { CurrencyInput, currencyValue } from '@/components/CurrencyInput';
import { DateInput } from '@/components/DateInput';
import { VenueInput } from '@/components/VenueInput';
import { SelectMark } from '@/components/SelectMark';
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

export default function NewEventScreen() {
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [type, setType] = useState(eventTypes[0]);
  const [eventDate, setEventDate] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [savedWithoutReload, setSavedWithoutReload] = useState(false);
  const templates = useMemo(() => templatesByType[type], [type]);
  const [selected, setSelected] = useState<string[]>(templates.map((item) => item.id));

  const chooseType = (value: string) => { setType(value); setSelected(templatesByType[value].map((item) => item.id)); };
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const submit = async () => {
    if (submitting || savedWithoutReload) return;
    const parsedBudget = currencyValue(budget);
    if (!title.trim() || !venue.trim() || !eventDate || !parsedBudget || parsedBudget <= 0) {
      setSubmitError('กรุณากรอกชื่องาน สถานที่ เลือกวันที่ และงบประมาณเป็นตัวเลขบวก');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    const eventDateValue = eventDate;
    try {
      const result = await createEventWithChecklist({ title: title.trim(), kind: type, eventDate: eventDateValue, venue: venue.trim(), budget: parsedBudget, checklist: templates.filter((item) => selected.includes(item.id)).map((item) => ({ title: item.title, category: item.category, dueDate: eventDateValue })) });
      if (result.error) { setSubmitError(`บันทึกไม่สำเร็จ: ${result.error.message}`); return; }
      if (!result.event && result.saved) {
        setSavedWithoutReload(true);
        setSubmitError('บันทึกงานใน Supabase แล้ว แต่แอปโหลดงานกลับมาไม่สำเร็จ อย่ากดสร้างซ้ำ กรุณาไปที่หน้างานของฉันแล้วลองโหลดใหม่');
        return;
      }
      if (!result.event) { setSubmitError('ไม่สามารถยืนยันการบันทึกงานได้ กรุณาลองใหม่อีกครั้ง'); return; }
      router.replace({ pathname: '/event/[id]', params: { id: result.event.id } });
    } catch {
      setSubmitError('เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบรายการงานก่อนกดสร้างซ้ำ');
    } finally {
      setSubmitting(false);
    }
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <EventPageHeader title="สร้างงาน" backLabel="ยกเลิกการสร้างงาน" onBack={() => router.back()} />
    <View style={styles.tip}><Text style={styles.tipIcon}>💡</Text><View style={styles.tipText}><Text style={styles.tipTitle}>เริ่มต้นด้วยเช็กลิสต์ที่เหมาะกับงาน</Text><Text style={styles.tipBody}>เลือกประเภทงาน แล้วเลือกเฉพาะรายการที่ต้องการใช้ได้ทันที</Text></View></View>
    <AppInput label="ชื่องาน" value={title} onChangeText={setTitle} placeholder="กรอกชื่องาน" />
    <VenueInput value={venue} onChangeText={setVenue} />
    <Text style={styles.label}>ประเภทงาน</Text><View style={styles.types}>{eventTypes.map((item) => <Pressable key={item} onPress={() => chooseType(item)} style={[styles.type, item === type && styles.typeActive]}><Text style={[styles.typeText, item === type && styles.typeTextActive]}>{item}</Text></Pressable>)}</View>
    <DateInput label="วันที่จัดงาน" value={eventDate} onChange={setEventDate} minimumDate={new Date()} />
    <CurrencyInput label="งบประมาณ (บาท)" value={budget} onChangeText={setBudget} placeholder="เช่น 150,000" />
    <View style={styles.checklistHeader}><Text style={styles.label}>เช็กลิสต์เบื้องต้น</Text><Text style={styles.selected}>{selected.length}/{templates.length} รายการ</Text></View>
    <View style={styles.checklist}>{templates.map((item) => <Pressable key={item.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected.includes(item.id) }} onPress={() => toggle(item.id)} style={styles.checkItem}><SelectMark selected={selected.includes(item.id)} size={26} /><View style={styles.checkText}><Text style={styles.checkTitle}>{item.title}</Text><Text style={styles.checkMeta}>{item.category}</Text></View></Pressable>)}</View>
    {submitError ? <Text accessibilityRole="alert" style={{ color: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft, borderRadius: 12, padding: 14, fontSize: 14 }}>{submitError}</Text> : null}
    <AppButton title={submitting ? 'กำลังสร้างงาน...' : 'สร้างงาน'} onPress={submit} disabled={submitting || savedWithoutReload} />
    {savedWithoutReload ? <AppButton title="ไปที่งานของฉัน" variant="outline" onPress={() => router.replace('/events')} /> : null}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.xl, paddingBottom: 40, gap: Theme.spacing.lg },
  tip: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: Theme.colors.primarySoft, borderWidth: 1, borderColor: Theme.colors.primary, borderRadius: 20 },
  tipIcon: { fontSize: 22 }, tipText: { flex: 1, gap: 6 },
  tipTitle: { color: Theme.colors.primary, fontSize: Theme.type.body, fontWeight: '700' },
  tipBody: { color: Theme.colors.text, fontSize: Theme.type.label, lineHeight: 21 },
  label: { color: Theme.colors.muted, fontSize: Theme.type.label, fontWeight: '600' },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  type: { minHeight: 44, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface, borderRadius: 100, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  typeActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  typeText: { color: Theme.colors.muted, fontSize: Theme.type.label }, typeTextActive: { color: '#FFFFFF', fontWeight: '700' },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  selected: { color: Theme.colors.primary, fontSize: Theme.type.caption, fontWeight: '700' },
  checklist: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 18, padding: 12, gap: 10 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  checkText: { flex: 1, gap: 2 }, checkTitle: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '600' }, checkMeta: { color: Theme.colors.muted, fontSize: Theme.type.caption },
});
