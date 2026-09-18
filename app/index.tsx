import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { PremiumBackdrop } from '@/components/PremiumBackdrop';
import { Fonts } from '@/constants/theme';

export default function WelcomeScreen() {
  const [reveal] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then((reduced) => {
      if (!active) return;
      if (reduced) reveal.setValue(1);
      else Animated.timing(reveal, { toValue: 1, duration: 550, useNativeDriver: true }).start();
    });
    return () => { active = false; reveal.stopAnimation(); };
  }, [reveal]);
  return <SafeAreaView style={styles.safe}>
    <StatusBar style="light" />
    <PremiumBackdrop />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <View><View style={styles.accentLine} /><Text style={styles.sideCopy}>EVENTS{'\n'}PEOPLE{'\n'}IDEAS{'\n'}TOGETHER</Text></View>
        <Text style={styles.topLabel}>EVENT PLANNER</Text>
      </View>
      <Animated.View style={[styles.hero, { opacity: reveal, transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
        <Image source={require('@/assets/images/plandee-premium-mark.png')} style={styles.mark} contentFit="contain" cachePolicy="memory-disk" transition={0} accessibilityLabel="โลโก้ Plandee" />
        <Text style={styles.wordmark}>PLANDEE</Text>
        <Text style={styles.tagline}>Plan it. Track it. Make it happen.</Text>
        <View style={styles.heroRule} />
      </Animated.View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/register')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <LinearGradient pointerEvents="none" colors={['#F35A96', '#D42D73']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          <Text style={styles.primaryText}>เริ่มต้นใช้งาน</Text><FontAwesome6 name="arrow-right" size={16} color="#FFFFFF" />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/login')} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryText}>เข้าสู่ระบบ</Text></Pressable>
        <Text style={styles.footer}>MAKE EVERY MOMENT COUNT</Text>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#211323', overflow: 'hidden' },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 24, justifyContent: 'space-between', gap: 24 },
  topRow: { minHeight: 104, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  accentLine: { height: 25, width: 1, backgroundColor: '#EE8AAD', marginBottom: 9 },
  sideCopy: { color: '#D8A8BE', fontFamily: Fonts.sansMedium, fontSize: 12, lineHeight: 20, letterSpacing: 1.5 },
  topLabel: { color: '#E8BBD1', fontFamily: Fonts.sansMedium, fontSize: 12, letterSpacing: 1.6, paddingTop: 8 },
  hero: { alignItems: 'center', gap: 10, paddingVertical: 10 },
  mark: { width: 190, height: 190, marginBottom: 8 },
  wordmark: { color: '#FFE5EF', fontFamily: Fonts.sansMedium, fontSize: 35, letterSpacing: 9, paddingLeft: 9, textAlign: 'center' },
  tagline: { color: '#DDC1CF', fontFamily: Fonts.sans, fontSize: 14, letterSpacing: 0.7, textAlign: 'center' },
  heroRule: { width: 42, height: 3, borderRadius: 2, backgroundColor: '#EC7EAA', marginTop: 29 },
  actions: { gap: 12 },
  primaryButton: { minHeight: 58, borderRadius: 30, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  primaryText: { color: '#FFFFFF', fontFamily: Fonts.sansSemiBold, fontSize: 17 },
  secondaryButton: { minHeight: 56, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,225,239,0.58)', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#FFF1F7', fontFamily: Fonts.sansMedium, fontSize: 16 },
  footer: { color: '#BB92A7', fontFamily: Fonts.sansMedium, fontSize: 12, textAlign: 'center', letterSpacing: 1.5, marginTop: 8 },
  pressed: { opacity: 0.8 },
});
