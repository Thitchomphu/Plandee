import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Alert } from '@/components/AppDialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { getChecklistItems } from '@/data/checklists';
import { clearScheduledTaskReminders, disableTaskReminders, enableTaskReminders, isTaskReminderEnabled } from '@/lib/taskNotifications';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [savedName, setSavedName] = useState('');
  const [savedOccupation, setSavedOccupation] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;
      if (!active) return;
      if (userError || !user) { setLoading(false); return; }
      const { data } = await supabase.from('profiles').select('display_name,occupation').eq('id', user.id).maybeSingle();
      if (!active) return;
      setEmail(user.email ?? '');
      const name = (data as { display_name?: string | null } | null)?.display_name ?? user.user_metadata?.display_name ?? '';
      const role = (data as { occupation?: string | null } | null)?.occupation ?? '';
      setDisplayName(name); setSavedName(name);
      setOccupation(role); setSavedOccupation(role);
      const enabled = await isTaskReminderEnabled().catch(() => false);
      if (!active) return;
      setReminderEnabled(enabled);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []));

  const save = async () => {
    if (saving) return;
    if (!displayName.trim()) { Alert.alert('กรุณาระบุชื่อที่แสดง'); return; }
    setSaving(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData.user;
    if (userError || !user) { setSaving(false); Alert.alert('บันทึกไม่ได้', 'กรุณาเข้าสู่ระบบใหม่'); return; }
    const { error } = await supabase.from('profiles').upsert({ id: user.id, display_name: displayName.trim(), occupation: occupation.trim() || null }, { onConflict: 'id' });
    setSaving(false);
    if (error) { Alert.alert('บันทึกไม่สำเร็จ', 'กรุณาลองอีกครั้ง'); return; }
    setDisplayName(displayName.trim());
    setSavedName(displayName.trim());
    setSavedOccupation(occupation.trim());
    setEditing(false);
  };

  const confirmLogout = () => Alert.alert('ออกจากระบบ?', 'คุณสามารถกลับมาเข้าสู่ระบบได้ทุกเมื่อ', [
    { text: 'ยกเลิก', style: 'cancel' },
    { text: 'ออกจากระบบ', style: 'destructive', onPress: () => { void (async () => {
      const { error } = await supabase.auth.signOut();
      if (error) Alert.alert('ออกจากระบบไม่สำเร็จ', 'กรุณาลองอีกครั้ง');
      else { await clearScheduledTaskReminders(); router.replace('/'); }
    })(); } },
  ]);

  const setReminder = async (enabled: boolean) => {
    if (reminderBusy) return;
    setReminderBusy(true);
    try {
      if (enabled) {
        const allowed = await enableTaskReminders(getChecklistItems());
        if (!allowed) Alert.alert('ยังเปิดการแจ้งเตือนไม่ได้', 'กรุณาอนุญาตการแจ้งเตือนในตั้งค่าของโทรศัพท์');
        setReminderEnabled(allowed);
      } else {
        await disableTaskReminders();
        setReminderEnabled(false);
      }
    } catch {
      Alert.alert('ตั้งค่าการเตือนไม่สำเร็จ', 'กรุณาลองอีกครั้ง');
    } finally {
      setReminderBusy(false);
    }
  };

  const name = displayName.trim() || email.split('@')[0] || 'ผู้ใช้ใหม่';
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>โปรไฟล์</Text>
    {loading ? <ActivityIndicator color={Theme.colors.primary} style={styles.loader} /> : <>
      <LinearGradient colors={Theme.gradients.soft} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bio}><View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View><View style={styles.bioText}><Text style={styles.name}>{name}</Text><Text style={styles.role}>{occupation || 'ยังไม่ได้ระบุอาชีพ'}</Text></View></LinearGradient>
      <View style={styles.card}><Text style={styles.sectionTitle}>ข้อมูลบัญชี</Text>
        {editing ? <><AppInput label="ชื่อที่แสดง" value={displayName} onChangeText={setDisplayName} placeholder="ชื่อของคุณ" /><AppInput label="อาชีพ (ไม่บังคับ)" value={occupation} onChangeText={setOccupation} placeholder="เช่น นักศึกษา" /><AppButton title={saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'} disabled={saving} onPress={save} /><AppButton title="ยกเลิก" variant="ghost" disabled={saving} onPress={() => { setDisplayName(savedName); setOccupation(savedOccupation); setEditing(false); }} /></> : <><Text style={styles.fieldLabel}>อีเมล</Text><Text style={styles.fieldValue}>{email}</Text><Text style={styles.fieldLabel}>อาชีพ</Text><Text style={styles.fieldValue}>{occupation || 'ยังไม่ได้ระบุ'}</Text><AppButton title="แก้ไขโปรไฟล์" variant="outline" onPress={() => setEditing(true)} /></>}
      </View>
      <View style={styles.card}><View style={styles.reminderRow}><View style={styles.reminderCopy}><Text style={styles.sectionTitle}>เตือนงานใกล้ครบกำหนด</Text><Text style={styles.reminderHint}>แจ้งเตือนบนเครื่องก่อนครบกำหนด 1 วัน เวลา 09:00 น. หากเปิดช้า จะเตือนเช้าวันครบกำหนดแทน</Text></View><Switch accessibilityLabel="เตือนงานใกล้ครบกำหนด" value={reminderEnabled} disabled={reminderBusy} onValueChange={(enabled) => { void setReminder(enabled); }} trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }} thumbColor="#FFFFFF" /></View></View>
      <Pressable accessibilityRole="button" accessibilityLabel="ออกจากระบบ" onPress={confirmLogout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}><Text style={styles.logoutText}>ออกจากระบบ</Text></Pressable>
    </>}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 112, gap: 20 },
  title: { color: Theme.colors.text, fontSize: Theme.type.page, fontWeight: '800' },
  loader: { marginTop: 48 },
  bio: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Theme.colors.surface, borderRadius: 22, padding: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Theme.colors.primary, fontSize: 22, fontWeight: '700' },
  bioText: { flex: 1, gap: 4 }, name: { color: Theme.colors.text, fontSize: 19, fontWeight: '700' }, role: { color: Theme.colors.muted, fontSize: 14 },
  card: { backgroundColor: Theme.colors.surface, borderRadius: 22, padding: 20, gap: 12 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, reminderCopy: { flex: 1, gap: 5 }, reminderHint: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  sectionTitle: { color: Theme.colors.text, fontSize: 18, fontWeight: '700' },
  fieldLabel: { color: Theme.colors.muted, fontSize: 13 }, fieldValue: { color: Theme.colors.text, fontSize: 16 },
  logout: { minHeight: 52, borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.primary, backgroundColor: Theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: Theme.colors.primary, fontSize: 16, fontWeight: '700' }, pressed: { opacity: 0.75 },
});
