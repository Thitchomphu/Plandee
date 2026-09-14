import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { events } from '@/data/events';
import { getSeller } from '@/data/sellers';

const money = (value: number) => `฿${value.toLocaleString('en-US')}`;
export default function SellerDetailScreen() {
  const { eventId = events[0].id, sellerId = '' } = useLocalSearchParams<{ eventId?: string; sellerId?: string }>();
  const seller = getSeller(eventId, sellerId);
  if (!seller) return <SafeAreaView style={styles.safe}><Text style={styles.empty}>ไม่พบข้อมูล seller</Text></SafeAreaView>;
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()} hitSlop={8}><Text style={styles.back}>‹ seller</Text></Pressable>
    <View style={styles.hero}><View style={styles.icon}><Text style={styles.iconText}>S</Text></View><Text style={styles.title}>{seller.name}</Text><Text style={styles.category}>{seller.category}</Text><Text style={styles.status}>{seller.status}</Text></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>ข้อมูลติดต่อ</Text><Info label="โทรศัพท์" value={seller.phone} /><Info label="อีเมล" value={seller.email} /></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>รายละเอียดการชำระเงิน</Text><View style={styles.paymentRow}><Text style={styles.label}>ราคาที่ตั้งไว้</Text><Text style={styles.amount}>{money(seller.price)}</Text></View><View style={styles.paymentRow}><Text style={styles.label}>จ่ายแล้ว</Text><Text style={[styles.amount, { color: Theme.colors.success }]}>{money(seller.paid)}</Text></View><View style={styles.paymentRow}><Text style={styles.label}>คงเหลือ</Text><Text style={styles.amount}>{money(Math.max(seller.price - seller.paid, 0))}</Text></View><Text style={styles.note}>{seller.note}</Text></View>
    <Text style={styles.sectionTitle}>เชื่อมโยงข้อมูล</Text><View style={styles.links}><LinkButton label="ดูเช็คลิสต์" onPress={() => router.push({ pathname: '/event/checklist', params: { eventId } })} /><LinkButton label="ดูงบประมาณ" onPress={() => router.push({ pathname: '/event/budget', params: { eventId } })} /></View>
  </ScrollView></SafeAreaView>;
}
function Info({ label, value }: { label: string; value: string }) { return <View style={styles.info}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
function LinkButton({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.linkButton}><Text style={styles.linkText}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 20, paddingBottom: 40, gap: 16 }, back: { color: Theme.colors.primary, fontSize: 14, fontWeight: '700', minHeight: 36 }, hero: { alignItems: 'center', backgroundColor: Theme.colors.primarySoft, borderRadius: 22, padding: 22, gap: 7 }, icon: { width: 62, height: 62, borderRadius: 20, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }, iconText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' }, title: { color: Theme.colors.text, fontSize: 23, fontWeight: '800' }, category: { color: Theme.colors.muted, fontSize: 13 }, status: { color: '#966016', backgroundColor: '#FFF1DA', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6, fontSize: 11, fontWeight: '700', marginTop: 4 }, section: { backgroundColor: Theme.colors.surface, borderRadius: 18, borderWidth: 1, borderColor: Theme.colors.border, padding: 16, gap: 13 }, sectionTitle: { color: Theme.colors.text, fontSize: 17, fontWeight: '800' }, info: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, label: { color: Theme.colors.muted, fontSize: 12 }, value: { flex: 1, color: Theme.colors.text, fontSize: 13, textAlign: 'right' }, paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, amount: { color: Theme.colors.text, fontSize: 15, fontWeight: '800' }, note: { color: Theme.colors.muted, fontSize: 12, lineHeight: 18, borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 12 }, links: { flexDirection: 'row', gap: 10 }, linkButton: { flex: 1, minHeight: 48, borderRadius: 15, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' }, linkText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' }, empty: { color: Theme.colors.muted, textAlign: 'center', padding: 30 } });
