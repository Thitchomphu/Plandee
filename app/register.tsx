import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { Fonts } from '@/constants/theme';
import { signUpWithPassword } from '@/lib/auth';
import { authErrorMessage } from '@/lib/authMessages';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    if (!email.trim() || !password || !confirm) { setError('กรุณากรอกข้อมูลให้ครบ'); return; }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data, error: authError } = await signUpWithPassword(email, password);
      if (authError) { setError(authErrorMessage(authError)); return; }
      if (!data.session) { setSuccess('สมัครสมาชิกสำเร็จ กรุณาตรวจอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ'); return; }
      router.replace('/(tabs)');
    } catch { setError('สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง'); }
    finally { setLoading(false); }
  };

  return <AuthScreenShell title="เริ่มแผนของคุณ" description="สร้างบัญชีเพื่อดูแลทุกช่วงเวลาสำคัญในที่เดียว">
    <View style={styles.form}>
      <AppInput tone="dark" label="อีเมล" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" autoCapitalize="none" placeholder="you@example.com" />
      <AppInput tone="dark" label="รหัสผ่าน" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder="อย่างน้อย 6 ตัวอักษร" />
      <AppInput tone="dark" label="ยืนยันรหัสผ่าน" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" placeholder="พิมพ์รหัสผ่านอีกครั้ง" error={error} onSubmitEditing={submit} />
      {success ? <Text accessibilityRole="alert" style={styles.success}>{success}</Text> : null}
    </View>
    <View style={styles.actions}>
      <AppButton title={loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'} disabled={loading || !!success} onPress={submit} style={styles.primaryButton} />
      {success ? <Pressable accessibilityRole="button" onPress={() => router.replace('/login')} style={styles.switchButton}><Text style={styles.switchAccent}>ไปหน้าเข้าสู่ระบบ</Text></Pressable> : <Pressable accessibilityRole="button" onPress={() => router.replace('/login')} style={styles.switchButton}><Text style={styles.switchText}>มีบัญชีอยู่แล้ว? <Text style={styles.switchAccent}>เข้าสู่ระบบ</Text></Text></Pressable>}
    </View>
  </AuthScreenShell>;
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  success: { color: '#D1FFDF', backgroundColor: 'rgba(39,146,94,0.2)', borderWidth: 1, borderColor: 'rgba(128,221,161,0.45)', borderRadius: 14, padding: 14, fontSize: 14, lineHeight: 23 },
  actions: { gap: 12 },
  primaryButton: { minHeight: 56, borderRadius: 28 },
  switchButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  switchText: { color: '#D7B9C8', fontFamily: Fonts.sans, fontSize: 14 },
  switchAccent: { color: '#FF9FC2', fontFamily: Fonts.sansSemiBold, fontSize: 14 },
});
