import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

const logo = 'https://www.figma.com/api/mcp/asset/6ad74f85-16cd-4ecb-9afc-97cd39b47b81.svg';

export default function LoginScreen() {
  const [email, setEmail] = useState('student@example.com'); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const submit = () => { if (!email.trim() || !password.trim()) { setError('กรุณากรอกอีเมลและรหัสผ่าน'); return; } setError(''); router.replace('/(tabs)'); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.header}><Image source={logo} style={styles.logo} contentFit="contain" /><Text style={styles.brand}>Plandee</Text><Text style={styles.subtitle}>วางแผนอีเวนต์ในฝันของคุณ</Text></View><View style={styles.tabs}><View style={styles.tabActive}><Text style={styles.activeText}>เข้าสู่ระบบ</Text><View style={styles.indicator} /></View><Pressable onPress={() => router.replace('/register')} style={styles.tab}><Text style={styles.inactiveText}>สมัครสมาชิก</Text></Pressable></View><View style={styles.form}><AppInput label="อีเมล" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="student@example.com" /><AppInput label="รหัสผ่าน" value={password} onChangeText={setPassword} secureTextEntry placeholder="รหัสผ่าน" error={error} /><Text style={styles.forgot}>ลืมรหัสผ่าน?</Text></View><View style={styles.actions}><AppButton title="เข้าสู่ระบบ" onPress={submit} /><View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>หรือ</Text><View style={styles.line} /></View><AppButton title="ดำเนินการต่อด้วย Google" onPress={() => {}} variant="outline" /><Text style={styles.terms}>โดยการดำเนินการต่อ แสดงว่าคุณยอมรับ ข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว</Text></View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.surface }, content: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 24, gap: 24 }, header: { alignItems: 'center', gap: 8 }, logo: { width: 80, height: 80 }, brand: { color: Theme.colors.primary, fontSize: 28, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 14 }, tabs: { flexDirection: 'row' }, tab: { flex: 1, alignItems: 'center', paddingVertical: 8 }, tabActive: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 4 }, activeText: { color: Theme.colors.primary, fontSize: 18, fontWeight: '700' }, inactiveText: { color: Theme.colors.placeholder, fontSize: 18, fontWeight: '700' }, indicator: { width: '100%', height: 3, backgroundColor: Theme.colors.primary, borderRadius: 2 }, form: { gap: 16 }, forgot: { color: Theme.colors.muted, fontSize: 13, textAlign: 'right' }, actions: { gap: 20 }, divider: { flexDirection: 'row', alignItems: 'center', gap: 16 }, line: { flex: 1, height: 1, backgroundColor: Theme.colors.border }, or: { color: Theme.colors.muted, fontSize: 13 }, terms: { color: Theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', paddingTop: 4 } });
