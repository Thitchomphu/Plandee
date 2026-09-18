import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Alert } from '@/components/AppDialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { EventPageHeader } from '@/components/EventPageHeader';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { addGuest, getGuest, type RSVPStatus, updateGuest } from '@/data/guests';

const statuses: { value: RSVPStatus; label: string }[] = [{ value: 'accepted', label: 'ตอบรับ' }, { value: 'pending', label: 'รอตอบรับ' }, { value: 'declined', label: 'ปฏิเสธ' }];
export default function GuestFormScreen() {
  const { eventId = '', guestId } = useLocalSearchParams<{ eventId?: string; guestId?: string }>();
  const existing = guestId ? getGuest(guestId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [group, setGroup] = useState(existing?.group ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [dietary, setDietary] = useState(existing?.dietary ?? '');
  const [rsvp, setRsvp] = useState<RSVPStatus>(existing?.rsvp ?? 'pending');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!name.trim() || !group.trim()) return Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อและความสัมพันธ์');
    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (cleanPhone && !/^0\d{8,9}$/.test(cleanPhone)) return Alert.alert('เบอร์โทรศัพท์ไม่ถูกต้อง', 'กรุณากรอกเบอร์โทรศัพท์ 9-10 หลักที่ขึ้นต้นด้วย 0');
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณาตรวจสอบรูปแบบอีเมล');
    setSaving(true);
    const base = { name: name.trim(), group: group.trim(), phone: cleanPhone, email: email.trim(), dietary: dietary.trim(), rsvp };
    const result = existing && guestId ? await updateGuest(guestId, base) : await addGuest({ ...base, eventId });
    setSaving(false);
    if (result.error) return Alert.alert('บันทึกข้อมูลไม่สำเร็จ', result.error.message);
    router.back();
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><EventPageHeader title={existing ? 'แก้ไขข้อมูลแขก' : 'เพิ่มแขก'} backLabel="กลับรายชื่อแขก" onBack={() => router.back()} /><Text style={styles.subtitle}>ชื่อและความสัมพันธ์เป็นข้อมูลที่จำเป็น</Text><AppInput label="ชื่อแขก *" value={name} onChangeText={setName} placeholder="เช่น กานต์ธิดา ใจดี" /><AppInput label="ความสัมพันธ์ *" value={group} onChangeText={setGroup} placeholder="เช่น ครอบครัวฝ่ายหญิง" /><Text style={styles.label}>สถานะ RSVP</Text><View style={styles.statuses}>{statuses.map((status) => <Pressable key={status.value} accessibilityRole="radio" accessibilityState={{ checked: rsvp === status.value }} onPress={() => setRsvp(status.value)} style={[styles.status, rsvp === status.value && styles.activeStatus]}><Text style={[styles.statusText, rsvp === status.value && styles.activeStatusText]}>{status.label}</Text></Pressable>)}</View><AppInput label="โทรศัพท์ (ไม่บังคับ)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08xxxxxxxx" /><AppInput label="อีเมล (ไม่บังคับ)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="guest@example.com" /><AppInput label="ข้อจำกัดด้านอาหาร (ไม่บังคับ)" value={dietary} onChangeText={setDietary} placeholder="เช่น มังสวิรัติ" /><AppButton title={saving ? 'กำลังบันทึก...' : existing ? 'บันทึกข้อมูล' : 'เพิ่มแขก'} disabled={saving} onPress={save} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: Theme.spacing.xl, paddingBottom: 36, gap: Theme.spacing.lg, backgroundColor: Theme.colors.background }, notch: { color: Theme.colors.border, fontSize: 28, lineHeight: 12, textAlign: 'center', marginBottom: 6 }, title: { color: Theme.colors.text, fontSize: 20, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: Theme.type.label, marginBottom: 2 }, label: { color: Theme.colors.text, fontSize: Theme.type.label, fontWeight: '600' }, statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, status: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderRadius: Theme.radius.pill, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }, activeStatus: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary }, statusText: { color: Theme.colors.muted, fontSize: Theme.type.label }, activeStatusText: { color: '#FFFFFF', fontWeight: '700' } });
