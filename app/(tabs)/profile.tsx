import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';

const menuItems = [
  { icon: '👤', label: 'ข้อมูลบัญชี' },
{ icon: '🧾', label: 'seller ที่บันทึกไว้' },
  { icon: '🔔', label: 'การแจ้งเตือน' },
  { icon: '⚙️', label: 'ตั้งค่า' },
];

export default function ProfileScreen() {
  const logout = () => { router.replace('/login'); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>โปรไฟล์</Text><View style={styles.bio}><View style={styles.avatar}><Text style={styles.avatarText}>มิว</Text></View><View style={styles.bioText}><Text style={styles.name}>มิว นิค</Text><Text style={styles.role}>Event Planner Freelance</Text></View></View><View style={styles.menu}>{menuItems.map((item) => <Pressable key={item.label} accessibilityRole="button" onPress={() => {}} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}><Text style={styles.menuLabel}>{item.icon}   {item.label}</Text><Text style={styles.chevron}>›</Text></Pressable>)}</View><Pressable accessibilityRole="button" onPress={logout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}><Text style={styles.logoutText}>ออกจากระบบ</Text></Pressable></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 112, gap: 20 }, title: { color: Theme.colors.text, fontSize: 24, fontWeight: '800' }, bio: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 22, padding: 20, shadowColor: '#2B2233', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 1 }, avatar: { width: 60, height: 56, borderRadius: 100, borderWidth: 1.5, borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: Theme.colors.primary, fontSize: 18, fontWeight: '700' }, bioText: { flex: 1, gap: 4 }, name: { color: Theme.colors.text, fontSize: 16, fontWeight: '700' }, role: { color: Theme.colors.muted, fontSize: 12 }, menu: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 22, overflow: 'hidden' }, menuItem: { minHeight: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EAE6F0' }, menuLabel: { color: Theme.colors.text, fontSize: 14 }, chevron: { color: Theme.colors.muted, fontSize: 26, lineHeight: 26 }, logout: { minHeight: 52, borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.primary, backgroundColor: Theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, logoutText: { color: Theme.colors.primary, fontSize: 15, fontWeight: '700' }, pressed: { opacity: 0.75 } });
