import type { ReactNode } from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { AuthBrand } from '@/components/AuthBrand';
import { PremiumBackdrop } from '@/components/PremiumBackdrop';
import { Fonts } from '@/constants/theme';

export function AuthScreenShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <SafeAreaView style={styles.safe}>
    <StatusBar style="light" />
    <PremiumBackdrop />
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="กลับหน้าเริ่มต้น" onPress={() => router.replace('/')} style={styles.back}><FontAwesome6 name="arrow-left" size={13} color="#FFEAF2" /><Text style={styles.backText}>หน้าเริ่มต้น</Text></Pressable>
        <Text style={styles.topLabel}>EVENT PLANNER</Text>
      </View>
      <AuthBrand subtitle="Plan it. Track it. Make it happen." />
      <View style={styles.intro}><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text></View>
      {children}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#211323', overflow: 'hidden' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 36, gap: 24 },
  topRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 9, paddingRight: 10 },
  backText: { color: '#FFEAF2', fontFamily: Fonts.sansMedium, fontSize: 14 },
  topLabel: { color: '#CBA4B6', fontFamily: Fonts.sansMedium, fontSize: 12, letterSpacing: 1.5 },
  intro: { gap: 8 },
  title: { color: '#FFF1F7', fontFamily: Fonts.sansSemiBold, fontSize: 24 },
  description: { color: '#CFACBF', fontFamily: Fonts.sans, fontSize: 16, lineHeight: 24 },
});
