import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { Fonts } from '@/constants/theme';
import { signInWithGoogle, signInWithPassword } from '@/lib/auth';
import { authErrorMessage } from '@/lib/authMessages';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    if (!email.trim() || !password) { setError('กรุณากรอกอีเมลและรหัสผ่าน'); return; }
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await signInWithPassword(email, password);
      if (authError) { setError(authErrorMessage(authError)); return; }
      router.replace('/(tabs)');
    } catch { setError('เชื่อมต่อไม่ได้ กรุณาลองอีกครั้ง'); }
    finally { setLoading(false); }
  };

  const googleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) { setError(authErrorMessage(authError)); return; }
      router.replace('/(tabs)');
    } catch { setError('เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง'); }
    finally { setLoading(false); }
  };

  return <AuthScreenShell title="ยินดีต้อนรับกลับ" description="เข้าสู่ระบบเพื่อจัดการแผนงานของคุณ">
    <View style={styles.form}>
      <AppInput tone="dark" label="อีเมล" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" autoCapitalize="none" placeholder="you@example.com" />
      <AppInput tone="dark" label="รหัสผ่าน" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" placeholder="รหัสผ่าน" error={error} onSubmitEditing={submit} />
      <Pressable accessibilityRole="button" onPress={() => router.push('/forgot-password')} style={styles.forgotButton}><Text style={styles.forgot}>ลืมรหัสผ่าน?</Text></Pressable>
    </View>
    <View style={styles.actions}>
      <AppButton title={loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'} disabled={loading} onPress={submit} style={styles.primaryButton} />
      <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>หรือ</Text><View style={styles.line} /></View>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading }} disabled={loading} onPress={() => { void googleLogin(); }} style={({ pressed }) => [styles.googleButton, pressed && styles.pressed, loading && styles.disabled]}><Text style={styles.googleIcon}>G</Text><Text style={styles.googleText}>ดำเนินการต่อด้วย Google</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/register')} style={styles.switchButton}><Text style={styles.switchText}>ยังไม่มีบัญชี? <Text style={styles.switchAccent}>สมัครสมาชิก</Text></Text></Pressable>
    </View>
  </AuthScreenShell>;
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  forgotButton: { minHeight: 36, alignSelf: 'flex-end', justifyContent: 'center' },
  forgot: { color: '#FF9FC2', fontFamily: Fonts.sansSemiBold, fontSize: 14 },
  actions: { gap: 13 },
  primaryButton: { minHeight: 56, borderRadius: 28 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,221,237,0.19)' },
  or: { color: '#C6A9B9', fontFamily: Fonts.sans, fontSize: 13 },
  googleButton: { minHeight: 54, borderRadius: 27, borderWidth: 1, borderColor: 'rgba(255,225,239,0.44)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  googleIcon: { color: '#FFFFFF', fontFamily: Fonts.sansBold, fontSize: 17 },
  googleText: { color: '#FFF1F7', fontFamily: Fonts.sansMedium, fontSize: 15 },
  switchButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  switchText: { color: '#D7B9C8', fontFamily: Fonts.sans, fontSize: 14 },
  switchAccent: { color: '#FF9FC2', fontFamily: Fonts.sansSemiBold },
  pressed: { opacity: 0.75 }, disabled: { opacity: 0.5 },
});
