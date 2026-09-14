import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { events } from '@/data/events';
import { getSellers, Seller, SellerStatus } from '@/data/sellers';

const money = (value: number) => `฿${value.toLocaleString('en-US')}`;
const statusColors: Record<SellerStatus, { text: string; background: string }> = { 'กำลังเจรจา': { text: '#966016', background: '#FFF1DA' }, 'ยังไม่เริ่ม': { text: Theme.colors.muted, background: '#F2EFF4' }, 'จ่ายมัดจำแล้ว': { text: Theme.colors.success, background: '#DFF6EE' } };

export default function SellersScreen() {
  const { eventId = events[0].id } = useLocalSearchParams<{ eventId?: string }>();
  const event = events.find((item) => item.id === eventId) ?? events[0];
  const sellers = getSellers(event.id);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={() => router.back()} hitSlop={8}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.headerTitle}>seller</Text><View style={styles.headerSpacer} /></View>
    <Text style={styles.title}>seller ของงาน</Text><Text style={styles.subtitle}>{event.title}</Text>
    <View style={styles.summary}><Text style={styles.summaryValue}>{sellers.length}</Text><Text style={styles.summaryLabel}>seller ที่เชื่อมกับเช็คลิสต์และงบประมาณ</Text></View>
    <View style={styles.links}><LinkButton label="เช็คลิสต์" onPress={() => router.push({ pathname: '/event/checklist', params: { eventId: event.id } })} /><LinkButton label="งบประมาณ" onPress={() => router.push({ pathname: '/event/budget', params: { eventId: event.id } })} /></View>
    <Text style={styles.section}>รายการ seller</Text>
    {sellers.length ? sellers.map((seller) => <SellerCard key={seller.id} seller={seller} onPress={() => router.push({ pathname: '/event/seller-detail', params: { eventId: event.id, sellerId: seller.id } })} />) : <Text style={styles.empty}>ยังไม่มี seller จากงานนี้</Text>}
  </ScrollView></SafeAreaView>;
}

function SellerCard({ seller, onPress }: { seller: Seller; onPress: () => void }) { const colors = statusColors[seller.status]; return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View style={styles.cardTop}><View style={styles.sellerIcon}><Text style={styles.sellerIconText}>S</Text></View><View style={styles.cardMain}><Text style={styles.sellerName}>{seller.name}</Text><Text style={styles.category}>{seller.category}</Text></View><Text style={styles.chevron}>›</Text></View><View style={styles.cardBottom}><Text style={styles.price}>{money(seller.price)}</Text><Text style={[styles.status, { color: colors.text, backgroundColor: colors.background }]}>{seller.status}</Text></View></Pressable>; }
function LinkButton({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.linkButton}><Text style={styles.linkText}>{label} ›</Text></Pressable>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 20, paddingBottom: 40, gap: 14 }, header: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { color: Theme.colors.text, fontSize: 30, lineHeight: 32 }, headerTitle: { color: Theme.colors.text, fontSize: 17, fontWeight: '800' }, headerSpacer: { width: 30 }, title: { color: Theme.colors.text, fontSize: 25, fontWeight: '800', marginTop: 4 }, subtitle: { color: Theme.colors.muted, fontSize: 13 }, summary: { backgroundColor: Theme.colors.primarySoft, borderRadius: 20, padding: 18, gap: 4 }, summaryValue: { color: Theme.colors.primary, fontSize: 28, fontWeight: '800' }, summaryLabel: { color: Theme.colors.muted, fontSize: 12 }, links: { flexDirection: 'row', gap: 10 }, linkButton: { flex: 1, minHeight: 44, borderRadius: 14, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center' }, linkText: { color: Theme.colors.primary, fontSize: 13, fontWeight: '700' }, section: { color: Theme.colors.text, fontSize: 17, fontWeight: '800', marginTop: 4 }, card: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 20, padding: 16, gap: 14 }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, sellerIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: Theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, sellerIconText: { color: Theme.colors.primary, fontSize: 20, fontWeight: '800' }, cardMain: { flex: 1, gap: 3 }, sellerName: { color: Theme.colors.text, fontSize: 15, fontWeight: '800' }, category: { color: Theme.colors.muted, fontSize: 12 }, chevron: { color: Theme.colors.muted, fontSize: 26 }, cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, price: { color: Theme.colors.text, fontSize: 15, fontWeight: '700' }, status: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, fontSize: 11, fontWeight: '700' }, empty: { color: Theme.colors.muted, textAlign: 'center', padding: 30 }, pressed: { opacity: 0.8 } });
