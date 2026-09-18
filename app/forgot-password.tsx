import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { Fonts } from '@/constants/theme';
import { authErrorMessage } from '@/lib/authMessages';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (loading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('กรุณากรอกอีเมลให้ถูกต้อง'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: Linking.createURL('reset-password') });
      if (resetError) setError(authErrorMessage(resetError));
      else setMessage('หากอีเมลนี้มีบัญชีอยู่ เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้ กรุณาตรวจกล่องจดหมาย');
    } catch { setError('ส่งอีเมลไม่สำเร็จ กรุณาลองอีกครั้ง'); }
    finally { setLoading(false); }
  };

  return <AuthScreenShell title="ลืมรหัสผ่าน?" description="กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ">
    <AppInput tone="dark" label="อีเมล" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com" error={error} onSubmitEditing={send} />
    {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
    <AppButton title={loading ? 'กำลังส่ง...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'} disabled={loading} onPress={send} style={styles.button} />
    <Pressable accessibilityRole="button" onPress={() => router.replace('/login')} style={styles.backButton}><Text style={styles.backText}>กลับไปเข้าสู่ระบบ</Text></Pressable>
  </AuthScreenShell>;
}

const styles = StyleSheet.create({ message: { color: '#D1FFDF', backgroundColor: 'rgba(39,146,94,0.2)', borderWidth: 1, borderColor: 'rgba(128,221,161,0.45)', borderRadius: 14, padding: 14, fontSize: 14, lineHeight: 23 }, button: { minHeight: 56, borderRadius: 28 }, backButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' }, backText: { color: '#FF9FC2', fontFamily: Fonts.sansSemiBold, fontSize: 14 } });
