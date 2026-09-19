import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@/components/AppDialog';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { CurrencyInput, currencyValue } from '@/components/CurrencyInput';
import { DateInput } from '@/components/DateInput';
import { EventPageHeader } from '@/components/EventPageHeader';
import { VenueInput } from '@/components/VenueInput';
import { Theme } from '@/constants/theme';
import { events, updateEvent } from '@/data/events';

const eventTypes = ['งานแต่งงาน', 'งานสัมมนา', 'วันเกิด', 'งานเปิดตัว'];

export default function EditEventScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const event = events.find((item) => item.id === id);
  const [title, setTitle] = useState(event?.title ?? '');
  const [venue, setVenue] = useState(event?.venue ?? '');
  const [kind, setKind] = useState(event?.kind ?? eventTypes[0]);
  const [eventDate, setEventDate] = useState(event?.eventDate ?? '');
  const [budget, setBudget] = useState(event?.budget ? event.budget.toLocaleString('en-US') : '');
  const [saving, setSaving] = useState(false);

  if (!event) return <SafeAreaView style={styles.safe}><EventPageHeader title="แก้ไขอีเวนต์" backLabel="กลับ" onBack={() => router.back()} /><AppButton title="กลับไปอีเวนต์" onPress={() => router.replace('/events')} /></SafeAreaView>;

  const save = async () => {
    const parsedBudget = currencyValue(budget);
    if (!title.trim() || !venue.trim() || !eventDate || !parsedBudget || parsedBudget <= 0) return Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อ สถานที่ วันที่ และงบประมาณให้ครบ');
    setSaving(true);
    const result = await updateEvent(event.id, { title: title.trim(), kind, eventDate, venue: venue.trim(), budget: parsedBudget });
    setSaving(false);
    if (result.error) return Alert.alert('แก้ไขอีเวนต์ไม่สำเร็จ', result.error.message);
    Alert.alert('บันทึกสำเร็จ', 'แก้ไขข้อมูลอีเวนต์เรียบร้อยแล้ว', [{ text: 'ตกลง', onPress: () => router.back() }]);
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <EventPageHeader title="แก้ไขอีเวนต์" backLabel="กลับภาพรวมอีเวนต์" onBack={() => router.back()} />
    <AppInput label="ชื่ออีเวนต์" value={title} onChangeText={setTitle} />
    <VenueInput value={venue} onChangeText={setVenue} />
    <AppInput label="ประเภทอีเวนต์" value={kind} onChangeText={setKind} placeholder="เช่น งานสัมมนา" />
    <DateInput label="วันที่จัดอีเวนต์" value={eventDate} onChange={setEventDate} />
    <CurrencyInput label="งบประมาณ (บาท)" value={budget} onChangeText={setBudget} />
    <AppButton title={saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'} onPress={() => { void save(); }} disabled={saving} />
    <AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" disabled={saving} />
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: Theme.spacing.xl, paddingBottom: 40, gap: Theme.spacing.lg } });
