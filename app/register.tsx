import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

const logo = 'https://www.figma.com/api/mcp/asset/1b51e38d-ad4e-48b1-b164-c48997100de7.svg';

export default function RegisterScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [error, setError] = useState('');
  const submit = () => { if (!email.trim() || !password.trim() || !confirm.trim()) { setError('กรุณากรอกข้อมูลให้ครบ'); return; } if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return; } setError(''); router.replace('/(tabs)'); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.header}><Image source={logo} style={styles.logo} contentFit="contain" /><Text style={styles.brand}>Plandee</Text><Text style={styles.subtitle}>สร้างบัญชีเพื่อเริ่มวางแผนอีเวนต์</Text></View><View style={styles.tabs}><Pressable onPress={() => router.replace('/login')} style={styles.tab}><Text style={styles.inactiveText}>เข้าสู่ระบบ</Text></Pressable><View style={styles.tabActive}><Text style={styles.activeText}>สมัครสมาชิก</Text><View style={styles.indicator} /></View></View><View style={styles.form}><AppInput label="อีเมล" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" /><AppInput label="รหัสผ่าน" value={password} onChangeText={setPassword} secureTextEntry placeholder="อย่างน้อย 6 ตัวอักษร" /><AppInput label="ยืนยันรหัสผ่าน" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="พิมพ์รหัสผ่านอีกครั้ง" error={error} /></View><View style={styles.actions}><AppButton title="สมัครสมาชิก" onPress={submit} /><Pressable onPress={() => router.replace('/login')} style={styles.redirect}><Text style={styles.redirectText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text></Pressable></View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.surface }, content: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 24, gap: 24 }, header: { alignItems: 'center', gap: 8 }, logo: { width: 80, height: 80 }, brand: { color: Theme.colors.primary, fontSize: 28, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 14 }, tabs: { flexDirection: 'row' }, tab: { flex: 1, alignItems: 'center', paddingVertical: 8 }, tabActive: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 4 }, activeText: { color: Theme.colors.primary, fontSize: 18, fontWeight: '700' }, inactiveText: { color: Theme.colors.placeholder, fontSize: 18, fontWeight: '700' }, indicator: { width: '100%', height: 3, backgroundColor: Theme.colors.primary, borderRadius: 2 }, form: { gap: 16 }, actions: { gap: 14 }, redirect: { minHeight: 44, alignItems: 'center', justifyContent: 'center' }, redirectText: { color: Theme.colors.muted, fontSize: 13 } });
