import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { Theme } from '@/constants/theme';
import { authErrorMessage } from '@/lib/authMessages';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const url = Linking.useURL();
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const hash = url?.split('#')[1] ?? '';
      const tokens = new URLSearchParams(hash);
      let recoveryError: { message: string } | null = null;
      let hasRecoveryToken = false;
      if (tokens.get('access_token') && tokens.get('refresh_token')) {
        hasRecoveryToken = true;
        const result = await supabase.auth.setSession({ access_token: tokens.get('access_token')!, refresh_token: tokens.get('refresh_token')! });
        recoveryError = result.error;
      } else if (params.token_hash && params.type === 'recovery') {
        hasRecoveryToken = true;
        const result = await supabase.auth.verifyOtp({ token_hash: params.token_hash, type: 'recovery' });
        recoveryError = result.error;
      }
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!hasRecoveryToken || recoveryError || !data.session) setError('ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่');
      else setReady(true);
    })();
    return () => { active = false; };
  }, [url, params.token_hash, params.type]);

  const save = async () => {
    if (saving) return;
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return; }
    setSaving(true); setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) setError(authErrorMessage(updateError));
      else setSuccess(true);
    } catch { setError('ตั้งรหัสผ่านไม่สำเร็จ กรุณาลองอีกครั้ง'); }
    finally { setSaving(false); }
  };

  return <AuthScreenShell title="ตั้งรหัสผ่านใหม่" description="เพื่อให้บัญชีของคุณปลอดภัย กรุณาเลือกรหัสผ่านใหม่">
    {success ? <><Text style={styles.description}>เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</Text><AppButton title="ไปหน้าเข้าสู่ระบบ" onPress={() => router.replace('/login')} style={styles.button} /></> : ready ? <>
      <Text style={styles.description}>ตั้งรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร</Text>
      <AppInput tone="dark" label="รหัสผ่านใหม่" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
      <AppInput tone="dark" label="ยืนยันรหัสผ่านใหม่" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" error={error} />
      <AppButton title={saving ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'} disabled={saving} onPress={save} style={styles.button} />
    </> : error ? <><Text accessibilityRole="alert" style={styles.error}>{error}</Text><AppButton title="ขอลิงก์ใหม่" onPress={() => router.replace('/forgot-password')} style={styles.button} /></> : <ActivityIndicator color={Theme.colors.primary} />}
  </AuthScreenShell>;
}

const styles = StyleSheet.create({ description: { color: '#D7B9C8', fontSize: 15, lineHeight: 24 }, error: { color: '#FFB6C8', fontSize: 14 }, button: { minHeight: 56, borderRadius: 28 } });
