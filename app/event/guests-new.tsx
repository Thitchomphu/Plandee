import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { Theme } from '@/constants/theme';
import { addGuest, getGuest, RSVPStatus, updateGuest } from '@/data/guests';

export default function GuestFormScreen() {
  const { eventId = '', guestId } = useLocalSearchParams<{ eventId?: string; guestId?: string }>();
  const existing = guestId ? getGuest(guestId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [group, setGroup] = useState(existing?.group ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [dietary, setDietary] = useState(existing?.dietary ?? 'ไม่มี');

  const save = () => {
    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (!name.trim() || !group.trim() || !cleanPhone || !email.trim()) return Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกชื่อ กลุ่ม โทรศัพท์ และอีเมล');
    if (!/^0\d{8,9}$/.test(cleanPhone)) return Alert.alert('เบอร์โทรศัพท์ไม่ถูกต้อง', 'กรุณากรอกเบอร์โทรศัพท์ 9-10 หลักที่ขึ้นต้นด้วย 0');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณาตรวจสอบรูปแบบอีเมล');
    const base = { name: name.trim(), group: group.trim(), phone: cleanPhone, email: email.trim(), dietary: dietary.trim() || 'ไม่มี' };
    if (existing && guestId) updateGuest(guestId, base); else addGuest({ ...base, eventId, rsvp: 'pending' as RSVPStatus });
    router.back();
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text style={styles.notch}>—</Text><Text style={styles.title}>{existing ? 'แก้ไขข้อมูลแขก' : 'เพิ่มแขก'}</Text><Text style={styles.subtitle}>{existing ? 'ปรับข้อมูลติดต่อและข้อจำกัดด้านอาหาร' : 'เพิ่มรายละเอียดแขกสำหรับงานนี้'}</Text><AppInput label="ชื่อแขก" value={name} onChangeText={setName} placeholder="เช่น กานต์ธิดา ใจดี" /><AppInput label="กลุ่มความสัมพันธ์" value={group} onChangeText={setGroup} placeholder="เช่น ครอบครัวฝ่ายหญิง" /><AppInput label="โทรศัพท์" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08xxxxxxxx" /><AppInput label="อีเมล" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="guest@example.com" /><AppInput label="ข้อจำกัดด้านอาหาร" value={dietary} onChangeText={setDietary} placeholder="เช่น มังสวิรัติ / ไม่มี" /><AppButton title={existing ? 'บันทึกข้อมูล' : 'เพิ่มแขก'} onPress={save} /><AppButton title="ยกเลิก" onPress={() => router.back()} variant="outline" /></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 22, paddingBottom: 36, gap: 14, backgroundColor: '#FFFBF3', borderTopLeftRadius: 28, borderTopRightRadius: 28 }, notch: { color: Theme.colors.border, fontSize: 28, lineHeight: 12, textAlign: 'center', marginBottom: 6 }, title: { color: Theme.colors.text, fontSize: 20, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 13, marginBottom: 2 } });
