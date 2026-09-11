import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { AppButton } from '@/components/AppButton';

const logo = 'https://www.figma.com/api/mcp/asset/de286ff3-a832-4772-9559-be193ad2f21a.svg';

export default function SplashScreen() {
  return <SafeAreaView style={styles.safe}><View style={styles.content}><View style={styles.logoGroup}><Image source={logo} style={styles.logo} contentFit="contain" /><Text style={styles.brand}>Plandee</Text><Text style={styles.tagline}>วางแผนอีเวนต์ในฝันของคุณ</Text><Text style={styles.subtagline}>ให้เป็นเรื่องง่ายในพริบตาเดียว</Text></View><View style={styles.actions}><AppButton title="เริ่มต้นใช้งาน" onPress={() => router.push('/register')} /><Pressable accessibilityRole="button" onPress={() => router.push('/login')} style={styles.loginLink}><Text style={styles.loginText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text></Pressable></View></View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 24 }, logoGroup: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, logo: { width: 80, height: 80 }, brand: { color: Theme.colors.primary, fontSize: 36, fontWeight: '800' }, tagline: { color: Theme.colors.text, fontSize: 16, marginTop: 12 }, subtagline: { color: Theme.colors.muted, fontSize: 15 }, actions: { gap: 8 }, loginLink: { minHeight: 48, alignItems: 'center', justifyContent: 'center' }, loginText: { color: Theme.colors.muted, fontSize: 14 } });
