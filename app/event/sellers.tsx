import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { EventPageHeader } from '@/components/EventPageHeader';
import { events } from '@/data/events';
import { getSellers, Seller, SellerStatus } from '@/data/sellers';

const money = (value: number) => `฿${value.toLocaleString('en-US')}`;
const statusColors: Record<SellerStatus, { text: string; background: string }> = { 'กำลังเจรจา': { text: Theme.colors.warningText, background: Theme.colors.warningSoft }, 'ยังไม่เริ่ม': { text: Theme.colors.muted, background: Theme.colors.input }, 'จ่ายมัดจำแล้ว': { text: Theme.colors.success, background: Theme.colors.mint } };

export default function SellersScreen() {
  const { eventId = events[0].id } = useLocalSearchParams<{ eventId?: string }>();
  const event = events.find((item) => item.id === eventId) ?? events[0];
  const sellers = getSellers(event.id);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <EventPageHeader title="ผู้ให้บริการ" backLabel="กลับภาพรวมงาน" onBack={() => router.back()} />
    <Text style={styles.title}>ผู้ให้บริการของงาน</Text><Text style={styles.subtitle}>{event.title}</Text>
    <View style={styles.summary}><Text style={styles.summaryValue}>{sellers.length}</Text><Text style={styles.summaryLabel}>ผู้ให้บริการที่เชื่อมกับเช็กลิสต์และงบประมาณ</Text></View>
    <Text style={styles.section}>รายชื่อผู้ให้บริการ</Text>
    {sellers.length ? sellers.map((seller) => <SellerCard key={seller.id} seller={seller} onPress={() => router.push({ pathname: '/event/seller-detail', params: { eventId: event.id, sellerId: seller.id } })} />) : <Text style={styles.empty}>ยังไม่มีผู้ให้บริการในงานนี้ เพิ่มชื่อผู้ให้บริการในเช็กลิสต์หรือรายการงบประมาณก่อน</Text>}
  </ScrollView></SafeAreaView>;
}

function SellerCard({ seller, onPress }: { seller: Seller; onPress: () => void }) { const colors = statusColors[seller.status]; return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View style={styles.cardTop}><View style={styles.sellerIcon}><Text style={styles.sellerIconText}>S</Text></View><View style={styles.cardMain}><Text style={styles.sellerName}>{seller.name}</Text><Text style={styles.category}>{seller.category}</Text></View><Text style={styles.chevron}>›</Text></View><View style={styles.cardBottom}><Text style={styles.price}>{money(seller.price)}</Text><Text style={[styles.status, { color: colors.text, backgroundColor: colors.background }]}>{seller.status}</Text></View></Pressable>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.xl, paddingBottom: 40, gap: Theme.spacing.lg },
  title: { color: Theme.colors.text, fontSize: Theme.type.page, fontWeight: '800', marginTop: 4 },
  subtitle: { color: Theme.colors.muted, fontSize: Theme.type.label },
  summary: { backgroundColor: Theme.colors.primarySoft, borderRadius: 20, padding: 18, gap: 6 },
  summaryValue: { color: Theme.colors.primary, fontSize: 28, fontWeight: '800' },
  summaryLabel: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  section: { color: Theme.colors.text, fontSize: Theme.type.section, fontWeight: '800', marginTop: 4 },
  card: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 20, padding: 16, gap: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: Theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  sellerIconText: { color: Theme.colors.primary, fontSize: 20, fontWeight: '800' },
  cardMain: { flex: 1, gap: 3 },
  sellerName: { color: Theme.colors.text, fontSize: 16, fontWeight: '800' },
  category: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  chevron: { color: Theme.colors.muted, fontSize: 26 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  price: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' },
  status: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, fontSize: Theme.type.micro, fontWeight: '700' },
  empty: { color: Theme.colors.muted, textAlign: 'center', padding: 30, fontSize: Theme.type.body },
  pressed: { opacity: 0.8 },
});
