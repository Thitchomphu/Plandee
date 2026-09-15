import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type Profile = { displayName: string; occupation: string; email: string };
const menuItems = [
  { icon: '👤', label: 'ข้อมูลบัญชี' },
  { icon: '🏪', label: 'seller ที่บันทึกไว้' },
  { icon: '🔔', label: 'การแจ้งเตือน' },
  { icon: '⚙️', label: 'ตั้งค่า' },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({ displayName: '', occupation: '', email: '' });
  useFocusEffect(useCallback(() => {
    let active = true;
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;
      const { data } = await supabase.from('profiles').select('display_name,occupation').eq('id', user.id).maybeSingle();
      if (active) setProfile({ displayName: (data as { display_name?: string | null } | null)?.display_name ?? user.user_metadata?.display_name ?? '', occupation: (data as { occupation?: string | null } | null)?.occupation ?? '', email: user.email ?? '' });
    })();
    return () => { active = false; };
  }, []));

  const displayName = profile.displayName || profile.email.split('@')[0] || 'ผู้ใช้ใหม่';
  const initials = displayName.slice(0, 1).toUpperCase();
  const logout = async () => { await supabase.auth.signOut(); router.replace('/login'); };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>โปรไฟล์</Text>
    <View style={styles.bio}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><View style={styles.bioText}><Text style={styles.name}>{displayName}</Text><Text style={styles.role}>{profile.occupation || profile.email || 'ยังไม่ได้ระบุอาชีพ'}</Text></View></View>
    <View style={styles.menu}>{menuItems.map((item) => <Pressable key={item.label} accessibilityRole="button" onPress={() => {}} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}><Text style={styles.menuLabel}>{item.icon}   {item.label}</Text><Text style={styles.chevron}>›</Text></Pressable>)}</View>
    <Pressable accessibilityRole="button" onPress={logout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}><Text style={styles.logoutText}>ออกจากระบบ</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 112, gap: 20 }, title: { color: Theme.colors.text, fontSize: 24, fontWeight: '800' }, bio: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 22, padding: 20, elevation: 1 }, avatar: { width: 60, height: 56, borderRadius: 100, borderWidth: 1.5, borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: Theme.colors.primary, fontSize: 18, fontWeight: '700' }, bioText: { flex: 1, gap: 4 }, name: { color: Theme.colors.text, fontSize: 16, fontWeight: '700' }, role: { color: Theme.colors.muted, fontSize: 12 }, menu: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 22, overflow: 'hidden' }, menuItem: { minHeight: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EAE6F0' }, menuLabel: { color: Theme.colors.text, fontSize: 14 }, chevron: { color: Theme.colors.muted, fontSize: 28, lineHeight: 28 }, logout: { minHeight: 52, borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.primary, backgroundColor: Theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, logoutText: { color: Theme.colors.primary, fontSize: 15, fontWeight: '700' }, pressed: { opacity: 0.75 } });
